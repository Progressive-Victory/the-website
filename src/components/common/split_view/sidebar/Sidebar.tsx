'use client'

/*
 * Sidebar — SKELETON (single shell, replaces MinimalSidebar + ProminentSidebar).
 *
 * ONE component for both variants. `variant` only sets `data-variant` on the
 * root <aside>; all visual differences live in Sidebar.module.css +
 * tokens.module.css. Behavior is driven by which Sidebar.* parts are mounted,
 * not by boolean props.
 *
 * Namespace is FLAT (one level): hierarchy is expressed by where parts sit in
 * the JSX, not by the dot-chain. e.g. <Sidebar.FilterButton> goes INSIDE
 * <Sidebar.Actions> inside <Sidebar.Header>, but is named at one level so it
 * can also be placed elsewhere.
 *
 * The shell owns the shared hooks (selection indicator, large-title scroll) and
 * exposes their state via SidebarContext so parts can render in place.
 *
 * TODO(impl):
 *  - detect whether <Sidebar.Title large> is mounted to enable useLargeTitle
 *  - detect whether <Sidebar.Footer> is mounted; if not, auto-render <Sidebar.Toggle>
 *  - wire useSelectionIndicator listRef + large-title scrollRef
 *  - mobile/responsive data attributes (data-mobile-visible, data-collapsed)
 */
import { useSplitView } from '../context'
import styles from './Sidebar.module.css'
import { SidebarContext, type SidebarVariant } from './SidebarContext'
import { useLargeTitle } from './hooks/useLargeTitle'
import { useSelectionIndicator } from './hooks/useSelectionIndicator'
import { SidebarAction } from './parts/SidebarAction'
import { SidebarActions } from './parts/SidebarActions'
import { SidebarFeatured } from './parts/SidebarFeatured'
import { SidebarFilterButton } from './parts/SidebarFilterButton'
import { SidebarFooter } from './parts/SidebarFooter'
import { SidebarHeader } from './parts/SidebarHeader'
import { SidebarList } from './parts/SidebarList'
import { SidebarSearch } from './parts/SidebarSearch'
import { SidebarTitle } from './parts/SidebarTitle'
import { SidebarToggle } from './parts/SidebarToggle'
import type { ReactElement, ReactNode } from 'react'

export interface SidebarProps {
    variant?: SidebarVariant
    /** Enable the animated active-row indicator + large-title scroll wiring. */
    selectionIndicator?: boolean
    largeTitle?: boolean
    className?: string
    children?: ReactNode
}

function SidebarRoot({
    variant = 'prominent',
    selectionIndicator = false,
    largeTitle = false,
    className,
    children,
}: SidebarProps): ReactElement {
    const { isOpen, isDesktop } = useSplitView()
    const { listRef, indicator } = useSelectionIndicator(selectionIndicator)
    const largeTitleCollapsed = useLargeTitle(listRef, largeTitle)
    const collapsed = isDesktop && !isOpen

    return (
        <SidebarContext.Provider
            value={{ variant, listRef, indicator, largeTitleCollapsed, isOpen }}
        >
            <aside
                className={[styles.sidebar, className]
                    .filter(Boolean)
                    .join(' ')}
                data-variant={variant}
                data-collapsed={collapsed}
                data-open={isOpen}
                data-large-title={largeTitle}
                data-large-title-collapsed={largeTitle && largeTitleCollapsed}
            >
                {children}
            </aside>
        </SidebarContext.Provider>
    )
}

export const Sidebar = Object.assign(SidebarRoot, {
    Header: SidebarHeader,
    Title: SidebarTitle,
    Search: SidebarSearch,
    Actions: SidebarActions,
    Action: SidebarAction,
    FilterButton: SidebarFilterButton,
    Featured: SidebarFeatured,
    List: SidebarList,
    Footer: SidebarFooter,
    Toggle: SidebarToggle,
})
