'use client'

import styles from './Switch.module.css'

export interface SwitchProps {
    type?: 'short' | 'long'
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    ariaLabel: string
    disabled?: boolean
}

export function Switch({
    type = 'short',
    checked,
    onCheckedChange,
    ariaLabel,
    disabled,
}: SwitchProps) {
    return (
        <input
            type="checkbox"
            role="switch"
            data-type={type}
            aria-label={ariaLabel}
            className={styles.switch}
            checked={checked}
            disabled={disabled}
            onChange={(event) => onCheckedChange(event.currentTarget.checked)}
        />
    )
}
