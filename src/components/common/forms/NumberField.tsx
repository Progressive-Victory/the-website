import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import { cn } from '@/util'
import { useCallback, useState } from 'react'

export interface NumberFieldProps<T> extends FormFieldProps<
    T,
    number | null | undefined
> {
    min?: number
    max?: number
    step?: number
}

export function NumberField<T>(props: NumberFieldProps<T>) {
    const { min, max } = props
    const { getter, validator, onChange, readonly, disabled } = useConfigure(
        props,
        useCallback(
            (field: number | null | undefined) => {
                if (field == null) return !props.required
                if (!Number.isFinite(field)) return false
                if (min != null && field < min) return false
                if (max != null && field > max) return false
                return true
            },
            [props.required, min, max]
        )
    )

    const value = getter(props.dynamic!.form)

    const [draft, setDraft] = useState<string>()

    const handleInput = (event: React.InputEvent<HTMLInputElement>) => {
        const text = event.currentTarget.value
        setDraft(text)
        onChange(text.trim() === '' ? null : Number(text))
    }

    return (
        <FormField {...props}>
            {readonly ? (
                <div className={styles.readonly}>{value ?? ''}</div>
            ) : (
                <input
                    type="number"
                    id={props?.id}
                    name={props.label}
                    disabled={disabled}
                    required={props.required}
                    min={min}
                    max={max}
                    step={props.step ?? 1}
                    value={draft ?? value ?? ''}
                    onInput={handleInput}
                    onBlur={() => setDraft(undefined)}
                    className={cn(
                        styles.textField,
                        !validator(value) && styles.invalid
                    )}
                />
            )}
        </FormField>
    )
}
