import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import { cn } from '@/util'
import { Country, isValidCountryPostalCode } from 'postal-code-validator'
import { useCallback, useState } from 'react'

const ZIP_LENGTH = 5

export function ZipCodeField<T>(
    props: FormFieldProps<T, string | null | undefined>
) {
    const { getter, validator, onChange, readonly, disabled } = useConfigure(
        props,
        useCallback(
            (field: string | null | undefined) =>
                field
                    ? field.length === ZIP_LENGTH &&
                      isValidCountryPostalCode(
                          field,
                          Country.UnitedStatesOfAmerica
                      )
                    : !props.required,
            [props.required]
        )
    )
    const [touched, setTouched] = useState(false)

    const value = getter(props.dynamic!.form) ?? ''
    const showInvalid =
        (touched || value.length === ZIP_LENGTH) && !validator(value)

    const handleInput = (event: React.InputEvent<HTMLInputElement>) => {
        const input = event.currentTarget
        const digits = input.value.replace(/\D/g, '').slice(0, ZIP_LENGTH)
        onChange(digits || null)
        if (digits.length === ZIP_LENGTH && value.length < ZIP_LENGTH)
            input.blur()
    }

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={styles.readonly}>{value}</div>
            ) : (
                <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    pattern="\d{5}"
                    id={props.id}
                    name={props.label}
                    disabled={disabled}
                    required={props.required}
                    value={value}
                    onInput={handleInput}
                    onBlur={() => setTouched(true)}
                    aria-invalid={showInvalid}
                    className={cn(
                        styles.textField,
                        showInvalid && styles.invalid
                    )}
                />
            )}
        </FormField>
    )
}
