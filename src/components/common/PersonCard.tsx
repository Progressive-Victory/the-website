import styles from './PersonCard.module.css'
import { cn } from '@/util'
import type { ReactNode } from 'react'

export interface PersonCardProps {
    name: string
    avatar: ReactNode
    subtitle?: string
    className?: string
}

export function PersonCard({
    name,
    avatar,
    subtitle,
    className,
}: PersonCardProps) {
    return (
        <div className={cn(styles.card, className)}>
            <div className={styles.imageFrame}>{avatar}</div>
            <div className={styles.meta}>
                <div className={styles.nameRow}>
                    <p className={styles.name}>{name}</p>
                </div>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
        </div>
    )
}
