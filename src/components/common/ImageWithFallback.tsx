'use client'

import cx from 'classnames'
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
    const [hasErrored, setHasErrored] = useState(false)
    const fallbackSrc =
        'https://dummyjson.com/image/100x100/e8e0e0/d0c8c8?text=!&fontFamily=Poppins'
    const finalSrc = hasErrored || useFallback ? fallbackSrc : src

    return (
        <Image
            key={`${src}-${useFallback}`}
            src={finalSrc}
            alt={alt}
            width={width}
            height={height}
            className={cx('aspect-square rounded-full object-cover', className)}
            onError={() => setHasErrored(true)}
            loading={priority ? undefined : loading}
            priority={priority}
        />
    )
}
