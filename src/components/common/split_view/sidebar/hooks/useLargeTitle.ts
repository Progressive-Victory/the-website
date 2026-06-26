'use client'

/*
 * useLargeTitle — scroll-triggered iOS large-title collapse with hysteresis.
 * Ported from the old `useLargeTitleScroll`.
 *
 * Triggered, NOT scrubbed: returns a boolean; CSS runs the constant-duration
 * transition off a data attribute. Collapse when scrollTop > 12, expand when
 * <= 4 (the 8px gap prevents flicker at the threshold). rAF-debounced passive
 * scroll listener on the provided scroll surface.
 */
import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export function useLargeTitle(
    scrollRef: RefObject<HTMLDivElement | null>,
    enabled: boolean
): boolean {
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        if (!enabled) {
            setCollapsed((previous) => (previous ? false : previous))
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
            if (frameId !== null) return
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
    }, [enabled, scrollRef])

    return enabled ? collapsed : false
}
