'use client'

/*
 * useSelectionIndicator — tracks the active nav row and returns the animated
 * indicator geometry. Ported from the old `useSidebarIndicator`.
 *
 * Strategy (do not change without care — see repo memory):
 *  - MutationObserver with attributeFilter EXCLUDING `style` (avoids the
 *    feedback loop: updating the indicator's inline style would re-trigger).
 *  - measure via the offsetTop chain walked up to listRef (NOT
 *    getBoundingClientRect, which includes in-flight transforms).
 *  - schedule measurement on a single requestAnimationFrame.
 *  - a 140ms "syncing" flag suppresses the slide transition during layout
 *    reflows (e.g. accordion open) so the indicator snaps instead of lerping
 *    through an intermediate position.
 */
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

export interface IndicatorState {
    top: number
    height: number
    visible: boolean
    syncing: boolean
}

export function useSelectionIndicator(enabled: boolean): {
    listRef: RefObject<HTMLDivElement | null>
    indicator: IndicatorState
} {
    const pathname = usePathname()
    const listRef = useRef<HTMLDivElement | null>(null)
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [indicator, setIndicator] = useState<IndicatorState>({
        top: 0,
        height: 0,
        visible: false,
        syncing: false,
    })

    useEffect(() => {
        if (!enabled) {
            setIndicator((previous) =>
                previous.visible || previous.syncing
                    ? { ...previous, visible: false, syncing: false }
                    : previous
            )
            return
        }

        let frameId: number | null = null

        function beginSync() {
            if (syncTimeoutRef.current !== null) {
                clearTimeout(syncTimeoutRef.current)
            }
            setIndicator((previous) =>
                previous.syncing ? previous : { ...previous, syncing: true }
            )
            syncTimeoutRef.current = setTimeout(() => {
                setIndicator((previous) =>
                    previous.syncing
                        ? { ...previous, syncing: false }
                        : previous
                )
                syncTimeoutRef.current = null
            }, 140)
        }

        function getActiveLink(listElement: HTMLElement) {
            return (
                listElement.querySelector<HTMLElement>(
                    '[data-indicator-target="true"]:not([data-show-indicator="false"])'
                ) ??
                listElement.querySelector<HTMLElement>(
                    '[aria-current="page"]:not([data-show-indicator="false"])'
                )
            )
        }

        function updateIndicator() {
            const listElement = listRef.current
            if (!listElement) return

            const activeLink = getActiveLink(listElement)
            if (!activeLink) {
                setIndicator((previous) =>
                    previous.visible
                        ? { ...previous, visible: false }
                        : previous
                )
                return
            }

            let nextTop = 0
            let node: HTMLElement | null = activeLink
            while (node && node !== listElement) {
                nextTop += node.offsetTop
                node = node.offsetParent as HTMLElement | null
            }

            const nextHeight = activeLink.offsetHeight

            setIndicator((previous) => {
                const topChanged = Math.abs(previous.top - nextTop) > 0.5
                const heightChanged =
                    Math.abs(previous.height - nextHeight) > 0.5

                if (!topChanged && !heightChanged && previous.visible) {
                    return previous
                }

                return {
                    ...previous,
                    top: nextTop,
                    height: nextHeight,
                    visible: true,
                }
            })
        }

        function scheduleUpdate() {
            if (frameId !== null) return
            frameId = requestAnimationFrame(() => {
                frameId = null
                updateIndicator()
            })
        }

        updateIndicator()
        window.addEventListener('resize', updateIndicator)

        const listElement = listRef.current
        const resizeObserver =
            typeof ResizeObserver === 'undefined' || !listElement
                ? null
                : new ResizeObserver(() => {
                      beginSync()
                      scheduleUpdate()
                  })
        const mutationObserver = listElement
            ? new MutationObserver(scheduleUpdate)
            : null

        if (listElement) {
            resizeObserver?.observe(listElement)
            mutationObserver?.observe(listElement, {
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
            if (syncTimeoutRef.current !== null) {
                clearTimeout(syncTimeoutRef.current)
            }
            if (frameId !== null) {
                cancelAnimationFrame(frameId)
            }
        }
    }, [enabled, pathname])

    return { listRef, indicator }
}
