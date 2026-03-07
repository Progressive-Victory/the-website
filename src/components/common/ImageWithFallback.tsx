'use client'

import styles from './ImageWithFallback.module.css'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export interface ImageWithFallbackProps {
    src: string
    alt: string
    width: number
    height: number
    useFallback?: boolean
    className?: string
}

export function ImageWithFallback({
    src,
    alt,
    width,
    height,
    useFallback = false,
    className,
}: ImageWithFallbackProps) {
    const [hasErrored, setHasErrored] = useState(false)
    const withExternalClass = (baseClass: string) =>
        [baseClass, className].filter(Boolean).join(' ')

    useEffect(() => {
        setHasErrored(false)
    }, [src, useFallback])

    const shouldUsePlaceholder = hasErrored || useFallback

    if (shouldUsePlaceholder) {
        const markSize = Math.max(
            14,
            Math.round(Math.min(width, height) * 0.52)
        )

        return (
            <div
                role="img"
                aria-label={alt}
                style={{
                    width,
                    height,
                    aspectRatio: '1 / 1',
                }}
                className={withExternalClass(
                    `${styles.circleBase} ${styles.placeholder}`
                )}
            >
                <span
                    aria-hidden="true"
                    className={styles.placeholderMark}
                    style={{
                        fontSize: markSize,
                    }}
                >
                    !
                </span>
            </div>
        )
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            style={{
                aspectRatio: '1 / 1',
            }}
            className={withExternalClass(
                `${styles.circleBase} ${styles.image}`
            )}
            onError={() => setHasErrored(true)}
        />
    )
}
