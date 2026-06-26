'use client'

/*
 * Detail — SKELETON (replaces Detail + PanelBackButton, symmetric to Sidebar).
 *
 * Compound parts render in place. Presence drives structure: omit
 * <Detail.Header> and there's no header chrome; omit <Detail.Footer> and there's
 * no footer rail.
 */
import { usePanelHistory } from '../history/usePanelHistory'
import styles from './Detail.module.css'
import type { ReactElement, ReactNode } from 'react'

interface SlotProps {
    children?: ReactNode
}

function DetailRoot({ children }: SlotProps): ReactElement {
    return (
        <section className={styles.detail} data-part="detail">
            {children}
        </section>
    )
}

function DetailHeader({ children }: SlotProps): ReactElement {
    return (
        <div className={styles.header} data-part="detail-header">
            {children}
        </div>
    )
}

function DetailBody({ children }: SlotProps): ReactElement {
    return (
        <div className={styles.body} data-part="detail-body">
            {children}
        </div>
    )
}

function DetailFooter({ children }: SlotProps): ReactElement {
    return (
        <div className={styles.footer} data-part="detail-footer">
            {children}
        </div>
    )
}

export interface DetailBackButtonProps {
    className?: string
}

function DetailBackButton({
    className,
}: DetailBackButtonProps): ReactElement | null {
    const { canGoBack, backLabel, goBack } = usePanelHistory()

    if (!canGoBack) {
        return null
    }

    return (
        <button
            type="button"
            className={[styles.backButton, className].filter(Boolean).join(' ')}
            onClick={goBack}
            data-part="detail-back"
        >
            {backLabel}
        </button>
    )
}

export const Detail = Object.assign(DetailRoot, {
    Header: DetailHeader,
    Body: DetailBody,
    Footer: DetailFooter,
    BackButton: DetailBackButton,
})
