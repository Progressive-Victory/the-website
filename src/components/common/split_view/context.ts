'use client'

/*
 * SplitViewContext — SKELETON.
 *
 * Shared layout state for the split-view shell. Owns responsive + open/collapsed
 * state and which pane is "selected" (detail visible on mobile). Sidebar and
 * Detail read from here instead of receiving drilled props.
 *
 * TODO(impl): back this with `useSidebarState` and wire the provider in
 * SplitView.tsx.
 */
import { createContext, useContext } from 'react'

export interface SplitViewContextValue {
    /** True at >= 64rem (desktop). */
    isDesktop: boolean
    /** Sidebar expanded (desktop) — always treated open on mobile. */
    isOpen: boolean
    /** Toggle sidebar open/closed (desktop only). */
    toggle: () => void
    /** True when a detail/panel is selected (drives mobile pane visibility). */
    selected: boolean
}

export const SplitViewContext = createContext<SplitViewContextValue | null>(
    null
)

export function useSplitView(): SplitViewContextValue {
    const value = useContext(SplitViewContext)

    if (value === null) {
        throw new Error('useSplitView must be used within <SplitView>')
    }

    return value
}
