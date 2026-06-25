'use client'

import styles from './NavigationStack.module.css'
import { SidebarToggleButton } from './sidebar/sidebar'
import type { NavigationStackSlotProps } from './sidebar/sidebar'
import type { ReactElement, ReactNode } from 'react'

interface NavigationStackProps {
    sidebar?: ReactNode
    detail?: ReactNode
    unSelected?: ReactNode
    isSelected?: boolean
    className?: string
    overlay?: ReactNode
}

/**
 * Layout container for split-view navigation UI.
 * Manages sidebar + detail pane with optional overlay.
 *
 * Props:
 * - sidebar: ReactNode rendered in left pane (usually Sidebar component)
 * - detail: ReactNode rendered in right pane (usually Detail component)
 * - className: Optional CSS classes for root element
 * - overlay: Optional ReactNode for fullscreen overlay (e.g., dropdowns)
 */
export function NavigationStack({
    sidebar,
    detail,
    unSelected,
    isSelected,
    className,
    overlay,
}: NavigationStackProps): ReactElement {
    const hasSelectedDetail =
        isSelected ?? (detail !== null && detail !== undefined)
    const activeDetailContent = hasSelectedDetail ? detail : unSelected

    return (
        <div className={[styles.root, className].filter(Boolean).join(' ')}>
            {sidebar}
            {activeDetailContent}
            {overlay ? <div className={styles.overlay}>{overlay}</div> : null}
        </div>
    )
}

export { SidebarToggleButton }

// Type exports for consumers
export type { NavigationStackProps }
export type { NavigationStackSlotProps }
