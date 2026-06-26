'use client'

/*
 * SidebarContext — SKELETON.
 *
 * Shared state for Sidebar parts. Each part renders IN PLACE and reads/writes
 * here (Radix-style), replacing the old `parseHeaderSlots` / `child.type`
 * sniffing. Mounting a part is what enables its behavior.
 *
 * TODO(impl): populate refs + indicator/large-title state from hooks in
 * Sidebar.tsx; expose `registerPart` if the shell needs to know which parts
 * are present (e.g. auto-fill footer with toggle when no <Sidebar.Footer>).
 */
import { createContext, useContext } from 'react'
import type { RefObject } from 'react'

export type SidebarVariant = 'minimal' | 'prominent'

export interface SidebarIndicatorState {
    top: number
    height: number
    visible: boolean
    syncing: boolean
}

export interface SidebarContextValue {
    variant: SidebarVariant
    /** Scroll surface ref (selection indicator + large-title scroll). */
    listRef: RefObject<HTMLDivElement | null>
    /** Animated active-row indicator geometry. */
    indicator: SidebarIndicatorState
    /** True while a large title is collapsed by scroll. */
    largeTitleCollapsed: boolean
    /** Desktop expanded state mirrored from SplitViewContext. */
    isOpen: boolean
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebarContext(): SidebarContextValue {
    const value = useContext(SidebarContext)

    if (value === null) {
        throw new Error('Sidebar.* parts must be used within <Sidebar>')
    }

    return value
}
