'use client'

/*
 * usePanelHistory — admin panel back-navigation. Ported from the old
 * `usePanelBackNavigation` that lived in Detail.tsx.
 *
 * Resolves the back label from the sessionStorage stack and exposes a `goBack`
 * action. On desktop the label is the previous panel's name; on mobile with no
 * history it falls back to "Back". `goBack` pops the stack and routes to the
 * previous panel, or to /admin when the stack is empty.
 */
import { readPanelHistory, writePanelHistory } from './panelHistory'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export interface PanelHistoryState {
    canGoBack: boolean
    backLabel: string
    goBack: () => void
}

function formatPanelLabelFromPath(path: string): string {
    if (!path.startsWith('/admin/panels/')) {
        return 'Back'
    }

    const panelSlug = path.slice('/admin/panels/'.length).split('/')[0]

    if (!panelSlug) {
        return 'Back'
    }

    return panelSlug
        .split('-')
        .filter(Boolean)
        .map((segment) => segment[0].toUpperCase() + segment.slice(1))
        .join(' ')
}

export function usePanelHistory(): PanelHistoryState {
    const pathname = usePathname()
    const router = useRouter()
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const isPanelRoute = pathname.startsWith('/admin/panels/')
    const [hasHistory, setHasHistory] = useState(false)
    const [previousLabel, setPreviousLabel] = useState('Back')

    useEffect(() => {
        if (typeof window === 'undefined') return

        if (!isPanelRoute) {
            setHasHistory(false)
            setPreviousLabel('Back')
            return
        }

        const history = readPanelHistory()
        const previous = history[history.length - 1]
        setHasHistory(history.length > 0)
        setPreviousLabel(previous ? formatPanelLabelFromPath(previous) : 'Back')
    }, [isPanelRoute, pathname])

    function goBack() {
        if (typeof window === 'undefined') return

        const history = readPanelHistory()
        if (history.length > 0) {
            const previous = history[history.length - 1]
            writePanelHistory(history.slice(0, -1))
            router.push(previous)
            return
        }

        router.push('/admin')
    }

    const backLabel = !isDesktop && !hasHistory ? 'Back' : previousLabel

    return {
        canGoBack: isPanelRoute,
        backLabel,
        goBack,
    }
}
