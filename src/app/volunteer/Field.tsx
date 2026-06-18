import { ChangeEvent, KeyboardEvent, InputEvent } from 'react'

export function Field({
    type = 'text',
    value,
    onChange,
    onInput,
    onBlur,
    placeholder,
    disabled,
    error,
    errorText,
    onEnter,
    required = true,
    maxLength,
    children,
}: {
    type?: string
    value: string
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
    onInput?: (e: InputEvent<HTMLInputElement>) => void
    onBlur?: (e: ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    disabled?: boolean
    error?: boolean
    errorText?: string
    onEnter?: (e: KeyboardEvent<HTMLInputElement>) => void
    required?: boolean
    maxLength?: number
    children?: React.ReactNode
}) {
    return (
        <div className={`flex w-full flex-col items-start justify-center`}>
            <label className="mb-[3px] inline-block text-sm text-gray-300">
                {placeholder}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <div className="flex w-full flex-wrap gap-2">
                <input
                    type={type}
                    value={value}
                    data-empty={!value}
                    maxLength={maxLength ?? 25}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (onEnter != null && e.key === 'Enter') {
                            onEnter(e)
                        }
                    }}
                    disabled={disabled !== null && disabled}
                    placeholder={placeholder ?? ''}
                    onChange={onChange}
                    onInput={onInput}
                    onBlur={onBlur}
                    className={`grow rounded-md bg-white px-4 py-2 ring-steel-blue ${
                        error !== null && value !== '' && !!error
                            ? 'border-2 border-red-500'
                            : ''
                    }`}
                    required={required}
                />
                {children}
            </div>
            {!!error && value !== '' && (
                <div className="my-1 h-4 text-left text-xs text-red-500">
                    {errorText}
                </div>
            )}
        </div>
    )
}
