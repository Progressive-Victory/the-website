import { FormField, FormFieldProps, getGetter, getSetter } from './FormField'
import styles from './FormField.module.css'
import cx from 'classnames'
import { ChangeEvent } from 'react'

export function TextField<T>(
    props: FormFieldProps<T, string | null | undefined>
) {
    props.getter ??= getGetter(props)
    props.setter ??= getSetter(props)
    props.validator ??= (field: string | null | undefined) =>
        !props.required || !!field?.trim()

    const readonly = !!props.readonly || !props.dynamic?.editing
    const disabled = !!props.disabled || !!props.dynamic?.saving
    const value = props?.getter?.(props.dynamic!.form) ?? ''

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        props.dynamic?.onChange?.(props, newValue)
    }

    return (
        <FormField
            name={name}
            field={field}
            required={required}
            deprecated={deprecated}
        >
            {readonly || dynamic?.disabled ? (
                <div className="col-span-2 w-full">
                    {props.prefix}
                    {value}
                </div>
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
                        !props.validator(value) && styles.invalid
                    )}
                />
            )}
        </FormField>
    )
}
