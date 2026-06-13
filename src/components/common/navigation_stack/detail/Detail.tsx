'use client'

import styles from './Detail.module.css'
import Panel from '@/components/common/panel/Panel'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'
import { useMediaQuery } from 'usehooks-ts'

const PANEL_HISTORY_STORAGE_KEY = 'pv.admin.panel.history'

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

export function Detail({
    body,
    label,
    className,
    bodyType = 'blank',
}: DetailProps): ReactElement {
    const pathname = usePathname()
    const router = useRouter()
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const [hasPanelHistory, setHasPanelHistory] = useState(false)
    const [backTargetPanelLabel, setBackTargetPanelLabel] =
        useState('Back')
    const isPanelRoute = pathname.startsWith('/admin/panels/')
    const isAdminRootRoute = pathname === '/admin'
    const mobileVisible = isPanelRoute || isAdminRootRoute
    const showDetailHeader = bodyType === 'blank'
    const showPanelBackButton = isPanelRoute && (!isDesktop || hasPanelHistory)
    const backButtonText =
        !isDesktop && !hasPanelHistory ? 'Back' : backTargetPanelLabel

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        const rawHistory = window.sessionStorage.getItem(
            PANEL_HISTORY_STORAGE_KEY
        )
        if (!isPanelRoute) {
            setHasPanelHistory(false)
            setBackTargetPanelLabel('Back')
            return
        }

        const panelHistory = rawHistory
            ? (JSON.parse(rawHistory) as string[])
            : []

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

        const rawHistory = window.sessionStorage.getItem(
            PANEL_HISTORY_STORAGE_KEY
        )
        const panelHistory = rawHistory
            ? (JSON.parse(rawHistory) as string[])
            : []

        if (panelHistory.length > 0) {
            const nextHistory = panelHistory.slice(0, -1)
            const previousPanelPath = panelHistory[panelHistory.length - 1]

            window.sessionStorage.setItem(
                PANEL_HISTORY_STORAGE_KEY,
                JSON.stringify(nextHistory)
            )

            router.push(previousPanelPath)
            return
        }

        router.push('/admin')
    }

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
            <div className={styles.body}>
                {bodyType === 'panel' ? (
                    <Panel
                        includeHeader={Boolean(label)}
                        label={label}
                        headerLead={
                            showPanelBackButton ? (
                                <button
                                    className={styles.panelBackButton}
                                    onClick={handleBackNavigation}
                                    type="button"
                                >
                                    {backButtonText}
                                </button>
                            ) : undefined
                        }
                    >
                        {body}
                    </Panel>
                ) : (
                    body
                )}
            </div>
            <div className={styles.footer} />
        </section>
    )
}
