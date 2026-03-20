'use client'

import styles from './DropdownMenuButton.module.css'

export interface DropdownMenuButtonProps {
    label: string
    active?: boolean
    onClick: () => void
    children?: React.ReactNode
}

export function DropdownMenuButton({
    label,
    active = false,
    onClick,
    children,
}: DropdownMenuButtonProps) {
    return (
        <button
            type="button"
            className={[styles.button, active ? styles.buttonActive : '']
                .filter(Boolean)
                .join(' ')}
            onClick={onClick}
        >
            <span>{label}</span>
            {children}
        </button>
    )
}
