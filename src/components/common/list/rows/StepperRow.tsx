'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import styles from './StepperRow.module.css'
import type { ReactNode } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'

export interface StepperRowProps
    extends ListRowBaseProps, ListRowFieldProps<number | null> {
    min?: number
    max?: number
    step?: number
    nullLabel?: string
    nullIcon?: ReactNode
}

export function StepperRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    min,
    max,
    step = 1,
    nullLabel,
    nullIcon,
    ...rowProps
}: StepperRowProps) {
    const { value, onValueChange, invalid } = useListField<number | null>(
        {
            value: valueProp,
            onValueChange: onValueChangeProp,
            field,
            getter,
            setter,
            validator,
        },
        {
            required: rowProps.indicator === 'required',
            isEmpty: (value) => value == null,
            editing: rowProps.editing,
        }
    )
    const changeValue = (direction: number) => {
        const next = (value ?? min ?? 0) + direction * step
        onValueChange?.(
            Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next))
        )
    }

    return (
        <ListRow
            {...rowProps}
            invalid={invalid}
            value={value}
            emptyLabel={rowProps.emptyLabel ?? nullLabel}
            editor={(labelId) => (
                <div className={styles.stepper}>
                    <button
                        type="button"
                        aria-label="Decrease"
                        disabled={min != null && (value ?? min) <= min}
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
                            aria-labelledby={labelId}
                            aria-valuetext={
                                value == null ? nullLabel : undefined
                            }
                            value={value ?? ''}
                            placeholder={nullIcon ? undefined : nullLabel}
                            min={min}
                            max={max}
                            step={step}
                            onChange={(event) =>
                                onValueChange?.(
                                    event.currentTarget.value === ''
                                        ? null
                                        : event.currentTarget.valueAsNumber
                                )
                            }
                        />
                    </span>
                    <button
                        type="button"
                        aria-label="Increase"
                        disabled={max != null && value != null && value >= max}
                        onClick={() => changeValue(1)}
                    >
                        <FaPlus aria-hidden="true" size={10} />
                    </button>
                </div>
            )}
        />
    )
}
