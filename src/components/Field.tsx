import { ChangeEvent, KeyboardEvent } from 'react'
export function Field({
    value, // Value
    onChange, // Value setter
    placeholder, // Label and placeholder text
    disabled,
    error,
    errorText,
    onEnter,
    required = true,
    maxLength,
}: {
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    disabled?: boolean
    error?: boolean
    errorText?: string
    onEnter?: (e: KeyboardEvent<HTMLInputElement>) => void
    required?: boolean
    maxLength?: number
}) {
    return (
        <div
            className={`my-2 flex w-full flex-col items-start justify-center transition-all duration-200 ${
                disabled !== null && disabled
                    ? '-mb-2 h-0 opacity-0'
                    : 'h-[48px]'
            }`}
        >
            <label className="inline-block text-sm text-gray-300">
                {placeholder}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <input
                value={value}
                maxLength={maxLength != null ? maxLength : 25}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (onEnter != null && e.key === 'Enter') {
                        onEnter(e)
                    }
                }}
                disabled={disabled !== null && disabled}
                placeholder={placeholder ? placeholder : ''}
                onChange={(e) => {
                    if (disabled !== null && !disabled) {
                        onChange(e)
                    }
                }}
                className={`w-full rounded-md bg-white px-4 py-2 ring-steel-blue ${
                    error !== null && value !== '' && !error
                        ? 'border-2 border-red-500'
                        : ''
                }`}
            />
            {!error && value !== '' && (
                <div className="my-1 h-4 text-left text-xs text-red-500">
                    {errorText}
                </div>
            )}
        </div>
    )
}
