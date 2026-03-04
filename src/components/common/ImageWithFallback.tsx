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
            className={cx('aspect-square max-h-[48px] rounded-full', className)}
            onError={() => setHasErrored(true)}
        />
    )
}
