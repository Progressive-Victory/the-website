import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import { cn } from '@/util'
import { ChangeEvent, HTMLInputAutoCompleteAttribute, useCallback } from 'react'

export interface TextFieldProps<T> extends FormFieldProps<
    T,
    string | null | undefined
> {
    autocomplete?: HTMLInputAutoCompleteAttribute
    readonlyClassName?: string
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

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value)
    }

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={cn(styles.readonly, props.readonlyClassName)}>
                    {value}
                </div>
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
                    className={cn(
                        styles.textField,
                        !validator(value) && styles.invalid
                    )}
                />
            )}
        </FormField>
    )
}
