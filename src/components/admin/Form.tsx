import MultiSelect from '@/components/admin/MultiSelect'
import { IDocumentUpdate } from '@/models/DocumentUpdate'
import { IUser } from '@/models/User'
import { useMutation, useQuery } from '@tanstack/react-query'
import deepEqual from 'deep-equal'
import { FC, useState } from 'react'
import { FaSave, FaTrashAlt } from 'react-icons/fa'

export interface IForm<T> {
    groups: IFormGroup[]
    initialValue: T
    setInitialValue: (value: T) => void
    currentValue: T
    setCurrentValue: (value: T) => void
    computeTitle?: (value: T) => string
    patchEndpoint: string
    postEndpoint?: string
    onChangesSaved?: (value: T) => void
    updateHistory?: boolean
}

export interface IFormGroup {
    title?: string
    fields: IFormField[]
}

export interface IFormFieldBase {
    name: string
    key: string
    required?: boolean
    readonly?: boolean
    deprecated?: boolean
}

export type IFormFieldText = IFormFieldBase & {
    type: 'text'
}

export type IFormFieldCheckbox = IFormFieldBase & {
    type: 'checkbox'
}
export type IFormFieldSelectMany = IFormFieldBase & {
    type: 'select_many'
    display_key: string
    value_key: string
    options: any[]
}

export type IFormField =
    | IFormFieldText
    | IFormFieldCheckbox
    | IFormFieldSelectMany

export function Form<T>({
    groups,
    initialValue,
    setInitialValue,
    currentValue,
    setCurrentValue,
    computeTitle,
    patchEndpoint,
    onChangesSaved,
    updateHistory,
}: IForm<T>) {
    const [activeFieldMenu, setActiveFieldMenu] = useState<string | null>(null)

    // FIXME: memoize?
    const equal = deepEqual(initialValue, currentValue)

    const mutation = useMutation({
        mutationKey: [patchEndpoint, currentValue['_id']],
        async mutationFn(payload) {
            const res = await fetch(patchEndpoint, {
                headers: {
                    'content-type': 'application/json',
                },
                method: 'PATCH',
                body: JSON.stringify(payload),
            })

            return await res.json()
        },
        onSuccess(data) {
            setInitialValue({ ...data })
            setCurrentValue({ ...data })
            onChangesSaved?.({ ...data })
        },
        onError(e) {
            console.error('Failed to mutate:', e)
            alert(`Error: ${e?.message ?? e}`)
        },
    })

    const saveChanges = () => {
        const payload = { id: currentValue['_id'] }

        for (const g of groups) {
            for (const f of g.fields) {
                if (f.readonly) continue

                if (deepEqual(initialValue[f.key], currentValue[f.key]))
                    continue

                switch (f.type) {
                    case 'text':
                    case 'checkbox': {
                        payload[f.key] = currentValue[f.key]
                        break
                    }
                    case 'select_many': {
                        payload[f.key] = currentValue[f.key].map(
                            (v) => v[f.value_key]
                        )
                        break
                    }
                }
            }
        }

        mutation.mutate(payload)
    }

    const discardChanges = () => {
        setCurrentValue({ ...initialValue })
    }

    return (
        <form
            className="p-6"
            onSubmit={(e) => {
                e.preventDefault()
            }}
        >
            <header className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    {computeTitle?.(currentValue) ?? 'Details'}
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={saveChanges}
                        disabled={equal}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-sky-600 bg-sky-500 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:border-[hsl(200,68%,39%)] disabled:bg-[hsl(201,66%,32%)]"
                    >
                        <FaSave /> Save Changes
                    </button>
                    <button
                        onClick={discardChanges}
                        disabled={equal}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-600 bg-red-500 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:border-[hsl(0,42%,55%)] disabled:bg-[hsl(0,54%,60%)]"
                    >
                        <FaTrashAlt />
                        Discard Changes
                    </button>
                </div>
            </header>
            {groups.map((g) => (
                <section key={g.title}>
                    {g.title && (
                        <h2 className="my-4 text-xl font-semibold">
                            {g.title}
                        </h2>
                    )}
                    <div className="grid grid-cols-3 gap-2 gap-x-4">
                        {g.fields.map((f) => (
                            <div key={f.name} className="contents">
                                <div className="pl-6">
                                    <label
                                        key={f.key}
                                        htmlFor={f.key}
                                        className="font-medium"
                                    >
                                        {f.name || f.key}
                                        {f.required && (
                                            <span
                                                className="ml-1 text-red-500"
                                                title="Required Field"
                                            >
                                                *
                                            </span>
                                        )}
                                        {f.deprecated && (
                                            <span
                                                className="ml-1 text-yellow-500"
                                                title="Deprecated Field"
                                            >
                                                **
                                            </span>
                                        )}
                                    </label>
                                </div>
                                {f.readonly ? (
                                    <div className="col-span-2 w-full">
                                        {`${
                                            currentValue[f.key as keyof T] ??
                                            null
                                        }`}
                                    </div>
                                ) : f.type === 'text' ? (
                                    <input
                                        type="text"
                                        name={f.key}
                                        id={f.key}
                                        disabled={mutation.isPending}
                                        required={f.required}
                                        value={
                                            (currentValue[
                                                f.key as keyof T
                                            ] as string) ?? ''
                                        }
                                        onInput={(e) => {
                                            currentValue[f.key] = e.target.value
                                            setCurrentValue({
                                                ...currentValue,
                                            })
                                        }}
                                        className="col-span-2 w-full max-w-96 rounded-lg border border-gray-300 px-3 py-0.5"
                                    />
                                ) : f.type === 'select_many' ? (
                                    <div className="col-span-2 flex flex-wrap gap-2">
                                        <MultiSelect
                                            disabled={mutation.isPending}
                                            name={f.name}
                                            options={f.options}
                                            query_key={f.key}
                                            display_key={f.display_key}
                                            value_key={f.value_key}
                                            active={
                                                currentValue[f.key].map(
                                                    (v) => v[f.value_key]
                                                ) ?? []
                                            }
                                            addActive={(value) => {
                                                currentValue[f.key] = [
                                                    ...(currentValue[f.key] ??
                                                        []),
                                                    f.options.find(
                                                        (o) =>
                                                            o[f.value_key] ==
                                                            value
                                                    ),
                                                ]
                                                setCurrentValue({
                                                    ...currentValue,
                                                })
                                            }}
                                            removeActive={(value) => {
                                                currentValue[f.key] =
                                                    currentValue[f.key].filter(
                                                        (v: any) =>
                                                            v[f.value_key] !==
                                                            value
                                                    )
                                                setCurrentValue({
                                                    ...currentValue,
                                                })
                                            }}
                                            menuOpen={activeFieldMenu == f.key}
                                            setMenuOpen={(open) =>
                                                setActiveFieldMenu(
                                                    open ? f.key : null
                                                )
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className="col-span-2 flex items-center">
                                        <input
                                            type="checkbox"
                                            name={f.key}
                                            id={f.key}
                                            disabled={mutation.isPending}
                                            required={f.required}
                                            checked={
                                                currentValue[
                                                    f.key as keyof T
                                                ] as boolean
                                            }
                                            onChange={(e) => {
                                                currentValue[f.key] =
                                                    e.target.checked
                                                setCurrentValue({
                                                    ...currentValue,
                                                })
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            ))}
            {updateHistory &&
                initialValue['updateHistory'] &&
                initialValue['updateHistory'].length > 0 && (
                    <section>
                        <h2 className="my-4 text-xl font-semibold">
                            Update History
                        </h2>
                        <div className="grid grid-cols-3 gap-2 gap-x-4">
                            {initialValue['updateHistory'].map((update) => (
                                <UpdateHistoryEntry
                                    key={update.updated_at}
                                    {...update}
                                />
                            ))}
                        </div>
                    </section>
                )}
        </form>
    )
}

const UpdateHistoryEntry: FC<IDocumentUpdate> = (update) => {
    const { isPending, data } = useQuery<IUser | null>({
        queryKey: ['admin', 'users', update.updated_by],
        async queryFn() {
            if (!update.updated_by) return null

            const res = await fetch(`/api/admin/users/${update.updated_by}`)

            const data = await res.json()

            return data as IUser
        },
    })

    const format = (v: any) => {
        if (Array.isArray(v))
            return `[${v.map((e) => JSON.stringify(e)).join(', ')}]`
        return JSON.stringify(v)
    }

    return (
        <div className="contents">
            <div className="pl-6 font-medium">
                {new Date(update.updated_at).toLocaleString()}
            </div>
            <div>
                <code className="font-mono">{update.field_name}</code>{' '}
                <span className="text-gray-600">changed from</span>{' '}
                <code className="font-mono wrap-break-word">
                    {format(update.previous_value)}
                </code>{' '}
                <span className="text-gray-600">to</span>{' '}
                <code className="font-mono wrap-break-word">
                    {format(update.new_value)}
                </code>{' '}
            </div>
            <div>
                <span className="text-gray-600">by</span>{' '}
                {isPending ? (
                    <span className="text-gray-600">&lt;pending&gt;</span>
                ) : (
                    <>
                        <code className="font-mono">{data?.name}</code> (
                        <code className="font-mono">{data?._id as string}</code>
                        )
                    </>
                )}
            </div>
        </div>
    )
}
