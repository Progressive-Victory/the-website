'use client'

import styles from './ImageWithFallback.module.css'
import { cn } from '@/util'
import Image from 'next/image'
import { useState, type CSSProperties } from 'react'
import { FaUser } from 'react-icons/fa'

export interface ImageWithFallbackProps {
    src: string
    alt: string
    width: number
    height: number
    useFallback?: boolean
    pending?: boolean
    skeletonDelay?: number
    className?: string
    loading?: 'lazy' | 'eager'
    priority?: boolean
    onReady?: () => void
}

export function ImageWithFallback({
    src,
    alt,
    width,
    height,
    useFallback = false,
    pending = false,
    skeletonDelay = 0,
    className,
    loading = 'lazy',
    priority = false,
    onReady,
}: ImageWithFallbackProps) {
    const [erroredSrc, setErroredSrc] = useState<string>()
    const [loadedSrc, setLoadedSrc] = useState<string>()
    const showFallback = useFallback || erroredSrc === src
    const showImage = !pending && !showFallback
    const loaded = showImage && loadedSrc === src

    return (
        <span
            role={showImage ? undefined : 'img'}
            aria-label={showImage ? undefined : alt}
            aria-busy={pending}
            data-pending={pending}
            data-loaded={loaded}
            data-waiting={showImage && !loaded}
            className={cn(styles.image, styles.fallback, className)}
            style={
                {
                    width,
                    height,
                    '--skeleton-delay': `${skeletonDelay}ms`,
                } as CSSProperties
            }
        >
            <FaUser className={styles.fallbackIcon} />
            {showImage && (
                <Image
                    key={src}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={styles.photo}
                    onLoad={() => {
                        setLoadedSrc(src)
                        onReady?.()
                    }}
                    onError={() => {
                        setErroredSrc(src)
                        onReady?.()
                    }}
                    loading={priority ? undefined : loading}
                    priority={priority}
                />
            )}
        </span>
    )
}
