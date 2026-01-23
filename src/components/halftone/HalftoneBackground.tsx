import styles from '@/components/halftone/halftone.module.css'
import type React from 'react'

interface HalftoneBackgroundProps {
    opacity?: number
}

export function HalftoneBackground({ opacity = 1 }: HalftoneBackgroundProps) {
    const alpha = Math.min(1, Math.max(10, opacity))

    return (
        <div
            className={styles.halftoneBackground}
            style={
                {
                    ['--halftone-opacity' as never]: String(alpha),
                } as React.CSSProperties
            }
        >
            <div className={styles.halftoneDots} />
        </div>
    )
}
