'use client'

import styles from './NavigationStack.module.css'
import { NavigationStackWidthContext, useElementWidth } from './NavigationStack.helpers'
import { cn } from '@/util'
import { useRef, type ReactElement, type ReactNode } from 'react'

export interface NavigationStackProps {
    sidebar?: ReactNode
    detail?: ReactNode
    unselected?: ReactNode
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
    unselected,
    isSelected,
    className,
    overlay,
}: NavigationStackProps): ReactElement {
    const hasSelectedDetail = Boolean(isSelected ?? detail)
    const activeDetailContent = hasSelectedDetail ? detail : unselected
    const rootRef = useRef<HTMLDivElement>(null)
    const width = useElementWidth(rootRef)

    return (
        <NavigationStackWidthContext.Provider value={width}>
            <div ref={rootRef} className={cn(styles.root, className)}>
                {sidebar}
                {activeDetailContent}
                {overlay && <div className={styles.overlay}>{overlay}</div>}
            </div>
        </NavigationStackWidthContext.Provider>
    )
}
