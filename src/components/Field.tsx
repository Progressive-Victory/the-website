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
            className={`flex flex-col items-start justify-center my-2 transition-all duration-200 w-full ${
                disabled !== null && disabled
                    ? 'h-0 opacity-0 -mb-2'
                    : 'h-[48px]'
            }`}
        >
            <label className="inline-block text-gray-300 text-sm">
                {placeholder}
                {required && <span className="text-red-500 ml-1">*</span>}
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
                className={`bg-white rounded-md w-full px-4 py-2 ring-steel-blue ${
                    error !== null && value !== '' && !error
                        ? 'border-red-500 border-2'
                        : ''
                }`}
            />
            {!error && value !== '' && (
                <div className="text-left h-4 text-red-500 text-xs my-1">
                    {errorText}
                </div>
            )}
        </div>
    )
}
