'use client'

import styles from './OverlayBackdrop.module.css'
import cx from 'classnames'
import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { useEffect, useMemo, useState } from 'react'

export interface OverlayBackdropProps {
    open: boolean
    onClick?: () => void
    zIndex?: number
    blurPx?: number
    tintColor?: string

    lockBodyScroll?: boolean
    className?: string
}

export function OverlayBackdrop({
    open,
    onClick,
    zIndex = 30,
    blurPx = 10,
    tintColor = 'rgba(0, 0, 0, 0.18)',
    lockBodyScroll = false,
    className,
}: OverlayBackdropProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!lockBodyScroll) return
        if (!open) return

        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prevOverflow
        }
    }, [open, lockBodyScroll])

    const style = useMemo(
        () =>
            ({
                zIndex,
                backdropFilter: `blur(${blurPx}px)`,
                WebkitBackdropFilter: `blur(${blurPx}px)`,
                backgroundColor: tintColor,
            }) as React.CSSProperties,
        [zIndex, blurPx, tintColor]
    )

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {open ? (
                <motion.div
                    key="overlay-backdrop"
                    aria-hidden="true"
                    className={cx(styles.backdrop, className)}
                    style={style}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={onClick}
                />
            ) : null}
        </AnimatePresence>,
        document.body
    )
}