'use client'

import { cn } from '@/util'
import Image from 'next/image'
import { useEffect, useState } from 'react'

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
    const [hasErrored, setHasErrored] = useState(false)

    useEffect(() => {
        setHasErrored(false)
    }, [src, useFallback])

    return (
        <Image
            src={
                hasErrored || useFallback
                    ? 'https://dummyjson.com/image/100x100/e8e0e0/d0c8c8?text=!&fontFamily=Poppins'
                    : src
            }
            alt={alt}
            width={width}
            height={height}
            className={cn('aspect-square rounded-full object-cover', className)}
            onError={() => setHasErrored(true)}
            loading={priority ? undefined : loading}
            priority={priority}
        />
    )
}
