'use client'

import styles from './ProgressBar.module.css'

function clampPercent(value: number | null | undefined) {
    return Math.max(0, Math.min(100, value ?? 0))
}

function defaultValueFormatter(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return '—'
    return `${value}%`
}

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string
    value: number | null | undefined
    fill: string
    valueText?: string
    trackBackground?: string
    valueFormatter?: (value: number | null | undefined) => string
}

export function ProgressBar({
    label,
    value,
    fill,
    valueText,
    trackBackground,
    valueFormatter = defaultValueFormatter,
    className,
    ...props
}: ProgressBarProps) {
    return (
        <div
            className={[styles.container, className].filter(Boolean).join(' ')}
            {...props}
        >
            <div className={styles.row}>
                <span>{label}</span>
                <span>{valueText ?? valueFormatter(value)}</span>
            </div>
            <div
                className={styles.track}
                aria-hidden="true"
                style={{
                    background: trackBackground,
                }}
            >
                <span
                    className={styles.fill}
                    style={{
                        width: `${clampPercent(value)}%`,
                        background: fill,
                    }}
                />
            </div>
        </div>
    )
}
