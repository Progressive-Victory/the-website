'use client'

import styles from './SelectionIndicator.module.css'
import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'

export interface IndicatorStyle {
    top: number
    height: number
    visible: boolean
}

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
    const bodyRef = useRef<HTMLDivElement | null>(null)
    const indicatorLayoutSyncTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)

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
            if (indicatorLayoutSyncTimeoutRef.current !== null) {
                clearTimeout(indicatorLayoutSyncTimeoutRef.current)
            }

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

            if (!bodyElement) {
                return
            }

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
            if (frameId !== null) {
                return
            }

            frameId = requestAnimationFrame(() => {
                frameId = null
                updateIndicator()
            })
        }

        updateIndicator()
        window.addEventListener('resize', updateIndicator)

        const bodyElement = bodyRef.current
        const resizeObserver =
            typeof ResizeObserver === 'undefined' || !bodyElement
                ? null
                : new ResizeObserver(() => {
                      syncIndicatorToLayout()
                      scheduleIndicatorSync()
                  })
        const mutationObserver = bodyElement
            ? new MutationObserver(scheduleIndicatorSync)
            : null

        if (bodyElement) {
            resizeObserver?.observe(bodyElement)
        }

        if (bodyElement && mutationObserver) {
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

            if (indicatorLayoutSyncTimeoutRef.current !== null) {
                clearTimeout(indicatorLayoutSyncTimeoutRef.current)
            }

            if (frameId !== null) {
                cancelAnimationFrame(frameId)
            }
        }
    }, [pathname, isDesktop, isOpen, enabled])

    return {
        bodyRef,
        indicatorLayoutSyncing,
        indicatorStyle,
    }
}

interface SelectionIndicatorProps {
    layoutSyncing: boolean
    style: IndicatorStyle
}

export function SelectionIndicator({
    layoutSyncing,
    style,
}: SelectionIndicatorProps): ReactElement {
    return (
        <div
            aria-hidden="true"
            className={styles.selectionIndicator}
            data-layout-syncing={layoutSyncing}
            data-visible={style.visible}
            style={{
                top: `${style.top}px`,
                height: `${style.height}px`,
            }}
        />
    )
}
