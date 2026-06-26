'use client'

/*
 * Sidebar.List — SKELETON.
 *
 * The scrollable list region of the sidebar. Hosts the animated active-row
 * indicator (when `selectionIndicator` is set) and carries list semantics
 * (`role="list"`). Children are typically `Nav.*` rows from `@/components/common/nav`,
 * but any content is allowed. The shell's `listRef` is attached here so both
 * the indicator and large-title scroll hooks observe this element.
 */
import styles from '../Sidebar.module.css'
import { useSidebarContext } from '../SidebarContext'
import type { ReactElement, ReactNode } from 'react'

export interface SidebarListProps {
    selectionIndicator?: boolean
    children?: ReactNode
}

export function SidebarList({
    selectionIndicator = false,
    children,
}: SidebarListProps): ReactElement {
    const { listRef, indicator } = useSidebarContext()

    return (
        <div ref={listRef} className={styles.list} data-part="list" role="list">
            {selectionIndicator ? (
                <div
                    aria-hidden="true"
                    className={styles.indicator}
                    data-visible={indicator.visible}
                    data-syncing={indicator.syncing}
                    style={{
                        top: `${indicator.top}px`,
                        height: `${indicator.height}px`,
                    }}
                />
            ) : null}
            {children}
        </div>
    )
}
