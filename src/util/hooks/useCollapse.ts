'use client'

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type DependencyList,
} from 'react'
import type { MouseEvent } from 'react'

const DEFAULT_ANIMATION_MS = 220

interface UseCollapseOptions {
    animationMs?: number
    deps?: DependencyList
}

export function useCollapse(options: UseCollapseOptions = {}) {
    const { animationMs = DEFAULT_ANIMATION_MS, deps = [] } = options
    const [isOpen, setIsOpen] = useState(false)
    const [shouldRender, setShouldRender] = useState(false)
    const [contentHeight, setContentHeight] = useState(0)
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)

    useLayoutEffect(() => {
        if (!shouldRender) {
            setContentHeight(0)
            return
        }

        function updateHeight() {
            setContentHeight(contentRef.current?.scrollHeight ?? 0)
        }

        updateHeight()

        const element = contentRef.current

        const resizeObserver =
            typeof ResizeObserver === 'undefined' || element === null
                ? null
                : new ResizeObserver(() => {
                      updateHeight()
                  })

        if (resizeObserver && element) {
            resizeObserver.observe(element)
        }

        return () => {
            resizeObserver?.disconnect()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldRender, ...deps])

    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current !== null) {
                clearTimeout(closeTimeoutRef.current)
            }
        }
    }, [])

    function toggle(event?: MouseEvent<HTMLElement>) {
        event?.preventDefault()
        event?.stopPropagation()

        if (closeTimeoutRef.current !== null) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }

        if (isOpen) {
            setIsOpen(false)
            closeTimeoutRef.current = setTimeout(() => {
                setShouldRender(false)
                closeTimeoutRef.current = null
            }, animationMs)
            return
        }

        setShouldRender(true)
        requestAnimationFrame(() => {
            setIsOpen(true)
        })
    }

    return { isOpen, shouldRender, contentHeight, contentRef, toggle }
}
