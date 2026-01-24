import styles from './FormField.module.css'
import { ReactElement } from 'react'

export interface FormFieldProps<T, F = unknown> {
    id?: string
    label: string

    readonly?: boolean
    required?: boolean
    disabled?: boolean
    deprecated?: boolean

    dynamic?: DynamicFormFieldProps<T, F>

    children?: ReactElement

    field?: string
    getter?: (form: T) => F
    setter?: (form: T, field: F) => T
    validator?: (field: F) => boolean
}

export interface DynamicFormFieldProps<T, F = unknown> {
    form: T
    editing: boolean
    saving: boolean
    onChange: (props: FormFieldProps<T, F>, field: F) => void
}

export const getGetter = <T, F>(props: FormFieldProps<T, F>) => {
    const getter = props.getter
    if (getter) return (form: T) => getter(form)

    const key = props.field
    if (key) return (form: T) => (form as Record<string, F>)[key]

    return undefined
}

export const getSetter = <T, F>(props: FormFieldProps<T, F>) => {
    const setter = props.setter
    if (setter) return (form: T, field: F) => setter(form, field)

    const key = props.field
    if (key) return (form: T, field: F) => ({ ...form, [key]: field }) as T

    return (form: T) => form
}

export function FormField<T, F>(props: FormFieldProps<T, F>) {
    props.getter ??= getGetter(props)
    props.setter ??= getSetter(props)

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
