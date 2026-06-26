'use client'

/*
 * Sidebar.Title — SKELETON.
 *
 * Presence renders a title. Adding `large` opts into iOS large-title scroll
 * behavior (the shell runs `useLargeTitle` and toggles
 * `data-large-title-collapsed`; CSS crossfades into the header breadcrumb).
 * A `<Sidebar.Search>` nested inside collapses with the title.
 */
import { useSidebarContext } from '../SidebarContext'
import type { ReactElement, ReactNode } from 'react'

export interface SidebarTitleProps {
    large?: boolean
    children?: ReactNode
}

export function SidebarTitle({
    large = false,
    children,
}: SidebarTitleProps): ReactElement {
    const { largeTitleCollapsed } = useSidebarContext()

    return (
        <h1
            data-part="title"
            data-large={large}
            data-collapsed={large && largeTitleCollapsed}
        >
            {children}
        </h1>
    )
}
