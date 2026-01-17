import { FormField, FormFieldProps, getGetter, getSetter } from './FormField'
import styles from './FormField.module.css'
import cx from 'classnames'
import { ChangeEvent } from 'react'

export function CheckboxField<T>(props: FormFieldProps<T, boolean>) {
    props.getter ??= getGetter(props)
    props.setter ??= getSetter(props)
    props.validator ??= (field: boolean) => !props.required || field

    const readonly = !!props.readonly || !props.dynamic?.editing
    const disabled = !!props.disabled || !!props.dynamic?.saving
    const value = props?.getter?.(props.dynamic!.form) ?? false

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked
        props.dynamic?.onChange?.(props, newValue)
    }

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={styles.readonly}>{value}</div>
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
                        className={cx(
                            !props.validator(value) && styles.invalid
                        )}
                    />
                </div>
            )}
        </FormField>
    )
}
