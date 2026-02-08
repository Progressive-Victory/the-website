import styles from './Form.module.css'
import { DynamicFormFieldProps, FieldConfiguration } from './FormField'
import { FormGroupProps } from './FormGroup'
import cx from 'classnames'
import deepEqual from 'deep-equal'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'

export interface FormState<T> {
    form: T
    editing: boolean
    dirty: boolean
    invalid: boolean
}

export interface FormProps<T> {
    form: T
    title: string
    readonly?: boolean
    isInvalid?: boolean
    saving?: boolean

    children?:
        | ReactElement<FormGroupProps<T>>
        | (ReactElement<FormGroupProps<T>> | false | null | undefined)[]

    onUpdate: (state: FormState<T>) => void
    onSave: (form: T) => void
}

export function Form<T>({
    form: initialForm,
    title,
    readonly = false,
    isInvalid = false,
    saving = false,
    children = [],
    onUpdate,
    onSave,
}: FormProps<T>) {
    const [editForm, setEditForm] = useState<T | null>(null)
    const [dirtyMap, setDirtyMap] = useState(new Set<string>())
    const [invalidMap, setInvalidMap] = useState(new Set<string>())
    const [configureMap, setConfigureMap] = useState<
        Record<string, FieldConfiguration<T, unknown>>
    >({})

    const form = editForm ?? initialForm
    const editing = editForm != null
    const dirty = dirtyMap.size > 0
    const invalid = isInvalid || invalidMap.size > 0

    const handleEdit = () => {
        setEditForm(initialForm)
    }

    const handleSave = () => {
        if (editForm) onSave(editForm)
        setEditForm(null)
        setDirtyMap(new Set<string>())
        setInvalidMap(new Set<string>())
    }

    const handleCancel = () => {
        setEditForm(null)
        setDirtyMap(new Set<string>())
        setInvalidMap(new Set<string>())
    }

    const handleChange = useCallback(
        (id: string, field: unknown) => {
            const configuration = configureMap[id]
            if (!configuration) return

            const { getter, setter, validator } = configuration

            const currForm = setter(form, field)
            setEditForm(currForm)

            const init = getter(initialForm)
            const curr = getter(currForm)

            const clean = (!init && !curr) || deepEqual(init, curr)
            setDirtyMap((prev) => {
                if (clean) prev.delete(id)
                else prev.add(id)
                return prev
            })

            if (validator) {
                const valid = validator(curr)
                setInvalidMap((prev) => {
                    if (valid) prev.delete(id)
                    else prev.add(id)
                    return prev
                })
            }
        },
        [configureMap, form, initialForm]
    )

    const handleConfigure = useCallback(
        (id: string, configuration: FieldConfiguration<T, unknown>) => {
            setConfigureMap((prev) => ({ ...prev, [id]: configuration }))
        },
        []
    )

    const groups = Array.isArray(children) ? children : [children]
    const dynamic: DynamicFormFieldProps<T> = {
        form,
        editing,
        saving,
        onChange: handleChange,
        onConfigure: handleConfigure,
    }

    useEffect(() => {
        onUpdate({ form, editing, dirty, invalid })
    }, [form, editing, dirty, invalid, onUpdate])

    return (
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <header className={styles.header}>
                <h1 className={styles.title}>{title}</h1>

                {!readonly && (
                    <div className={styles.buttonRow}>
                        {editing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={!dirty || invalid}
                                    className={styles.button}
                                >
                                    <FaSave /> Save Changes
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className={cx(
                                        styles.button,
                                        styles.discardButton
                                    )}
                                >
                                    <FaTrashAlt /> Discard Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleEdit}
                                    className={styles.button}
                                >
                                    <FaEdit /> Edit
                                </button>
                            </>
                        )}
                    </div>
                )}
            </header>

            {groups
                ?.filter((group) => !!group)
                .map((group, i) => ({
                    ...group,
                    props: { ...group.props, id: i.toString(), dynamic },
                }))}
        </form>
    )
}
