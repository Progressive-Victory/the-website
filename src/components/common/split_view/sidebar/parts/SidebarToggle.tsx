'use client'

/* Sidebar.Toggle — collapse/expand control (desktop). */
import { useSplitView } from '../../context'
import styles from '../Sidebar.module.css'
import type { ReactElement } from 'react'
import { FiChevronsLeft } from 'react-icons/fi'

export interface SidebarToggleProps {
    size?: number
    className?: string
}

export function SidebarToggle({
    size = 18,
    className,
}: SidebarToggleProps): ReactElement {
    const { isOpen, toggle } = useSplitView()

    return (
        <button
            type="button"
            className={[styles.toggleButton, className]
                .filter(Boolean)
                .join(' ')}
            onClick={toggle}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            data-part="toggle"
            data-open={isOpen}
        >
            <FiChevronsLeft size={size} />
        </button>
    )
}
