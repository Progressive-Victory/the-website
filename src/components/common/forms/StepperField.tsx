'use client'

import { FormField, useConfigure } from './FormField'
import fieldStyles from './FormField.module.css'
import type { NumberFieldProps } from './NumberField'
import styles from './StepperField.module.css'
import { useCallback, type ReactNode } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'

export interface StepperFieldProps<T> extends NumberFieldProps<T> {
    nullLabel?: string
    nullIcon?: ReactNode
}

export function StepperField<T>(props: StepperFieldProps<T>) {
    const { min, max, step = 1, nullLabel, nullIcon } = props
    const { getter, validator, onChange, readonly, disabled } = useConfigure(
        props,
        useCallback(
            (value: number | null | undefined) => {
                if (value == null) return !props.required
                if (!Number.isFinite(value)) return false
                if (min != null && value < min) return false
                if (max != null && value > max) return false
                return Number.isInteger((value - (min ?? 0)) / step)
            },
            [props.required, min, max, step]
        )
    )

    const value = getter(props.dynamic!.form)
    const changeValue = (direction: number) => {
        const next = (value ?? min ?? 0) + direction * step
        onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next)))
    }

    return (
        <FormField {...props} readonly>
            {readonly ? (
                <div className={fieldStyles.readonly}>
                    {value ?? nullLabel ?? ''}
                </div>
            ) : (
                <div className={styles.stepper}>
                    <button
                        type="button"
                        aria-label={`Decrease ${props.label}`}
                        title={`Decrease ${props.label}`}
                        disabled={
                            disabled || (min != null && (value ?? min) <= min)
                        }
                        onClick={() => changeValue(-1)}
                    >
                        <FaMinus aria-hidden="true" size={10} />
                    </button>
                    <span className={styles.valueContainer}>
                        {value == null && nullIcon && (
                            <span
                                className={styles.nullIcon}
                                aria-hidden="true"
                            >
                                {nullIcon}
                            </span>
                        )}
                        <input
                            type="number"
                            id={props.id}
                            name={props.label}
                            aria-label={props.label}
                            aria-valuetext={
                                value == null ? nullLabel : undefined
                            }
                            aria-invalid={!validator(value)}
                            value={value ?? ''}
                            placeholder={nullIcon ? undefined : nullLabel}
                            min={min}
                            max={max}
                            step={step}
                            required={props.required}
                            disabled={disabled}
                            onChange={(event) =>
                                onChange(
                                    event.currentTarget.value === ''
                                        ? null
                                        : event.currentTarget.valueAsNumber
                                )
                            }
                        />
                    </span>
                    <button
                        type="button"
                        aria-label={`Increase ${props.label}`}
                        title={`Increase ${props.label}`}
                        disabled={
                            disabled ||
                            (max != null && value != null && value >= max)
                        }
                        onClick={() => changeValue(1)}
                    >
                        <FaPlus aria-hidden="true" size={10} />
                    </button>
                </div>
            )}
        </FormField>
    )
}
