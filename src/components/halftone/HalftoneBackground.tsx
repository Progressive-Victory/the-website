import styles from './HalftoneBackground.module.css'
import type React from 'react'

export function HalftoneBackground() {
    return (
        <div className={styles.halftoneBackground}>
            <div className={styles.halftoneDots} />
        </div>
    )
}
