'use client'

/*
 * SplitView — root shell (replaces NavigationStack).
 *
 * Compound layout primitive: hosts SplitViewContext and lays out the Sidebar +
 * Detail panes (plus an optional overlay slot). Named child slots replace
 * NavigationStack's `sidebar` / `detail` / `unSelected` / `overlay` props.
 *
 * Open/collapsed/desktop state is owned here via `useSidebarState` and exposed
 * through context so the Sidebar and its parts read it instead of receiving
 * drilled props. `selected` drives mobile pane visibility (sidebar vs detail).
 */
import styles from './SplitView.module.css'
import { SplitViewContext } from './context'
import { useSidebarState } from './sidebar/hooks/useSidebarState'
import tokens from './tokens.module.css'
import type { ReactElement, ReactNode } from 'react'

export interface SplitViewProps {
    selected?: boolean
    /** Controlled sidebar open state (desktop). Omit for uncontrolled. */
    open?: boolean
    onOpenChange?: (open: boolean) => void
    className?: string
    children?: ReactNode
}

interface SlotProps {
    children?: ReactNode
}

function SplitViewRoot({
    selected = false,
    open,
    onOpenChange,
    className,
    children,
}: SplitViewProps): ReactElement {
    const { isDesktop, isOpen, toggle } = useSidebarState(open, onOpenChange)

    const value = {
        isDesktop,
        isOpen,
        toggle,
        selected,
    }

    return (
        <SplitViewContext.Provider value={value}>
            <div
                className={[tokens.tokens, styles.root, className]
                    .filter(Boolean)
                    .join(' ')}
                data-selected={selected}
                data-open={isOpen}
                data-desktop={isDesktop}
            >
                {children}
            </div>
        </SplitViewContext.Provider>
    )
}

function SidebarSlot({ children }: SlotProps): ReactElement {
    return (
        <div className={styles.sidebarSlot} data-slot="sidebar">
            {children}
        </div>
    )
}

function DetailSlot({ children }: SlotProps): ReactElement {
    return (
        <div className={styles.detailSlot} data-slot="detail">
            {children}
        </div>
    )
}

function PlaceholderSlot({ children }: SlotProps): ReactElement {
    return <div className={styles.placeholder}>{children}</div>
}

function OverlaySlot({ children }: SlotProps): ReactElement {
    return <div className={styles.overlay}>{children}</div>
}

export const SplitView = Object.assign(SplitViewRoot, {
    Sidebar: SidebarSlot,
    Detail: DetailSlot,
    Placeholder: PlaceholderSlot,
    Overlay: OverlaySlot,
})
