'use client'

import styles from './ImageWithFallback.module.css'
import { cn } from '@/util'
import Image from 'next/image'
import { useState } from 'react'

export interface ImageWithFallbackProps {
    src: string
    alt: string
    width: number
    height: number
    useFallback?: boolean
    className?: string
    loading?: 'lazy' | 'eager'
    priority?: boolean
}

export function ImageWithFallback({
    src,
    alt,
    width,
    height,
    useFallback = false,
    className,
    loading = 'lazy',
    priority = false,
}: ImageWithFallbackProps) {
    const [erroredSrc, setErroredSrc] = useState<string | null>(null)

    const fallbackSrc =
        'https://dummyjson.com/image/100x100/e8e0e0/d0c8c8?text=!&fontFamily=Poppins'
    const finalSrc = useFallback || erroredSrc === src ? fallbackSrc : src

    return (
        <Image
            src={finalSrc}
            alt={alt}
            width={width}
            height={height}
            className={cn(styles.image, className)}
            onError={() => setErroredSrc(src)}
            loading={priority ? undefined : loading}
            priority={priority}
        />
    )
}
