import styles from './FormField.module.css'
import { ReactElement, useEffect, useMemo } from 'react'

/**
 * Properties for the FormField component. All form fields extend their
 * properties from this.
 */
export interface FormFieldProps<FormType, FieldType = unknown> {
    /**
     * This field's id. Unless you really need it, you should leave this
     * undefined. This is used to tell React which field this is, and the
     * parent Form stores field data based on this id.
     *
     * If this field is a child of a FormGroup, `id` defaults to its
     * `${group.id}-${i}`, where `i` is its index among the group's children.
     * Otherwise, it defaults to its index among the Form's children.
     */
    id?: string

    /** A label which will be displayed to the left of the field. */
    label: string

    /** Whether this field can be edited. */
    readonly?: boolean

    /** Whether this field must be nonempty to be valid. */
    required?: boolean

    /**
     * Whether this field is displayed as disabled. While this is an option,
     * consider using `readonly` instead.
     */
    disabled?: boolean

    /**
     * Whether this field is deprecated. If so, it'll be noted on the label.
     */
    deprecated?: boolean

    /**
     * Internal form state, populated automatically by the parent Form
     * or FormGroup component. Do not put any value here!
     */
    dynamic?: DynamicFormFieldProps<FormType, FieldType>

    /**
     * Form field children. This is used internally in FormField, do not put
     * any value here!
     *
     * If you're writing a custom form field, do put a value here. This is
     * where field content goes.
     */
    children?: ReactElement

    /**
     * The simpler of the two modes of addressing form data. If you specify a
     * name here, the field will access data from form[field], and set it
     * accordingly. While this is much simpler than defining a custom getter
     * and setter, it only works if your field is at the root level of your
     * form, and it's not type safe. If it doesn't work, double check the type.
     */
    field?: string

    /**
     * The more complex, more flexible of the two modes of addressing form
     * data. Use this callback to extract the field's data from your form.
     * It can be anywhere within your form, computed, or even from the
     * external component!
     *
     * If provided, this will override the default getter provided by `field`.
     *
     * This can be provided alongside `field`, for example, if you want to use
     * the default setter but want to customize the data before sending it to
     * the field.
     */
    getter?: (form: FormType) => FieldType

    /**
     * Similar to `getter`, this tells the field how to update its value in the
     * form object. This MUST return a new object. This MUST NOT modify the
     * existing object.
     *
     * If provided, this will override the default setter provided by `field`.
     *
     * This can be used alongside `field`, for example, if you want to do some
     * post-processing on the field's data before updating the form with it.
     */
    setter?: (form: FormType, field: FieldType) => FormType

    /**
     * Each field provides a default validator, and this allows you to override
     * it with custom validation. Note that the default validator is what
     * controls logic for the `required` prop, so you'll need to implement
     * that here yourself if you're using it.
     */
    validator?: (field: FieldType) => boolean
}

/** Callbacks that the Form needs to handle changes to a field's value. */
export interface FieldConfiguration<FormType, FieldType> {
    /** Callback to obtain a field's value from the form data. */
    getter: (form: FormType) => FieldType | undefined

    /**
     * Callback to create a new form data object with the field's new value.
     * This MUST return a new object. It CANNOT modify the existing one.
     */
    setter: (form: FormType, field: FieldType) => FormType

    /** Callback to determine whether the field's value is invalid. */
    validator: (field: FieldType) => boolean
}

/**
 * Dynamic properties populated automatically by the parent Form.
 *
 * Basically, the fields need to know what's going on with the Form. We
 * could've had the user pass in FormState through every single field and
 * group, but that would've been awful and cluttered up the interface.
 * Instead, we populate it dynamically within Form so that the user doesn't
 * need to worry about it.
 *
 * This could've also been resolved by using a JSON schema to define the
 * fields instead, but that would've hurt customizability and readability.
 * Using this approach, we can accept any kind of child element in addition
 * to the standard form groups and fields.
 */
export interface DynamicFormFieldProps<FormType, FieldType = unknown> {
    /** The current state of the form's data. */
    form: FormType

    /** Whether the form is being edited. */
    editing: boolean

    /** Whether the form is being saved. */
    saving: boolean

    /** Callback to inform the Form that a field's value has changed. */
    onChange: (id: string, field: FieldType) => void

    /** Callback to inform the Form of a field's FieldConfiguration. */
    onConfigure: (
        id: string,
        configuration: FieldConfiguration<FormType, FieldType>
    ) => void
}

/**
 * Hook for initializing a form field. Pass in your props and a default
 * validator, and it'll compute the actual getter, setter, validator,
 * and a simplified onChange callback for you. It'll also call the Form's
 * `onConfigure` callback with the computed configuration.
 *
 * IMPORTANT: If you are just using a Form, you should not use this. This hook
 * is only intended for use within a form field's implementation.
 *
 * EFFECTS: Calls `props.dynamic.onConfigure()` every time the computed getter,
 * setter, validator, or onConfigure callbacks change.
 */
export function useConfigure<FormType, FieldType>(
    props: FormFieldProps<FormType, FieldType>,
    defaultValidator: (field: FieldType) => boolean
) {
    // Make some constants because dependency arrays are silly
    const id = props.id
    const onConfigure = props.dynamic?.onConfigure

    // Use the provided getter if available, or default to `form[props.field]`.
    // If no field is provided either, be sad and return undefined.
    const getter = useMemo(() => {
        const getter = props.getter
        if (getter) return getter

        const key = props.field
        if (key)
            return (form: FormType) => (form as Record<string, FieldType>)[key]

        return () => undefined
    }, [props.getter, props.field])

    // Use the provided setter if available, or default to `form[props.field]`.
    // If no field is provided either, be sad and return undefined.
    const setter = useMemo(() => {
        const setter = props.setter
        if (setter) return setter

        const key = props.field
        if (key)
            return (form: FormType, field: FieldType) =>
                ({ ...form, [key]: field }) as FormType

        return (form: FormType) => form
    }, [props.setter, props.field])

    // Use the provided validator if available, or default to the, well,
    // default one. We can't be sad here because it can't be undefined.
    // Hooray!
    const validator = useMemo(
        () => props.validator ?? defaultValidator,
        [props.validator, defaultValidator]
    )

    // Let the fields use a simpler onChange by baking in the id.
    const onChange = (field: FieldType) => {
        if (id) props.dynamic?.onChange?.(id, field)
    }

    // Inform the parent Form of these callbacks, so that it can use them. We
    // love callback callbacks.
    useEffect(() => {
        if (id) onConfigure?.(id, { getter, setter, validator })
    }, [id, onConfigure, getter, setter, validator])

    const readonly = props.readonly == true || !props.dynamic?.editing
    const disabled = props.disabled == true || props.dynamic?.saving == true

    return { getter, setter, validator, onChange, readonly, disabled }
}

/**
 * Component for displaying the label and base styling of form fields.
 *
 * IMPORTANT: If you are just using the Form, you should not be calling this
 * component directly. Instead, use dedicated field components like
 * `TextField`, `ChecklistField`, `DateField`, etc.
 *
 * Otherwise, if you are adding a new field type, you should return this
 * component. Display your form's content as this component's children, and
 * it'll style it for you automatically. See the aforementioned field
 * components for an example on how to do that.
 */
export function FormField<FormType, FieldType>({
    id,
    label,
    readonly,
    required,
    deprecated,
    dynamic,
    children,
}: FormFieldProps<FormType, FieldType>) {
    const isEditing = !readonly && dynamic?.editing == true

    const content = (
        <>
            <span className={styles.fieldLabel}>
                {label}
                {required && (
                    <span className={styles.required} title="Required Field">
                        *
                    </span>
                )}
                {deprecated && (
                    <span
                        className={styles.deprecated}
                        title="Deprecated Field"
                    >
                        **
                    </span>
                )}
            </span>
            <div className={styles.fieldValue}>{children}</div>
        </>
    )

    if (isEditing)
        return (
            <label key={id} className={styles.fieldHeader}>
                {content}
            </label>
        )

    return <div className={styles.fieldHeader}>{content}</div>
}
