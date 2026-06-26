'use client'

/*
 * useSidebarState — SKELETON.
 *
 * Open/collapsed/desktop state machine. Supports controlled + uncontrolled
 * open state and the 64rem desktop breakpoint. Replaces the duplicated
 * `useSidebarOpenState` logic that existed in both Minimal/Prominent sidebars.
 */
import { useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export interface SidebarState {
    isDesktop: boolean
    isOpen: boolean
    toggle: () => void
}

export function useSidebarState(
    controlledOpen?: boolean,
    onOpenChange?: (open: boolean) => void
): SidebarState {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const desktopOpen = controlledOpen ?? uncontrolledOpen
    const isOpen = !isDesktop || desktopOpen

    function toggle() {
        const next = !desktopOpen
        onOpenChange?.(next)
        if (controlledOpen === undefined) {
            setUncontrolledOpen(next)
        }
    }

    return { isDesktop, isOpen, toggle }
}
