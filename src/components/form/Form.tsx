import { FormGroupProps } from '.'
import { IDocumentUpdate } from '@/models/DocumentUpdate'
import { IUser } from '@/models/User'
import { useMutation, useQuery } from '@tanstack/react-query'
import deepEqual from 'deep-equal'
import { Document } from 'mongoose'
import { useEffect, useState } from 'react'
import { FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'

export interface FormProps<
    T extends Document & { updateHistory?: IDocumentUpdate[] },
> {
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

const getHistoryUpdatedAt = (update: Partial<IDocumentUpdate>) =>
    new Date(update.updated_at as unknown as string)

export function Form<
    T extends Document & { updateHistory?: IDocumentUpdate[] },
>({
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

    const invalid = Object.values(invalidMap).length > 0
    const equal = Object.values(patchMap).length == 0

    const mutation = useMutation<T, Error, unknown>({
        mutationKey: [patchEndpoint, currentValue._id],
        async mutationFn(payload) {
            const res = await fetch(patchEndpoint, {
                headers: {
                    'content-type': 'application/json',
                },
                method: 'PATCH',
                body: JSON.stringify(payload),
            })

            return (await res.json()) as T
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

    const saveChanges = async () => {
        await mutation.mutateAsync({
            ...patchMap,
            id: currentValue._id,
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
        const prev = (initialValue as Record<string, unknown>)[field]
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
                setInvalidMap({ ...invalidMap })
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
                value: group.props.dynamic?.value ?? currentValue,
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
                initialValue.updateHistory &&
                initialValue.updateHistory.length > 0 && (
                    <section>
                        <h2 className="my-4 text-xl font-semibold">
                            Update History
                        </h2>
                        <div className="grid grid-cols-3 gap-2 gap-x-4">
                            {initialValue.updateHistory
                                .sort(
                                    (a, b) =>
                                        getHistoryUpdatedAt(b).getTime() -
                                        getHistoryUpdatedAt(a).getTime()
                                )
                                .map((update, updateIndex) => (
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

function UpdateHistoryEntry(update: Partial<IDocumentUpdate>) {
    const { isPending, data } = useQuery<IUser | null>({
        queryKey: ['admin', 'users', update.updated_by],
        async queryFn() {
            if (!update.updated_by) return null

            const res = await fetch(
                `/api/admin/users/${update.updated_by as unknown as string}`
            )

            return (await res.json()) as IUser
        },
    })

    const format = (v: unknown) => {
        if (Array.isArray(v))
            return `[${v.map((e) => JSON.stringify(e)).join(', ')}]`
        return JSON.stringify(v)
    }

    return (
        <div className="contents">
            <div className="pl-6 font-medium">
                {getHistoryUpdatedAt(update).toLocaleString()}
            </div>
            <div>
                <code className="font-mono">{update.field_name}</code>{' '}
                <span className="text-gray-600">changed from</span>{' '}
                <code className="wrap-break-word font-mono">
                    {format(update.previous_value)}
                </code>{' '}
                <span className="text-gray-600">to</span>{' '}
                <code className="wrap-break-word font-mono">
                    {format(update.new_value)}
                </code>{' '}
            </div>
            <div>
                <span className="text-gray-600">by</span>{' '}
                {isPending ? (
                    <span className="text-gray-600">&lt;pending&gt;</span>
                ) : (
                    <>
                        <code className="font-mono">
                            {data?.name ?? 'deleted user'}
                        </code>
                        {data?._id && (
                            <>
                                (
                                <code className="font-mono">
                                    {(data?._id as string) ?? 'deleted user'}
                                </code>
                                )
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
