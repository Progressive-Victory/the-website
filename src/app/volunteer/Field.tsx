import styles from './volunteer.module.css'
import { ChangeEvent, KeyboardEvent } from 'react'

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
    onInput?: (e: ChangeEvent<HTMLInputElement>) => void
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
        <div className={styles.field}>
            <label className={styles.label}>
                {placeholder}
                {required && <span className={styles.required}>*</span>}
            </label>

            <div className={styles.inputRow}>
                <input
                    type={type}
                    value={value}
                    data-empty={!value}
                    maxLength={maxLength ?? 25}
                    onKeyDown={(e) => {
                        if (onEnter && e.key === 'Enter') {
                            onEnter(e)
                        }
                    }}
                    disabled={!!disabled}
                    placeholder={placeholder ?? ''}
                    onChange={onChange}
                    onInput={onInput}
                    onBlur={onBlur}
                    required={required}
                    className={`${styles.input} ${
                        error && value !== '' ? styles.inputError : ''
                    }`}
                />
                {children}
            </div>

            {error && value !== '' && (
                <div className={styles.errorText}>{errorText}</div>
            )}
        </div>
    )
}
