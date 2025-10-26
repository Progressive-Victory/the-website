import Image from 'next/image'
import { useState } from 'react'

export interface ImageWithFallbackProps {
    src: string
    alt: string
    useFallback?: boolean
}

export function ImageWithFallback({
    src,
    alt,
    useFallback = false,
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
            width={48}
            height={48}
            className="aspect-square max-h-[48px] rounded-full"
            onError={() => setHasErrored(true)}
        />
    )
}
