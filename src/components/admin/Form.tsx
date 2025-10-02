import MultiSelect from '@/components/admin/MultiSelect'
import { CollapsableSection } from '@/components/common'
import { IDocumentUpdate } from '@/models/DocumentUpdate'
import { IUser } from '@/models/User'
import { useMutation, useQuery } from '@tanstack/react-query'
import deepEqual from 'deep-equal'
import { FC, useEffect, useState } from 'react'
import { FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'

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
    title: string
    fields: IFormField[]
    defaultCollapsed?: boolean
}

export function FormGroup(
    title: string,
    fields: IFormField[],
    flags?: { defaultCollapsed?: boolean }
): IFormGroup {
    return { title, fields, ...(flags ?? {}) }
}

export interface IFormFieldBase {
    name: string
    key: string
    required?: boolean
    readonly?: boolean
    deprecated?: boolean
}

export interface IFormFieldText extends IFormFieldBase {
    type: 'text'
}

export function TextField(
    name: string,
    key: string,
    flags?: {
        required?: boolean
        readonly?: boolean
        deprecated?: boolean
    }
): IFormFieldText {
    return {
        type: 'text',
        name,
        key,
        ...(flags ?? {}),
    }
}

export interface IFormFieldCheckbox extends IFormFieldBase {
    type: 'checkbox'
}

export function CheckboxField(
    name: string,
    key: string,
    flags?: {
        required?: boolean
        readonly?: boolean
        deprecated?: boolean
    }
): IFormFieldCheckbox {
    return {
        type: 'checkbox',
        name,
        key,
        ...(flags ?? {}),
    }
}

export interface IFormFieldSelectMany extends IFormFieldBase {
    type: 'select_many'
    display_key: string
    value_key: string
    options: string[]
}

export function SelectManyField(
    name: string,
    key: string,
    displayKey: string,
    valueKey: string,
    options: string[],
    flags?: {
        required?: boolean
        readonly?: boolean
        deprecated?: boolean
    }
): IFormFieldSelectMany {
    return {
        type: 'select_many',
        name,
        key,
        display_key: displayKey,
        value_key: valueKey,
        options,
        ...(flags ?? {}),
    }
}

export type IFormField =
    | IFormFieldText
    | IFormFieldCheckbox
    | IFormFieldSelectMany

const getHistoryUpdatedAt = (update: Partial<IDocumentUpdate>) =>
    new Date(update.updated_at as unknown as string)

export function Form<
    T extends { _id: string; updateHistory?: IDocumentUpdate[] } & Record<
        string,
        unknown
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

    const mutation = useMutation<T, Error, Record<string, unknown>>({
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
            onChangesSaved?.({ ...data })
        },
        onError(e) {
            console.error('Failed to mutate:', e)
            alert(`Error: ${e?.message ?? e}`)
        },
    })

    const saveChanges = async () => {
        const payload: Record<string, unknown> = { id: currentValue._id }

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
                        payload[f.key] = (
                            currentValue[f.key] as Record<string, unknown>[]
                        ).map((v) => v[f.value_key])
                        break
                    }
                }
            }
        }

        await mutation.mutateAsync(payload)
        setEditMode(false)
    }

    const discardChanges = () => {
        setCurrentValue({ ...initialValue })
        setEditMode(false)
    }

    const getFieldAsText = (key: string) => (currentValue[key] as string) ?? ''
    const getFieldAsCheckbox = (key: string) =>
        (currentValue[key] as boolean) ?? false
    const getFieldAsSelectMany = (key: string) =>
        (currentValue[key] as Record<string, string>[]) ?? []
    const getSelectManyOptions = (options: unknown) =>
        (options as Record<string, string>[]) ?? []

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
                                onClick={() => void saveChanges()}
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
            {groups.map((g, groupIndex) => (
                <CollapsableSection
                    title={g.title}
                    initialOpenState={g.title !== 'Account Status'}
                    key={g.title ?? groupIndex}
                >
                    <div className="grid grid-cols-3 gap-2 gap-x-4">
                        {(g.fields ?? []).map((f) => (
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
                                            {getFieldAsText(f.key)}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            name={f.key}
                                            id={f.key}
                                            disabled={mutation.isPending}
                                            required={f.required}
                                            value={getFieldAsText(f.key)}
                                            onInput={(e) =>
                                                setCurrentValue({
                                                    ...currentValue,
                                                    [f.key]: (
                                                        e.target as HTMLTextAreaElement
                                                    ).value,
                                                })
                                            }
                                            className="col-span-2 w-full max-w-96 rounded-lg border border-gray-300 px-3 py-0.5"
                                        />
                                    )
                                ) : f.type === 'select_many' ? (
                                    <div className="col-span-2 flex flex-wrap gap-2">
                                        <MultiSelect
                                            disabled={mutation.isPending}
                                            readonly={
                                                (f.readonly ?? false) ||
                                                !editMode
                                            }
                                            name={f.name}
                                            options={getSelectManyOptions(
                                                f.options
                                            )}
                                            query_key={f.key}
                                            display_key={f.display_key}
                                            value_key={f.value_key}
                                            active={getFieldAsSelectMany(
                                                f.key
                                            ).map((v) => v[f.value_key])}
                                            addActive={(value) =>
                                                setCurrentValue({
                                                    ...currentValue,
                                                    [f.key]: [
                                                        ...getFieldAsSelectMany(
                                                            f.key
                                                        ),
                                                        getSelectManyOptions(
                                                            f.options
                                                        ).find(
                                                            (o) =>
                                                                o[
                                                                    f.value_key
                                                                ] == value
                                                        ),
                                                    ],
                                                })
                                            }
                                            removeActive={(value) =>
                                                setCurrentValue({
                                                    ...currentValue,
                                                    [f.key]:
                                                        getFieldAsSelectMany(
                                                            f.key
                                                        ).filter(
                                                            (v) =>
                                                                v[
                                                                    f.value_key
                                                                ] !== value
                                                        ),
                                                })
                                            }
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
                                        {`${getFieldAsCheckbox(f.key)}`}
                                    </div>
                                ) : (
                                    <div className="col-span-2 flex items-center">
                                        <input
                                            type="checkbox"
                                            name={f.key}
                                            id={f.key}
                                            disabled={mutation.isPending}
                                            required={f.required}
                                            checked={getFieldAsCheckbox(f.key)}
                                            onChange={(e) => {
                                                setCurrentValue({
                                                    ...currentValue,
                                                    [f.key]: e.target.checked,
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
                                        getHistoryUpdatedAt(b).getTime() -
                                        getHistoryUpdatedAt(a).getTime()
                                )
                                .map((update) => (
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

const UpdateHistoryEntry: FC<Partial<IDocumentUpdate>> = (update) => {
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
