'use client'

import styles from './DashboardWidget.module.css'
import { forwardRef } from 'react'

export interface DashboardWidgetProps extends React.HTMLAttributes<HTMLElement> {
    title: string
    value: React.ReactNode
    stat1: React.ReactNode
    stat2: React.ReactNode
}

export const DashboardWidget = forwardRef<HTMLElement, DashboardWidgetProps>(
    function DashboardWidget(
        { title, value, stat1, stat2, className, ...props },
        ref
    ) {
        return (
            <article
                ref={ref}
                className={[styles.card, className].filter(Boolean).join(' ')}
                {...props}
            >
                <div className={styles.title}>{title}</div>
                <div className={styles.value}>{value}</div>
                <div className={styles.stats}>
                    <span>{stat1}</span>
                    <span className={styles.separator}>·</span>
                    <span>{stat2}</span>
                </div>
            </article>
        )
    }
)
