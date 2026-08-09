import styles from './components.module.css'
import { cn } from '@/util'
import { ChangeEvent, KeyboardEvent } from 'react'

export function Field({
    type = 'text',
    value,
    onChange,
    onInput,
    onBlur,
    label,
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
    onInput?: (e: ChangeEvent<HTMLInputElement>) => void
    onBlur?: (e: ChangeEvent<HTMLInputElement>) => void
    label?: string
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
        <div className={styles.fieldContainer}>
            <label className={styles.label}>
                {label}
                {required && (
                    <span className={styles.requiredIndicator}> *</span>
                )}
            </label>
            <div className={styles.inputContainer}>
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
                    placeholder={placeholder ?? label ?? ''}
                    onChange={onChange}
                    onInput={onInput}
                    onBlur={onBlur}
                    className={cn(
                        styles.input,
                        error !== null &&
                            value !== '' &&
                            !!error &&
                            styles.error
                    )}
                    required={required}
                />
                {children}
            </div>
            {!!error && value !== '' && (
                <div className={styles.error}>{errorText}</div>
            )}
        </div>
    )
}
