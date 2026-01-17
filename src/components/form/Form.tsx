import styles from './Form.module.css'
import { DynamicFormFieldProps, FormFieldProps } from './FormField'
import { FormGroupProps } from './FormGroup'
import cx from 'classnames'
import deepEqual from 'deep-equal'
import { ReactElement, useEffect, useState } from 'react'
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
    saving: boolean

    children?:
        | ReactElement<FormGroupProps<T>>
        | ReactElement<FormGroupProps<T>>[]

    onUpdate: (state: FormState<T>) => void
    onSave: (form: T) => void
}

export function Form<T>({
    form: initialForm,
    title,
    saving,
    children = [],
    onUpdate,
    onSave,
}: FormProps<T>) {
    const [editForm, setEditForm] = useState<T | null>(null)
    const [dirtyMap, setDirtyMap] = useState(new Map<string, unknown>())
    const [invalidMap, setInvalidMap] = useState(new Set<string>())

    const form = editForm ?? initialForm
    const editing = editForm != null
    const dirty = dirtyMap.size > 0
    const invalid = invalidMap.size > 0

    const handleEdit = () => {
        setEditForm(initialForm)
    }

    const handleSave = () => {
        if (editForm) onSave(editForm)
        setEditForm(null)
        setDirtyMap(new Map<string, unknown>())
        setInvalidMap(new Set<string>())
    }

    const handleCancel = () => {
        setEditForm(null)
        setDirtyMap(new Map<string, unknown>())
        setInvalidMap(new Set<string>())
    }

    const handleChange = (props: FormFieldProps<T>, field: unknown) => {
        if (props.getter) {
            const init = props.getter(initialForm)
            const clean = (!init && !field) || deepEqual(init, field)
            setDirtyMap((prev) => {
                if (clean) prev.delete(props.id ?? '')
                else prev.set(props.id ?? '', field)
                return prev
            })
        }

        if (props.validator) {
            const valid = props.validator(field)
            setInvalidMap((prev) => {
                if (valid) prev.delete(props.id ?? '')
                else prev.add(props.id ?? '')
                return prev
            })
        }

        const setter = props.setter
        if (setter) setEditForm((prev) => (prev ? setter(prev, field) : null))
    }

    const groups = Array.isArray(children) ? children : [children]
    const dynamic: DynamicFormFieldProps<T> = {
        form,
        editing,
        saving,
        onChange: handleChange,
    }

    useEffect(() => {
        onUpdate({ form, editing, dirty, invalid })
    }, [form, editing, dirty, invalid, onUpdate])

    return (
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <header className={styles.header}>
                <h1 className={styles.title}>{title}</h1>

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
            </header>

            {groups?.map((group, i) => ({
                ...group,
                props: { ...group.props, id: i.toString(), dynamic },
            }))}
        </form>
    )
}
