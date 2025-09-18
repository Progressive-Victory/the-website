/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */

import MultiSelect from '@/components/admin/MultiSelect'
import { IDocumentUpdate } from '@/models/DocumentUpdate'
import { IUser } from '@/models/User'
import { useMutation, useQuery } from '@tanstack/react-query'
import deepEqual from 'deep-equal'
import { FC, useEffect, useState } from 'react'
import { FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'
import { FiChevronDown, FiChevronLeft } from 'react-icons/fi'

export interface IForm<T extends { updateHistory?: IDocumentUpdate[] }> {
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

export function Form<
    T extends { _id: string; updateHistory?: IDocumentUpdate[] } & Record<
        string,
        any
    >,
>({
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
    const [editMode, setEditMode] = useState(false)
    const [activeFieldMenu, setActiveFieldMenu] = useState<string | null>(null)

    // FIXME: memoize?
    const equal = deepEqual(initialValue, currentValue)

    const mutation = useMutation({
        mutationKey: [patchEndpoint, currentValue._id],
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

    const saveChanges = async () => {
        const payload = { id: currentValue._id }

        for (const g of groups) {
            for (const f of g.fields) {
                if (f.readonly) continue

                if (deepEqual(initialValue[f.key], currentValue[f.key]))
                    continue

                switch (f.type) {
                    case 'text':
                    case 'checkbox': {
                        // must be ignore
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        payload[f.key] = currentValue[f.key]
                        break
                    }
                    case 'select_many': {
                        // must be ignore
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        payload[f.key] = currentValue[f.key].map(
                            (v) => v[f.value_key]
                        )
                        break
                    }
                }
            }
        }

        // @ts-expect-error shut up
        await mutation.mutateAsync(payload)
        setEditMode(false)
    }

    const discardChanges = () => {
        setCurrentValue({ ...initialValue })
        setEditMode(false)
    }

    useEffect(() => setEditMode(false), [initialValue])

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
                    {editMode ? (
                        <>
                            <button
                                /* eslint-disable  @typescript-eslint/no-misused-promises */
                                onClick={saveChanges}
                                disabled={equal}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-sky-600 bg-sky-500 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:border-[hsl(200,68%,39%)] disabled:bg-[hsl(201,66%,32%)]"
                            >
                                <FaSave /> Save Changes
                            </button>
                            <button
                                onClick={discardChanges}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-600 bg-red-500 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:border-[hsl(0,42%,55%)] disabled:bg-[hsl(0,54%,60%)]"
                            >
                                <FaTrashAlt />
                                Discard Changes
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
            {groups.map((g) => (
                <CollapsableSection
                    group={g}
                    defaultOpenState={g.title !== 'Account Status'}
                    key={g.title}
                >
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
                                {f.type === 'text' ? (
                                    f.readonly || !editMode ? (
                                        <div className="col-span-2 w-full">
                                            {`${
                                                currentValue[
                                                    f.key as keyof T
                                                ] ?? null
                                            }`}
                                        </div>
                                    ) : (
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
                                                // @ts-expect-error shut up
                                                currentValue[f.key] =
                                                    // @ts-expect-error shut up
                                                    e.target.value
                                                setCurrentValue({
                                                    ...currentValue,
                                                })
                                            }}
                                            className="col-span-2 w-full max-w-96 rounded-lg border border-gray-300 px-3 py-0.5"
                                        />
                                    )
                                ) : f.type === 'select_many' ? (
                                    <div className="col-span-2 flex flex-wrap gap-2">
                                        <MultiSelect
                                            disabled={mutation.isPending}
                                            /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
                                            readonly={f.readonly || !editMode}
                                            name={f.name}
                                            options={f.options}
                                            query_key={f.key}
                                            display_key={f.display_key}
                                            value_key={f.value_key}
                                            active={
                                                currentValue[f.key].map(
                                                    // must be ignore
                                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                    // @ts-ignore
                                                    (v) => v[f.value_key]
                                                ) ?? []
                                            }
                                            addActive={(value) => {
                                                // @ts-expect-error shut up
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
                                                // @ts-expect-error shut up
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
                                ) : f.readonly || !editMode ? (
                                    <div className="col-span-2 w-full">
                                        {`${
                                            currentValue[f.key as keyof T] ??
                                            null
                                        }`}
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
                                                // @ts-expect-error shut up
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
                </CollapsableSection>
            ))}
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
                                        // @ts-expect-error shut up
                                        new Date(b.updated_at).getTime() -
                                        // @ts-expect-error shut up
                                        new Date(a.updated_at).getTime()
                                )
                                .map((update) => (
                                    // @ts-expect-error shut up
                                    <UpdateHistoryEntry
                                        key={
                                            update.updated_at as unknown as string
                                        }
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

            const res = await fetch(
                `/api/admin/users/${update.updated_by as unknown as string}`
            )

            const data = await res.json()

            return data as IUser
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
                {
                    // @ts-expect-error shut up
                    new Date(update.updated_at).toLocaleString()
                }
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

const CollapsableSection = ({ children, group, defaultOpenState }) => {
    const [open, setOpen] = useState(defaultOpenState)

    return (
        <section>
            {group.title && (
                <>
                    <h2 className="relative my-4 text-xl font-semibold">
                        {group.title}
                        <button
                            className="absolute right-0 top-0 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <FiChevronDown /> : <FiChevronLeft />}
                        </button>
                    </h2>
                </>
            )}{' '}
            {open ? children : null}
        </section>
    )
}
