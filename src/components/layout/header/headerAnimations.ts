import type React from 'react'

export const PANEL_TRANSITION = {
    type: 'tween',
    duration: 0.18,
    ease: [0.22, 1, 0.36, 1],
} as const

export const menuButtonVariants = {
    closed: { scale: 1, color: '#FFFFFF' },
    open: { scale: 1, color: '#FFFFFF' },
    hover: { scale: 1.07, color: '#CE3728' },
    tap: { scale: 0.94 },
} as const

export const hamburgerLineBaseStyle: React.CSSProperties = {
    position: 'absolute',
    width: '1.75rem',
    height: '0.18rem',
    borderRadius: '999px',
    background: 'currentColor',
    transformOrigin: 'center',
}

export const hamburgerLineVariantsTop = {
    closed: { y: -7, rotate: 0, opacity: 1 },
    open: { y: 0, rotate: 45, opacity: 1 },
} as const

export const hamburgerLineVariantsMiddle = {
    closed: { y: 0, opacity: 1, scaleX: 1 },
    open: { y: 0, opacity: 0, scaleX: 0.6 },
} as const

export const hamburgerLineVariantsBottom = {
    closed: { y: 7, rotate: 0, opacity: 1 },
    open: { y: 0, rotate: -45, opacity: 1 },
} as const

export const itemVariants = {
    hidden: { y: -14, scale: 0.985 },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            ease: 'easeInOut',
            type: 'spring',
            stiffness: 300,
            damping: 5,
            mass: 0.55,
        },
    },
    exit: {
        y: -8,
        opacity: 0,
        scale: 0.99,
        filter: 'blur(6px)',
        transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] },
    },
} as const

export const drawerTransition = {
    type: 'tween',
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
} as const
