import { FormGroupProps } from '.'
import { zUser } from '@/contracts/data'
import { UpdateHistory, zUpdateHistory } from '@/models/models'
import { useFetch } from '@/util/hooks'
import { useMutation } from '@tanstack/react-query'
import deepEqual from 'deep-equal'
import { useEffect, useState } from 'react'
import { FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'
import z from 'zod'

export interface FormProps<T> {
    zodSchema: z.ZodObject
    initialValue: T
    setInitialValue: (value: T) => void
    currentValue: T
    setCurrentValue: (value: T) => void
    computeTitle: (value: T) => string
    patchEndpoint: string
    postEndpoint?: string
    onChangesSaved?: (value: T) => void
    updateHistory?: boolean
    children?:
        | React.ReactElement<FormGroupProps>
        | React.ReactElement<FormGroupProps>[]
}

function capitalizeFirst(str: string) {
    return str[0].toUpperCase() + str.substring(1)
}

function flatten(obj: object): Record<string, unknown> {
    console.log('flattening')
    const res = Object.entries(obj).reduce(
        (map, current) => {
            const key = current[0]
            let value = current[1] as unknown
            //console.log(map, key, value, typeof value)
            if (Array.isArray(value) && value.length > 0) value = value[0]
            if (value && typeof value === 'object') {
                const res = flatten(value)
                const transformedVals = Object.entries(res).reduce(
                    (mapTr, currentTr) => {
                        //console.log(currentTr)
                        const [keyTr, valueTr] = currentTr
                        if (Object.keys(map).includes(keyTr)) {
                            //console.log(key + capitalizeFirst(keyTr))
                            mapTr[key + capitalizeFirst(keyTr)] = valueTr
                        } else mapTr[keyTr] = valueTr
                        return mapTr
                    },
                    {} as Record<string, unknown>
                )
                console.log('transformed vals', transformedVals)
                return { ...map, ...transformedVals }
            }
            map[key] = value
            return map
        },
        {} as Record<string, unknown>
    )
    console.log(res)
    return res
}

/*const getHistoryUpdatedAt = (update: Partial<IMongoDocumentUpdate>) =>
    new Date(update.updated_at as unknown as string)*/

export function Form<T extends { id: number }>({
    zodSchema,
    initialValue,
    setInitialValue,
    currentValue,
    setCurrentValue,
    computeTitle,
    patchEndpoint,
    onChangesSaved,
    updateHistory,
    children = [],
}: FormProps<T>) {
    const [patchMap, setPatchMap] = useState<Record<string, unknown>>({})
    const [invalidMap, setInvalidMap] = useState<Record<string, boolean>>({})
    const [editMode, setEditMode] = useState(false)
    const { onGet, onPatch } = useFetch()

    const [updateHistoryList, setUpdateHistoryList] =
        useState<UpdateHistory<T>[]>()

    const invalid = Object.values(invalidMap).length > 0
    const equal = Object.values(patchMap).length == 0

    const mutation = useMutation<T, Error, unknown>({
        mutationKey: [patchEndpoint, currentValue.id],
        async mutationFn(payload) {
            if (!payload) throw Error('no payload defined')
            const res = await onPatch<T>(patchEndpoint, payload, zodSchema)

            return res
        },
        onSuccess(data) {
            setInitialValue({ ...data })
            setCurrentValue({ ...data })
            setPatchMap({})
            setInvalidMap({})
            onChangesSaved?.({ ...data })
        },
        onError(e) {
            console.error('Failed to mutate:', e)
            alert(`Error: ${e?.message ?? e}`)
        },
    })

    useEffect(() => {
        onGet<UpdateHistory<T>[]>(
            `/users/${initialValue.id}/update-history`,
            z.array(zUpdateHistory(zUser))
        )
            .then((res) => setUpdateHistoryList(res))
            .catch((err) => console.error(err))
    }, [initialValue, onGet])

    const saveChanges = async () => {
        //this is where history updates should log
        await mutation.mutateAsync({
            ...patchMap,
            id: currentValue.id,
        })
        setEditMode(false)
    }

    const discardChanges = () => {
        setCurrentValue({ ...initialValue })
        setPatchMap({})
        setInvalidMap({})
        setEditMode(false)
    }

    useEffect(() => setEditMode(false), [initialValue])

    const handleUpdate = (
        field: string,
        value: unknown,
        patchValue: unknown,
        valid: boolean
    ) => {
        const prev = flatten(initialValue)[field]
        const hasField = (map: unknown) =>
            Object.prototype.hasOwnProperty.call(map, field)

        if (deepEqual(prev, value) || (!prev && !value)) {
            if (hasField(patchMap)) {
                delete patchMap[field]
                setPatchMap({ ...patchMap })
            }
        } else {
            setPatchMap({ ...patchMap, [field]: patchValue })
        }

        if (valid) {
            if (hasField(invalidMap)) {
                delete invalidMap[field]
                setPatchMap({ ...invalidMap })
            }
        } else {
            setInvalidMap({ ...invalidMap, [field]: true })
        }

        setCurrentValue({ ...currentValue, [field]: value })
    }

    const groups = Array.isArray(children) ? children : [children]

    const hydratedGroups = groups.map((group) => ({
        ...group,
        props: {
            ...group.props,
            dynamic: {
                ...group.props.dynamic,
                value: group.props.dynamic?.value ?? flatten(currentValue),
                disabled: group.props.dynamic?.disabled ?? !editMode,
                loading: group.props.dynamic?.loading ?? mutation.isPending,
                onUpdate: group.props.dynamic?.onUpdate ?? handleUpdate,
            },
        },
    }))

    return (
        <form
            className="p-6"
            onSubmit={(e) => {
                e.preventDefault()
            }}
        >
            <header className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    {computeTitle(currentValue)}
                </h1>
                <div className="flex items-center gap-2">
                    {editMode ? (
                        <>
                            <button
                                onClick={() => void saveChanges()}
                                disabled={equal || invalid}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-sky-600 bg-sky-500 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:border-[hsl(200,68%,39%)] disabled:bg-[hsl(201,66%,32%)]"
                            >
                                <FaSave /> Save Changes
                            </button>
                            <button
                                onClick={discardChanges}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-600 bg-red-500 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:border-[hsl(0,42%,55%)] disabled:bg-[hsl(0,54%,60%)]"
                            >
                                <FaTrashAlt /> Discard Changes
                            </button>{' '}
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-sky-600 bg-sky-500 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:border-[hsl(200,68%,39%)] disabled:bg-[hsl(201,66%,32%)]"
                            >
                                <FaEdit /> Edit
                            </button>
                        </>
                    )}
                </div>
            </header>
            {hydratedGroups}
            {updateHistory &&
                updateHistoryList &&
                updateHistoryList.length > 0 && (
                    <section>
                        <h2 className="my-4 text-xl font-semibold">
                            Update History
                        </h2>
                        <div className="grid grid-cols-3 gap-2 gap-x-4">
                            {updateHistoryList.map((update, updateIndex) => (
                                <UpdateHistoryEntry
                                    key={updateIndex}
                                    {...update}
                                />
                            ))}
                        </div>
                    </section>
                )}
        </form>
    )
}

function UpdateHistoryEntry<T extends { id: number }>(
    update: UpdateHistory<T>
) {
    return (
        <div className="contents">
            <div>
                <span>Update Type: {update.type}</span>
                <span>Updated At: {update.whenUpdatedUtc.toDateString()}</span>
                <span>Updater Id: {update.whoUpdatedId}</span>
            </div>
            <div>
                {Object.entries(update).map((value, index) => {
                    const keys = Object.keys(update)
                    if (
                        !['type', 'whoUpdatedId', 'whoUpdatedUtc'].includes(
                            keys[index]
                        )
                    ) {
                        return (
                            <span key={value.toString()}>
                                {keys[index]}: {value.toString()}
                            </span>
                        )
                    }
                })}
            </div>
        </div>
    )
}
