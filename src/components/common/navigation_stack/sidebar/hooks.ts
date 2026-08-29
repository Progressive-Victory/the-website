import { useSelectionIndicator } from './SelectionIndicator'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function useSidebarOpenState(
    controlledOpen: boolean | undefined,
    onOpenChange?: (open: boolean) => void
): {
    isDesktop: boolean
    isOpen: boolean
    desktopOpen: boolean
    toggle: () => void
} {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const desktopOpen = controlledOpen ?? uncontrolledOpen
    const isOpen = !isDesktop || desktopOpen

    function toggle() {
        const nextOpen = !desktopOpen
        onOpenChange?.(nextOpen)
        if (controlledOpen === undefined) {
            setUncontrolledOpen(nextOpen)
        }
    }

    return { isDesktop, isOpen, desktopOpen, toggle }
}

export function useLargeTitleScroll(
    scrollRef: React.RefObject<HTMLDivElement | null>,
    titleRef: React.RefObject<HTMLElement | null>,
    enabled: boolean
): boolean {
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        if (!enabled) {
            setCollapsed((previous) => (previous ? false : previous))
            return
        }

        const scrollElement = scrollRef.current

        if (!scrollElement) {
            return
        }

        let frameId: number | null = null

        function evaluate() {
            frameId = null

            const element = scrollRef.current

            if (!element) {
                return
            }

            const collapseTrigger = 12
            const expandTrigger = 4

            setCollapsed((previous) => {
                if (!previous && element.scrollTop > collapseTrigger) {
                    return true
                }

                if (previous && element.scrollTop <= expandTrigger) {
                    return false
                }

                return previous
            })
        }

        function handleScroll() {
            if (frameId !== null) {
                return
            }

            frameId = requestAnimationFrame(evaluate)
        }

        scrollElement.addEventListener('scroll', handleScroll, {
            passive: true,
        })
        evaluate()

        return () => {
            scrollElement.removeEventListener('scroll', handleScroll)

            if (frameId !== null) {
                cancelAnimationFrame(frameId)
            }
        }
    }, [enabled, scrollRef, titleRef])

    return enabled ? collapsed : false
}

function getSidebarInlineStyle(
    sidebarWidth?: string,
    collapsedWidth?: string
): CSSProperties | undefined {
    if (!sidebarWidth && !collapsedWidth) return undefined
    const style: Record<string, string> = {}
    if (sidebarWidth)
        style['--navigation-stack-sidebar-open-width'] = sidebarWidth
    if (collapsedWidth)
        style['--navigation-stack-sidebar-collapsed-width'] = collapsedWidth
    return style as CSSProperties
}

export function useSidebarState(
    controlledOpen: boolean | undefined,
    onOpenChange: ((open: boolean) => void) | undefined,
    showSelectionIndicator: boolean,
    collapsedMode: 'compact' | 'hidden',
    width?: string,
    collapsedWidth?: string
) {
    const pathname = usePathname()
    const { isDesktop, isOpen, toggle } = useSidebarOpenState(
        controlledOpen,
        onOpenChange
    )
    const { bodyRef, indicatorLayoutSyncing, indicatorStyle } =
        useSelectionIndicator(
            pathname,
            isDesktop,
            isOpen,
            showSelectionIndicator
        )
    const collapsed = isDesktop && !isOpen
    const hiddenCollapsed = collapsed && collapsedMode === 'hidden'
    const sidebarInlineStyle = getSidebarInlineStyle(width, collapsedWidth)

    return {
        pathname,
        isDesktop,
        isOpen,
        collapsed,
        toggle,
        bodyRef,
        indicatorLayoutSyncing,
        indicatorStyle,
        hiddenCollapsed,
        sidebarInlineStyle,
    }
}
