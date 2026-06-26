'use client'

/* Sidebar.Search — SKELETON. Presence => search slot renders. */
import type { ReactElement, ReactNode } from 'react'

export interface SidebarSearchProps {
    children?: ReactNode
}

export function SidebarSearch({ children }: SidebarSearchProps): ReactElement {
    return <div data-part="search">{children}</div>
}
