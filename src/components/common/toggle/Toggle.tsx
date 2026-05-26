'use client'

import styles from './Toggle.module.css'

type ToggleValue = string | number | boolean
type ToggleOrientation = 'horizontal' | 'vertical'

export interface ToggleGroupOption<Value extends ToggleValue = string> {
    value: Value
    label: React.ReactNode
    disabled?: boolean
}

export interface ToggleGroupProps<
    Value extends ToggleValue = string,
> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    value: Value
    options: ToggleGroupOption<Value>[]
    onChange: (next: Value) => void
    ariaLabel: string
    orientation?: ToggleOrientation
    buttonClassName?: string
    activeButtonClassName?: string
}

export function ToggleGroup<Value extends ToggleValue = string>({
    value,
    options,
    onChange,
    ariaLabel,
    orientation = 'horizontal',
    className,
    buttonClassName,
    activeButtonClassName,
    ...props
}: ToggleGroupProps<Value>) {
    const groupClassName = [
        styles.group,
        orientation === 'vertical'
            ? styles.groupVertical
            : styles.groupHorizontal,
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div
            role="group"
            aria-label={ariaLabel}
            data-orientation={orientation}
            className={groupClassName}
            {...props}
        >
            {options.map((option) => {
                const isActive = option.value === value
                const buttonClassNames = [
                    styles.button,
                    buttonClassName,
                    isActive ? styles.buttonActive : '',
                    isActive ? activeButtonClassName : '',
                ]
                    .filter(Boolean)
                    .join(' ')

                return (
                    <button
                        key={String(option.value)}
                        type="button"
                        className={buttonClassNames}
                        aria-pressed={isActive}
                        disabled={option.disabled}
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
