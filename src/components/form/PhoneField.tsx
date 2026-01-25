import { FormField, IBaseFormField } from '.'
import classNames from 'classnames'
import { FormEvent } from 'react'

const US_PHONE_REGEX =
    /^(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/


function formatPhoneDisplay(phone: string): string {
    if (!phone) return ''

    const cleaned = phone.replace(/[^\d+]/g, '')

    const hasCountryCode = cleaned.startsWith('+1') || cleaned.startsWith('1')
    const digits = cleaned.replace(/^\+?1?/, '')

    if (digits.length !== 10) return phone

    const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    return hasCountryCode ? `+1 ${formatted}` : formatted
}

function normalizeToE164(phone: string): string {
    if (!phone) return ''
    const digits = phone.replace(/\D/g, '') 
    const last10 = digits.slice(-10) 
    if (last10.length !== 10) return phone 
    return `+1${last10}`
}

export function PhoneField({
    name,
    field,
    required = false,
    readonly = false,
    deprecated = false,
    dynamic,
}: IBaseFormField) {
    const value = (dynamic?.value as string) ?? ''

    const isValidPhone = (text: string): boolean => {
        if (!text.trim()) return !required
        return US_PHONE_REGEX.test(text.trim())
    }

    const isValid = (text: string) => {
        if (required && !text.trim()) return false
        if (text.trim() && !US_PHONE_REGEX.test(text.trim())) return false
        return true
    }

    const handleInput = (event: FormEvent<HTMLInputElement>) => {
        const newValue = (event.target as HTMLInputElement).value
        const normalizedValue = normalizeToE164(newValue) // Always submit as +1xxxxxxxxxx
        dynamic?.onUpdate?.(field, newValue, normalizedValue, isValid(newValue))
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
                    {formatPhoneDisplay(value)}
                </div>
            ) : (
                <div className="col-span-2 flex w-full max-w-96 flex-col">
                    <input
                        type="tel"
                        name={name}
                        id={field}
                        disabled={dynamic?.loading}
                        required={required}
                        value={value}
                        onInput={handleInput}
                        placeholder="(123) 456-7890"
                        className={classNames(
                            'w-full rounded-lg border border-gray-300 px-3 py-0.5',
                            !isValid(value) && 'border-red-300'
                        )}
                    />
                    {value.trim() && !isValidPhone(value) && (
                        <span className="mt-1 text-xs text-red-500">
                            Enter a valid US phone number
                        </span>
                    )}
                </div>
            )}
        </FormField>
    )
}
