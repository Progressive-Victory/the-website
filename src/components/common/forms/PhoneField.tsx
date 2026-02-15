import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import cx from 'classnames'
import phone from 'phone'
import { ChangeEvent, useCallback } from 'react'

/**
 * Formats a phone number string for display in readonly mode.
 * Accepts various formats and normalizes to "(XXX) XXX-XXXX" format.
 */
function formatPhoneDisplay(phoneNumber: string): string {
    if (!phoneNumber) return ''

    const parsed = phone(phoneNumber, { country: 'US' })
    if (!parsed.isValid) return phoneNumber

    const digits = parsed.phoneNumber.substring(2)
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 10)}`
}

/**
 * Form field component for US phone number input with validation.
 * Uses the `phone` library for proper validation and E164 normalization.
 */
export function PhoneField<T>(
    props: FormFieldProps<T, string | null | undefined>
) {
    const { getter, validator, onChange } = useConfigure(
        props,
        useCallback(
            (field: string | null | undefined) => {
                const text = field ?? ''

                if (!text.trim()) return !props.required

                const parsed = phone(text, {
                    country: 'US',
                    strictDetection: true,
                    validateMobilePrefix: true,
                })
                return parsed.isValid
            },
            [props.required]
        )
    )

    const readonly = !!props.readonly || !props.dynamic?.editing
    const disabled = !!props.disabled || !!props.dynamic?.saving
    const value = props.dynamic?.form ? (getter(props.dynamic.form) ?? '') : ''

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value)
    }

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={styles.readonly}>
                    {formatPhoneDisplay(value)}
                </div>
            ) : (
                <div className={styles.phoneField}>
                    <input
                        type="tel"
                        id={props?.id}
                        name={props.label}
                        disabled={disabled}
                        required={props.required}
                        value={value}
                        onInput={handleInput}
                        placeholder="(123) 456-7890"
                        className={cx(
                            styles.textField,
                            !validator(value) && styles.invalid
                        )}
                    />
                    {value?.trim() && !validator(value) && (
                        <span className={styles.validationError}>
                            Enter a valid US phone number
                        </span>
                    )}
                </div>
            )}
        </FormField>
    )
}
