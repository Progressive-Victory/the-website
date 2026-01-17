'use client'

import { useEffect } from 'react'

export const Frame: React.FC<{
    type?: string
    className?: string
    src?: string
    children?: React.ReactNode
    title: string
    sandbox?: string
    width?: number
    height?: number
}> = ({
    type = 'form',
    className,
    src,
    children,
    title,
    sandbox,
    width,
    height,
}) => {
    useEffect(() => {
        if (!window.onblur) {
            window.focus()
        }
    }, [])

    return (
        <iframe
            title={title}
            id={type}
            className={className}
            seamless
            src={src}
            loading="lazy"
            sandbox={sandbox}
            width={width}
            height={height}
        >
            {children}
        </iframe>
    )
}
