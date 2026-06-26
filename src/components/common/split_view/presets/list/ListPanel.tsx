'use client'

/*
 * ListPanel — SKELETON preset (replaces the SidebarList wiring).
 *
 * Search + filters + paginated body on top of <Panel>. Bundles the common
 * "list of records in the sidebar, detail on the right" pattern used by
 * members / donors / roles / permissions panels.
 *
 * TODO(impl): port SidebarListSearch / SidebarListFilters / SidebarListFooter
 * (pagination) into the list/* parts and compose them here.
 */
import { Panel } from '../Panel'
import type { ReactNode } from 'react'

export interface ListPanelProps {
    label?: string
    search?: ReactNode
    filters?: ReactNode
    pagination?: ReactNode
    body?: ReactNode
    children?: ReactNode
}

export function ListPanel({
    label,
    search,
    filters,
    pagination,
    body,
    children,
}: ListPanelProps) {
    return (
        <Panel
            label={label}
            includeSidebar
            includeHeader
            largeTitle
            sidebarSearch={search}
            sidebarFilters={filters}
            sidebarBody={body}
            sidebarFooter={pagination}
        >
            {children}
        </Panel>
    )
}
