'use client'

/*
 * Sidebar.Action — generic header button.
 *
 * The reusable base that specialized actions (e.g. Sidebar.FilterButton) build
 * on. Use directly for any header affordance that isn't filtering.
 */
import styles from '../Sidebar.module.css'
import type { ReactElement, ReactNode } from 'react'

export interface SidebarActionProps {
    icon?: ReactNode
    label?: string
    active?: boolean
    onClick?: () => void
    className?: string
    children?: ReactNode
}

export function SidebarAction({
    icon,
    label,
    active = false,
    onClick,
    className,
    children,
}: SidebarActionProps): ReactElement {
    return (
        <button
            type="button"
            className={[styles.actionButton, className]
                .filter(Boolean)
                .join(' ')}
            data-part="action"
            data-active={active}
            aria-label={label}
            title={label}
            onClick={onClick}
        >
            {icon}
            {children}
        </button>
    )
}
