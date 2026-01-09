import styles from './blog.module.css'
import { Logo } from '@/components/common'
import React from 'react'

export function BlogHeader() {
    function DoubleTextEffect(
        text = 'TEST',
        upperColor = '#09223a',
        lowerColor = '#4483C7'
    ) {
        const words = text.split(' ')
        return (
            <div aria-label={text}>
                {words.map((word, index) => (
                    <div key={index} className={styles.doubleWord}>
                        <span
                            className={styles.doubleWordTop}
                            style={{ color: upperColor }}
                        >
                            {word}
                        </span>
                        <span
                            className={styles.doubleWordBottom}
                            style={{ color: lowerColor }}
                        >
                            {word}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className={styles.header}>
            <div className={styles.textColumn}>
                {DoubleTextEffect('PROGRESSIVE')}
                {DoubleTextEffect('VICTORY')}
                {DoubleTextEffect('BLOG', '#4483C7', '#09223a')}
            </div>

            <div className={styles.logoWrapper}>
                <Logo className={styles.logoBack} />
                <Logo pColor="#4483C7" />
            </div>
        </div>
    )
}
