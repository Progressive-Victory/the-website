'use client'

/*
 * Sidebar.Actions — SKELETON.
 *
 * A cluster of header action buttons. `slot` aligns the cluster to the left or
 * right side of the header row. Holds `Sidebar.Action` / `Sidebar.FilterButton`
 * children (or any node).
 */
import type { ReactElement, ReactNode } from 'react'

export interface SidebarActionsProps {
    slot?: 'left' | 'right'
    children?: ReactNode
}

export function SidebarActions({
    slot = 'right',
    children,
}: SidebarActionsProps): ReactElement {
    return (
        <div data-part="actions" data-slot={slot}>
            {children}
        </div>
    )
}
