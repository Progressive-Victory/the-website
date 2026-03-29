import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import cx from 'classnames'
import { ChangeEvent, useCallback, useEffect } from 'react'

export function CheckboxField<T>(
    props: FormFieldProps<T, boolean | null | undefined>
) {
    const { getter, validator, onChange, readonly, disabled } = useConfigure(
        props,
        useCallback(
            (field: boolean | null | undefined) => !props.required || !!field,
            [props.required]
        )
    )

    const value = getter(props.dynamic!.form) ?? false

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked)
    }

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={styles.readonly}>{`${value}`}</div>
            ) : (
                <div className={styles.checkboxField}>
                    <input
                        type="checkbox"
                        id={props?.id}
                        name={props.label}
                        disabled={disabled}
                        required={props.required}
                        checked={value}
                        onChange={handleChange}
                        className={cx(!validator(value) && styles.invalid)}
                    />
                </div>
            )}
        </FormField>
    )
}
