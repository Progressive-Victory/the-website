'use client'

import { readPanelHistory, writePanelHistory } from '../panelHistory'
import styles from './Detail.module.css'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'
import { useMediaQuery } from 'usehooks-ts'

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

export interface DetailProps {
    body?: ReactNode
    label?: string
    className?: string
    bodyType?: 'blank' | 'panel'
}

interface PanelBackButtonProps {
    className?: string
    showOnDesktop?: boolean
    showOnMobile?: boolean
}

function usePanelBackNavigation() {
    const pathname = usePathname()
    const router = useRouter()
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const [hasPanelHistory, setHasPanelHistory] = useState(false)
    const [backTargetPanelLabel, setBackTargetPanelLabel] = useState('Back')
    const isPanelRoute = pathname.startsWith('/admin/panels/')

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        if (!isPanelRoute) {
            setHasPanelHistory(false)
            setBackTargetPanelLabel('Back')
            return
        }

        const panelHistory = readPanelHistory()

        const previousPanelPath = panelHistory[panelHistory.length - 1]

        setHasPanelHistory(panelHistory.length > 0)
        setBackTargetPanelLabel(
            previousPanelPath
                ? formatPanelLabelFromPath(previousPanelPath)
                : 'Back'
        )
    }, [isPanelRoute, pathname])

    function handleBackNavigation() {
        if (typeof window === 'undefined') {
            return
        }

        const panelHistory = readPanelHistory()

        if (panelHistory.length > 0) {
            const nextHistory = panelHistory.slice(0, -1)
            const previousPanelPath = panelHistory[panelHistory.length - 1]

            writePanelHistory(nextHistory)

            router.push(previousPanelPath)
            return
        }

        router.push('/admin')
    }

    const backButtonText =
        !isDesktop && !hasPanelHistory ? 'Back' : backTargetPanelLabel

    return {
        backButtonText,
        handleBackNavigation,
        isDesktop,
        isPanelRoute,
    }
}

export function PanelBackButton({
    className,
    showOnDesktop = false,
    showOnMobile = true,
}: PanelBackButtonProps): ReactElement | null {
    const { backButtonText, handleBackNavigation, isDesktop, isPanelRoute } =
        usePanelBackNavigation()

    const shouldShowForViewport =
        (isDesktop && showOnDesktop) || (!isDesktop && showOnMobile)

    if (!isPanelRoute || !shouldShowForViewport) {
        return null
    }

    return (
        <button
            className={[styles.panelBackButton, className]
                .filter(Boolean)
                .join(' ')}
            onClick={handleBackNavigation}
            type="button"
        >
            {backButtonText}
        </button>
    )
}

export function Detail({
    body,
    label,
    className,
    bodyType = 'blank',
}: DetailProps): ReactElement {
    const pathname = usePathname()
    const { backButtonText, handleBackNavigation, isPanelRoute } =
        usePanelBackNavigation()
    const isAdminRootRoute = pathname === '/admin'
    const mobileVisible = isPanelRoute || isAdminRootRoute
    const showDetailHeader = bodyType === 'blank'

    return (
        <section
            data-mobile-visible={mobileVisible}
            className={[styles.detail, className].filter(Boolean).join(' ')}
        >
            {showDetailHeader ? (
                <div className={styles.header}>
                    {isPanelRoute ? (
                        <button
                            className={styles.backButton}
                            onClick={handleBackNavigation}
                            type="button"
                        >
                            {backButtonText}
                        </button>
                    ) : null}
                    {label && <div className={styles.label}>{label}</div>}
                </div>
            ) : null}
            <div className={styles.body}>{body}</div>
            <div className={styles.footer} />
        </section>
    )
}
