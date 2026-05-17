'use client'

type ToggleValue = string | number | boolean

export interface ToggleGroupOption<Value extends ToggleValue = string> {
    value: Value
    label: React.ReactNode
    disabled?: boolean
}

export interface ToggleGroupProps<Value extends ToggleValue = string>
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    value: Value
    options: ToggleGroupOption<Value>[]
    onChange: (next: Value) => void
    ariaLabel: string
    buttonClassName?: string
    activeButtonClassName?: string
}

export function ToggleGroup<Value extends ToggleValue = string>({
    value,
    options,
    onChange,
    ariaLabel,
    className,
    buttonClassName,
    activeButtonClassName,
    ...props
}: ToggleGroupProps<Value>) {
    return (
        <div
            role="group"
            aria-label={ariaLabel}
            className={className}
            {...props}
        >
            {options.map((option) => {
                const isActive = option.value === value
                return (
                    <button
                        key={String(option.value)}
                        type="button"
                        className={[
                            buttonClassName,
                            isActive ? activeButtonClassName : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
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
