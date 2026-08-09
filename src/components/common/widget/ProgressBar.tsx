'use client'

import styles from './ProgressBar.module.css'
import { cn } from '@/util'

function defaultValueFormatter(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return '—'
    return `${value}%`
}

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string
    value: number | null | undefined
    fill: string
    valueText?: string
    barBackground?: string
    valueFormatter?: (value: number | null | undefined) => string
}

export function ProgressBar({
    label,
    value,
    fill,
    valueText,
    barBackground,
    valueFormatter = defaultValueFormatter,
    className,
    ...props
}: ProgressBarProps) {
    return (
        <div className={cn(styles.container, className)} {...props}>
            <div className={styles.row}>
                <span>{label}</span>
                <span>{valueText ?? valueFormatter(value)}</span>
            </div>
            <div
                className={styles.bar}
                aria-hidden="true"
                style={{
                    background: barBackground,
                }}
            >
                <span
                    className={styles.fill}
                    style={{
                        width: `${Math.max(0, Math.min(100, value ?? 0))}%`,
                        background: fill,
                    }}
                />
            </div>
        </div>
    )
}
