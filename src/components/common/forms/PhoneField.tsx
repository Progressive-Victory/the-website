import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import { cn } from '@/util'
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
    const { getter, validator, onChange, readonly, disabled } = useConfigure(
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

                if (!parsed.isValid) return false

                if (
                    [
                        '800',
                        '833',
                        '844',
                        '855',
                        '866',
                        '877',
                        '888',
                        '555',
                        '880',
                        '881',
                        '882',
                        '883',
                        '884',
                        '885',
                        '886',
                        '887',
                        '889',
                        '311',
                        '911',
                        '988',
                    ].includes(parsed.phoneNumber.substring(2, 5))
                )
                    return false

                return true
            },
            [props.required]
        )
    )

    const storedValue = props.dynamic?.form
        ? (getter(props.dynamic.form) ?? '')
        : ''
    const displayValue = storedValue.replace(/^\+1/, '').replace(/\D/g, '')

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target.value
        const digitsOnly = input.replace(/\D/g, '')
        const limitedDigits = digitsOnly.slice(0, 10)

        event.target.value = limitedDigits
        const e164Value =
            limitedDigits.length === 10 ? `+1${limitedDigits}` : limitedDigits
        onChange(e164Value)
    }

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={styles.readonly}>
                    {formatPhoneDisplay(storedValue)}
                </div>
            ) : (
                <div className={styles.phoneField}>
                    <input
                        type="tel"
                        id={props?.id}
                        name={props.label}
                        disabled={disabled}
                        required={props.required}
                        value={displayValue}
                        onInput={handleInput}
                        placeholder="2345556789"
                        maxLength={10}
                        className={cn(
                            styles.textField,
                            storedValue?.trim() &&
                                !validator(storedValue) &&
                                styles.invalid
                        )}
                    />
                    {storedValue?.trim() && !validator(storedValue) && (
                        <span className={styles.validationError}>
                            Enter a valid US phone number
                        </span>
                    )}
                </div>
            )}
        </FormField>
    )
}
