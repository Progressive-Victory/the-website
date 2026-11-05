'use client'

import {
    createContext,
    useContext,
    useLayoutEffect,
    useState,
    type RefObject,
} from 'react'
import { useMediaQuery } from 'usehooks-ts'

export const NAVIGATION_STACK_DESKTOP_MIN_WIDTH_REM = 64

export const NavigationStackWidthContext = createContext<number | null>(null)

export function useElementWidth(
    ref: RefObject<HTMLElement | null>
): number | null {
    const [width, setWidth] = useState<number | null>(null)

    useLayoutEffect(() => {
        const element = ref.current
        if (!element) return

        setWidth(element.getBoundingClientRect().width)
        if (typeof ResizeObserver === 'undefined') return

        const observer = new ResizeObserver(([entry]) => {
            if (entry) setWidth(entry.contentRect.width)
        })
        observer.observe(element)
        return () => observer.disconnect()
    }, [ref])

    return width
}

function remToPx(rem: number): number {
    if (typeof window === 'undefined') return rem * 16
    const rootFontSize = parseFloat(
        window.getComputedStyle(document.documentElement).fontSize
    )
    return rem * (Number.isFinite(rootFontSize) ? rootFontSize : 16)
}

export function useIsContainerDesktop(width?: number | null): boolean {
    const contextWidth = useContext(NavigationStackWidthContext)
    const viewportIsDesktop = useMediaQuery(
        `(min-width: ${NAVIGATION_STACK_DESKTOP_MIN_WIDTH_REM}rem)`
    )
    const resolvedWidth = width === undefined ? contextWidth : width

    if (resolvedWidth === null || resolvedWidth <= 0) return viewportIsDesktop
    return resolvedWidth >= remToPx(NAVIGATION_STACK_DESKTOP_MIN_WIDTH_REM)
}
