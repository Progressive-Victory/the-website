import { ImageWithFallback } from './ImageWithFallback'
import styles from './PersonCard.module.css'
import { cn } from '@/util'
import type { ReactNode } from 'react'

export interface PersonCardProps {
    name: string
    imageSrc: string
    imageSize?: number
    subtitle?: string
    badge?: ReactNode
    imageFrameClassName?: string
    className?: string
}

export function PersonCard({
    name,
    imageSrc,
    imageSize = 92,
    subtitle,
    badge,
    imageFrameClassName,
    className,
}: PersonCardProps) {
    return (
        <div className={cn(styles.card, className)}>
            <div className={cn(styles.imageFrame, imageFrameClassName)}>
                <ImageWithFallback
                    src={imageSrc}
                    alt={`${name} profile image`}
                    width={imageSize}
                    height={imageSize}
                    className={styles.image}
                />
                {badge}
            </div>
            <div className={styles.meta}>
                <div className={styles.nameRow}>
                    <p className={styles.name}>{name}</p>
                </div>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
        </div>
    )
}
