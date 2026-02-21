import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import cx from 'classnames'
import { ChangeEvent, useCallback } from 'react'

export function TextField<T>(
    props: FormFieldProps<T, string | null | undefined>
) {
    const { getter, validator, onChange } = useConfigure(
        props,
        useCallback(
            (field: string | null | undefined) =>
                !props.required || !!field?.trim(),
            [props.required]
        )
    )

    const readonly = !!props.readonly || !props.dynamic?.editing
    const disabled = !!props.disabled || !!props.dynamic?.saving
    const value = getter(props.dynamic!.form) ?? ''

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value)
    }

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={styles.readonly}>{value}</div>
            ) : (
                <input
                    type="text"
                    id={props?.id}
                    name={props.label}
                    disabled={disabled}
                    required={props.required}
                    value={value}
                    onInput={handleInput}
                    className={cx(
                        styles.textField,
                        !validator(value) && styles.invalid
                    )}
                />
            )}
        </FormField>
    )
}
