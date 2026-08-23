'use client'

import styles from './DashboardWidget.module.css'
import { cn } from '@/util'
import { forwardRef } from 'react'

export interface DashboardWidgetProps extends React.HTMLAttributes<HTMLElement> {
    title: string
    value: React.ReactNode
    valueChange?: React.ReactNode
    stat1?: React.ReactNode
    stat2?: React.ReactNode
}

export const DashboardWidget = forwardRef<HTMLElement, DashboardWidgetProps>(
    function DashboardWidget(
        { title, value, valueChange, stat1, stat2, className, ...props },
        ref
    ) {
        const hasStat1 = stat1 != null
        const hasStat2 = stat2 != null
        const hasValueChange = valueChange != null

        return (
            <article
                ref={ref}
                className={cn(styles.card, className)}
                {...props}
            >
                <div className={styles.title}>{title}</div>
                <div className={styles.valueRow}>
                    <div className={styles.value}>{value}</div>
                    {hasValueChange && (
                        <span className={styles.valueChange}>
                            {valueChange}
                        </span>
                    )}
                </div>
                {(hasStat1 || hasStat2) && (
                    <div className={styles.stats}>
                        {hasStat1 && <span>{stat1}</span>}
                        {hasStat1 && hasStat2 && (
                            <span className={styles.separator}>·</span>
                        )}
                        {hasStat2 && <span>{stat2}</span>}
                    </div>
                )}
            </article>
        )
    }
)
