'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

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
    const searchParams = useSearchParams()
    const campaign = searchParams?.get('campaign')
    const source = searchParams?.get('source')

    if (!src) {
        const root = process.env.NEXT_PUBLIC_FORM

        if (type === 'map') {
            src = `${root}/map?dotColor=CE3728&backGroundColor=FFFFFF&mapFill=2986CC`
        } else {
            src = `${root}/`

            if (campaign) {
                src += `?campaign=${campaign}`
            }
            if (source || campaign) {
                src += `${src.includes('?') ? '&' : '?'}source=${source}`
            }
        }
    }

    useEffect(() => {
        if (!window.onblur) {
            window.focus()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
