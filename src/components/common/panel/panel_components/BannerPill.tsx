import styles from './BannerPill.module.css'
import { cn } from '@/util'
import type { ReactNode } from 'react'

export type BannerPillTone =
    'default' | 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'darkRed'

export interface BannerPillProps {
    label: ReactNode
    tone?: BannerPillTone
    className?: string
}

const toneClass: Record<BannerPillTone, string> = {
    default: styles.default,
    red: styles.red,
    orange: styles.orange,
    green: styles.green,
    blue: styles.blue,
    purple: styles.purple,
    darkRed: styles.darkRed,
}

export function BannerPill({
    label,
    tone = 'default',
    className,
}: BannerPillProps) {
    return (
        <span className={cn(styles.pill, toneClass[tone], className)}>
            {label}
        </span>
    )
}
