import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import cx from 'classnames'
import {
    HTMLInputAutoCompleteAttribute,
    InputEvent,
    useCallback,
} from 'react'

export interface TextFieldProps<T> extends FormFieldProps<
    T,
    string | null | undefined
> {
    autocomplete?: HTMLInputAutoCompleteAttribute
}

export function TextField<T>(props: TextFieldProps<T>) {
    const { getter, validator, onChange, readonly, disabled } = useConfigure(
        props,
        useCallback(
            (field: string | null | undefined) =>
                !props.required || !!field?.trim(),
            [props.required]
        )
    )

    const value = getter(props.dynamic!.form) ?? ''

    const handleInput = (event: InputEvent<HTMLInputElement>) => {
        onChange(event.currentTarget.value)
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
                    autoComplete={props?.autocomplete}
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
