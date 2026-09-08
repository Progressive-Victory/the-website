import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export interface IndicatorStyle {
    top: number
    height: number
    visible: boolean
}

type TimeoutHandle = ReturnType<typeof setTimeout>

export function useSelectionIndicator(
    pathname: string,
    isDesktop: boolean,
    isOpen: boolean,
    enabled: boolean
): {
    bodyRef: React.RefObject<HTMLDivElement | null>
    indicatorLayoutSyncing: boolean
    indicatorStyle: IndicatorStyle
} {
    const [indicatorLayoutSyncing, setIndicatorLayoutSyncing] = useState(false)
    const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({
        top: 0,
        height: 0,
        visible: false,
    })
    const bodyRef = useRef<HTMLDivElement>(null)
    const indicatorLayoutSyncTimeoutRef = useRef<TimeoutHandle | null>(null)

    useEffect(() => {
        if (!enabled) {
            setIndicatorLayoutSyncing(false)
            setIndicatorStyle((previous) =>
                previous.visible ? { ...previous, visible: false } : previous
            )
            return
        }

        let frameId: number | null = null

        function syncIndicatorToLayout() {
            if (indicatorLayoutSyncTimeoutRef.current !== null)
                clearTimeout(indicatorLayoutSyncTimeoutRef.current)

            setIndicatorLayoutSyncing(true)
            indicatorLayoutSyncTimeoutRef.current = setTimeout(() => {
                setIndicatorLayoutSyncing(false)
                indicatorLayoutSyncTimeoutRef.current = null
            }, 140)
        }

        function getActiveLink(bodyElement: HTMLDivElement) {
            return (
                bodyElement.querySelector<HTMLElement>(
                    '[data-indicator-target="true"]:not([data-show-indicator="false"])'
                ) ??
                bodyElement.querySelector<HTMLElement>(
                    '[aria-current="page"]:not([data-show-indicator="false"])'
                )
            )
        }

        function updateIndicator() {
            const bodyElement = bodyRef.current
            if (!bodyElement) return

            const activeLink = getActiveLink(bodyElement)

            if (!activeLink) {
                setIndicatorStyle((previous) =>
                    previous.visible
                        ? { ...previous, visible: false }
                        : previous
                )
                return
            }

            let nextTop = 0
            let node: HTMLElement | null = activeLink

            while (node && node !== bodyElement) {
                nextTop += node.offsetTop
                node = node.offsetParent as HTMLElement | null
            }

            const nextHeight = activeLink.offsetHeight

            setIndicatorStyle((previous) => {
                const topChanged = Math.abs(previous.top - nextTop) > 0.5
                const heightChanged =
                    Math.abs(previous.height - nextHeight) > 0.5

                if (!topChanged && !heightChanged && previous.visible) {
                    return previous
                }

                return {
                    top: nextTop,
                    height: nextHeight,
                    visible: true,
                }
            })
        }

        function scheduleIndicatorSync() {
            if (frameId !== null) return

            frameId = requestAnimationFrame(() => {
                frameId = null
                updateIndicator()
            })
        }

        updateIndicator()
        window.addEventListener('resize', updateIndicator)

        const bodyElement = bodyRef.current
        let resizeObserver: ResizeObserver | null = null
        let mutationObserver: MutationObserver | null = null

        if (bodyElement) {
            if (typeof ResizeObserver !== 'undefined') {
                resizeObserver = new ResizeObserver(() => {
                    syncIndicatorToLayout()
                    scheduleIndicatorSync()
                })
                resizeObserver.observe(bodyElement)
            }

            mutationObserver = new MutationObserver(scheduleIndicatorSync)
            mutationObserver.observe(bodyElement, {
                attributes: true,
                attributeFilter: [
                    'data-open',
                    'aria-current',
                    'data-indicator-target',
                    'class',
                ],
                childList: true,
                subtree: true,
            })
        }

        return () => {
            window.removeEventListener('resize', updateIndicator)
            resizeObserver?.disconnect()
            mutationObserver?.disconnect()

            if (indicatorLayoutSyncTimeoutRef.current !== null)
                clearTimeout(indicatorLayoutSyncTimeoutRef.current)

            if (frameId !== null) cancelAnimationFrame(frameId)
        }
    }, [pathname, isDesktop, isOpen, enabled])

    return {
        bodyRef,
        indicatorLayoutSyncing,
        indicatorStyle,
    }
}

export function useSidebarOpenState(
    controlledOpen: boolean | undefined,
    onOpenChange?: (open: boolean) => void
): {
    isDesktop: boolean
    isExpanded: boolean
    desktopExpanded: boolean
    toggle: () => void
} {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const desktopExpanded = controlledOpen ?? uncontrolledOpen
    const isExpanded = !isDesktop || desktopExpanded

    function toggle() {
        const nextExpanded = !desktopExpanded
        onOpenChange?.(nextExpanded)
        if (controlledOpen === undefined) setUncontrolledOpen(nextExpanded)
    }

    return { isDesktop, isExpanded, desktopExpanded, toggle }
}

export function useLargeTitleScroll(
    scrollRef: React.RefObject<HTMLDivElement | null>,
    titleRef: React.RefObject<HTMLElement | null>,
    enabled: boolean
): boolean {
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        if (!enabled) {
            setCollapsed(false)
            return
        }

        const scrollElement = scrollRef.current
        if (!scrollElement) return

        let frameId: number | null = null

        function evaluate() {
            frameId = null

            const element = scrollRef.current
            if (!element) return

            const collapseTrigger = 12
            const expandTrigger = 4

            setCollapsed(
                (previous) =>
                    element.scrollTop >
                    (previous ? expandTrigger : collapseTrigger)
            )
        }

        function handleScroll() {
            if (frameId !== null) return

            frameId = requestAnimationFrame(evaluate)
        }

        scrollElement.addEventListener('scroll', handleScroll, {
            passive: true,
        })
        evaluate()

        return () => {
            scrollElement.removeEventListener('scroll', handleScroll)

            if (frameId !== null) cancelAnimationFrame(frameId)
        }
    }, [enabled, scrollRef, titleRef])

    return enabled && collapsed
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
    const { isDesktop, isExpanded, toggle } = useSidebarOpenState(
        controlledOpen,
        onOpenChange
    )
    const { bodyRef, indicatorLayoutSyncing, indicatorStyle } =
        useSelectionIndicator(
            pathname,
            isDesktop,
            isExpanded,
            showSelectionIndicator
        )
    const collapsed = isDesktop && !isExpanded
    const hiddenCollapsed = collapsed && collapsedMode === 'hidden'
    const sidebarInlineStyle = getSidebarInlineStyle(width, collapsedWidth)

    return {
        pathname,
        isDesktop,
        isExpanded,
        collapsed,
        toggle,
        bodyRef,
        indicatorLayoutSyncing,
        indicatorStyle,
        hiddenCollapsed,
        sidebarInlineStyle,
    }
}
