import styles from './FormField.module.css'
import { ReactElement, useEffect, useMemo } from 'react'

export interface FormFieldProps<T, F = unknown> {
    id?: string
    label: string

    readonly?: boolean
    required?: boolean
    disabled?: boolean
    deprecated?: boolean

    dynamic?: DynamicFormFieldProps<T, F>

    children?: ReactElement

    prefix?: string

    field?: string
    getter?: (form: T) => F
    setter?: (form: T, field: F) => T
    validator?: (field: F) => boolean
}

export interface FieldConfiguration<T, F> {
    getter: (form: T) => F | undefined
    setter: (form: T, field: F) => T
    validator: (field: F) => boolean
}

export interface DynamicFormFieldProps<T, F = unknown> {
    form: T
    editing: boolean
    saving: boolean
    onChange: (id: string, field: F) => void
    onConfigure: (id: string, configuration: FieldConfiguration<T, F>) => void
}

export const getSetter = <T, F>(props: FormFieldProps<T, F>) => {
    const setter = props.setter
    if (setter) return setter

    const key = props.field
    if (key) return (form: T, field: F) => ({ ...form, [key]: field }) as T

    return (form: T) => form
}

export function useConfigure<T, F>(
    props: FormFieldProps<T, F>,
    defaultValidator: (field: F) => boolean
) {
    const id = props.id
    const onConfigure = props.dynamic?.onConfigure

    const getter = useMemo(() => {
        const getter = props.getter
        if (getter) return getter

        const key = props.field
        if (key) return (form: T) => (form as Record<string, F>)[key]

        return () => undefined
    }, [props.getter, props.field])

    const setter = useMemo(() => {
        const setter = props.setter
        if (setter) return setter

        const key = props.field
        if (key) return (form: T, field: F) => ({ ...form, [key]: field }) as T

        return (form: T) => form
    }, [props.setter, props.field])

    const validator = useMemo(
        () => props.validator ?? defaultValidator,
        [props.validator, defaultValidator]
    )

    const onChange = (field: F) => {
        if (id) props.dynamic?.onChange?.(id, field)
    }

    useEffect(() => {
        if (id) onConfigure?.(id, { getter, setter, validator })
    }, [id, onConfigure, getter, setter, validator])

    return { getter, setter, validator, onChange }
}

export function FormField<T, F>(props: FormFieldProps<T, F>) {
    return (
        <div className={styles.field}>
            <div className={styles.fieldHeader}>
                <label
                    key={props?.id}
                    htmlFor={props?.id}
                    className={styles.fieldLabel}
                >
                    {props.label}
                    {props.required && (
                        <span
                            className={styles.required}
                            title="Required Field"
                        >
                            *
                        </span>
                    )}
                    {props.deprecated && (
                        <span
                            className={styles.deprecated}
                            title="Deprecated Field"
                        >
                            **
                        </span>
                    )}
                </label>
            </div>
            {props.children}
        </div>
    )
}
