'use client'

import styles from './Detail.module.css'
import { BackButton } from '@/components/common/buttons'
import { cn } from '@/util'
import { usePanelBackNavigation } from '@/util/hooks'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

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
}: DetailProps) {
    const pathname = usePathname()
    const { handleNavigateBack, isPanelRoute } = usePanelBackNavigation()
    const isDashboardRootRoute = pathname === '/volunteer_dashboard'
    const mobileVisible = isPanelRoute || isDashboardRootRoute
    const showDetailHeader = bodyType === 'blank'

    return (
        <section
            data-mobile-visible={mobileVisible}
            className={cn(styles.detail, className)}
        >
            {showDetailHeader ? (
                <div className={styles.header}>
                    {isPanelRoute ? (
                        <BackButton
                            label="Back"
                            onClick={handleNavigateBack}
                            className={styles.backButton}
                        />
                    ) : null}
                    {label && <div className={styles.label}>{label}</div>}
                </div>
            ) : null}
            <div className={styles.body}>{body}</div>
            <div className={styles.footer} />
        </section>
    )
}
