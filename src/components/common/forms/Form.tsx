import styles from './Form.module.css'
import { DynamicFormFieldProps, FieldConfiguration } from './FormField'
import { HStack, Spacer, VStack } from '@/components/layout'
import { cn } from '@/util'
import deepEqual from 'deep-equal'
import React, { useCallback, useEffect, useState } from 'react'
import { FaPlus, FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'

/**
 * The current mode the form is in. It'll usually be in `read` mode unless
 * you've started creating or editing something.
 */
export type FormMode = 'read' | 'create' | 'edit'

/**
 * Current internal state of the Form component. This is returned to the parent
 * component via a callback, so that they can do logic based on it.
 */
export interface FormState<T> {
    /** The current state of the form's data. */
    form: T

    /** The current edit mode of the form. */
    mode: FormMode

    /** Whether any field has been modified. Only set while editing. */
    dirty: boolean

    /** Whether any field is invalid. Only set while editing. */
    invalid: boolean
}

/** Properties for the Form component. */
export interface FormProps<T> {
    /** The data your form will operate on. */
    form: T | null

    /** A title heading, listed above the form groups. */
    title: string

    /** An optional subtitle displayed below the title. */
    subtitle?: string

    /** An optional avatar element displayed in the header. */
    avatar?: React.ReactNode

    /** If this is true, no 'Edit' button will be displayed. */
    readonly?: boolean

    /** An override to force invalidity even if all fields report valid. */
    isInvalid?: boolean

    /** Whether the form is saving. If true, 'Edit' will be disabled. */
    saving?: boolean

    /**
     * Form children. For form features, use a series of form fields or
     * FormGroups, though all children will be displayed.
     */
    children?: React.ReactNode

    /**
     * Callback to inform your component of current Form state, such as content
     * and validity.
     */
    onUpdate?: (state: FormState<T>) => void

    /** Callback to save form data. Should correspond to `saving`. */
    onSave?: (form: T) => void

    /** Callback to create a new form value. */
    onCreate?: () => T

    /** Callback to delete a form value. */
    onDelete?: (form: T) => void
}

/**
 * Generalized component for creating forms. Supports custom fields, generic
 * data, and validation. You can also create and delete forms with it.
 *
 * To add fields, add a list of fields or FormGroups as children.
 *
 * See `FormGroup` and `FormField` for details.
 *
 * See `src/app/admin/members/page.tsx` for an example on using this
 * component.
 *
 * IMPORTANT: This component will prefill `id` and override `dynamic`
 * properties of all direct children. If you're passing any component which
 * depends on `id` being undefined or `dynamic` having a custom value, this
 * break it. If that is an issue, wrap your component in a div.
 *
 * EFFECTS: Calls `onUpdate` every time the form's state changes, including
 * field modifications or button presses.
 */
export function Form<T>({
    form: initialForm,
    title,
    subtitle,
    avatar,
    readonly = false,
    isInvalid = false,
    saving = false,
    children = [],
    onUpdate,
    onSave,
    onCreate,
    onDelete,
}: FormProps<T>) {
    // Stores the initial state of the form while editing.
    const [baseForm, setBaseForm] = useState<T | null>(null)

    // Stores the current state of the form while editing.
    const [editForm, setEditForm] = useState<T | null>(null)

    // Stores the current editing mode of the form.
    const [mode, setMode] = useState<FormMode>('read')

    // Stores a set of field ids which have values different than their
    // initial values.
    const [dirtyMap, setDirtyMap] = useState(new Set<string>())

    // Stores a set of field ids which have invalid values.
    const [invalidMap, setInvalidMap] = useState(new Set<string>())

    // Stores a map of field ids to configuration callbacks, including getters,
    // setters, and validators.
    const [configureMap, setConfigureMap] = useState<
        Record<string, FieldConfiguration<T, unknown>>
    >({})

    // Current form state
    const form = editForm ?? initialForm
    const editing = mode !== 'read'
    const dirty = dirtyMap.size > 0
    const invalid = isInvalid || invalidMap.size > 0

    const reset = () => {
        setEditForm(null)
        setBaseForm(null)
        setMode('read')
        setDirtyMap(new Set<string>())
        setInvalidMap(new Set<string>())
    }

    const beginEdit = (formToEdit: T, mode: 'create' | 'edit') => {
        setBaseForm(formToEdit)
        setEditForm(formToEdit)
        setMode(mode)
    }

    // Called when 'Edit' is pressed. Simply edits current form state.
    const handleEdit = () => {
        if (!initialForm) return
        beginEdit(initialForm, 'edit')
    }

    // Called when 'Create' is pressed. Asks the parent for a blank form and
    // begins editing.
    const handleCreate = () => {
        if (!onCreate) return
        beginEdit(onCreate(), 'create')
    }

    // Called when 'Delete' is pressed. Asks the parent to delete the form.
    const handleDelete = () => {
        if (!initialForm) return
        onDelete?.(initialForm)
    }

    // Called when 'Save' is pressed. Asks the parent component to save, and
    // then clears edit state.
    const handleSave = () => {
        if (editForm) onSave?.(editForm)
        reset()
    }

    // Called when 'Cancel' is pressed. Clears edit state.
    const handleCancel = () => {
        reset()
    }

    // Called whenever the data in any field changes.
    const handleChange = useCallback(
        (id: string, field: unknown) => {
            // This shouldn't happen, but in case a field hasn't registered its
            // callbacks, we'll just ignore it.
            const configuration = configureMap[id]
            if (!configuration) return

            // Similarly, if the forms are null somehow, we'll just return.
            if (!baseForm || !editForm) return

            const { getter, setter, validator } = configuration

            // Use the field's setter to update current form state.
            const currForm = setter(editForm, field)
            setEditForm(currForm)

            // Use the field's getter to update whether the field is dirty.
            const init = getter(baseForm)
            const curr = getter(currForm)
            const clean = (!init && !curr) || deepEqual(init, curr)
            setDirtyMap((prev) => {
                if (clean) prev.delete(id)
                else prev.add(id)
                return prev
            })

            // Use the field's validator to update whether the field is valid.
            const valid = validator(curr)
            setInvalidMap((prev) => {
                if (valid) prev.delete(id)
                else prev.add(id)
                return prev
            })
        },
        [configureMap, baseForm, editForm]
    )

    // Called whenever a field is configured (see `FormField`). Stores the
    // field's getter, setter, and validator for use during change events.
    const handleConfigure = useCallback(
        (id: string, configuration: FieldConfiguration<T, unknown>) => {
            setConfigureMap((prev) => ({ ...prev, [id]: configuration }))
        },
        []
    )

    // If anything changes, inform the parent component of the new state
    useEffect(() => {
        if (onUpdate && form != null) onUpdate({ form, mode, dirty, invalid })
    }, [form, mode, dirty, invalid, onUpdate])

    // If the form is null, display a blank area message.
    if (form == null) {
        return (
            <div className={styles.emptyContainer}>
                <HStack grow>
                    <VStack grow gap>
                        <Spacer />
                        <span>{`No ${title} selected`}</span>
                        {onCreate && (
                            <button
                                onClick={handleCreate}
                                className={cn(styles.button)}
                            >
                                <FaPlus /> Create
                            </button>
                        )}
                        <Spacer />
                    </VStack>
                </HStack>
            </div>
        )
    }

    // Dynamic state. This is populated automatically within each child to
    // allow them to have access to form state without the user needing to
    // pass it into each manually.
    const dynamic: DynamicFormFieldProps<T> = {
        form,
        editing,
        saving,
        onChange: handleChange,
        onConfigure: handleConfigure,
    }

    // Populate default id and dynamic data into the children. Only user-
    // defined components will be hydrated, but note that this includes
    // non-form-specific components.
    const hydratedChildren = React.Children.map(children, (child, i) => {
        // If the node is a non-element or a builtin, change nothing.
        if (!React.isValidElement(child) || typeof child.type == 'string')
            return child

        // Otherwise, default `id` if it's undefined, and override `dynamic`.
        return {
            ...child,
            props: {
                id: i.toString(),
                ...(child.props as object),
                dynamic,
            },
        }
    })

    return (
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    {avatar && <div className={styles.avatar}>{avatar}</div>}
                    <div className={styles.titleContent}>
                        <h1 className={styles.title}>{title}</h1>
                        {subtitle && (
                            <p className={styles.subtitle}>{subtitle}</p>
                        )}
                    </div>
                </div>

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
                                    className={cn(
                                        styles.button,
                                        styles.discardButton
                                    )}
                                >
                                    <FaTrashAlt /> Discard Changes
                                </button>
                            </>
                        ) : (
                            <>
                                {onCreate && (
                                    <button
                                        onClick={handleCreate}
                                        className={styles.button}
                                    >
                                        <FaPlus /> Create
                                    </button>
                                )}
                                <button
                                    onClick={handleEdit}
                                    className={styles.button}
                                >
                                    <FaEdit /> Edit
                                </button>
                                {onDelete && (
                                    <button
                                        onClick={handleDelete}
                                        className={cn(
                                            styles.button,
                                            styles.discardButton
                                        )}
                                    >
                                        <FaTrashAlt /> Delete
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </header>

            {hydratedChildren}
        </form>
    )
}
