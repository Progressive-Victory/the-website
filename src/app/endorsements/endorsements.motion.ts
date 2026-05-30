export const galleryLayoutTransition = {
    type: 'spring',
    stiffness: 280,
    damping: 28,
    mass: 0.9,
} as const

export const waveListVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.028,
            delayChildren: 0.04,
        },
    },
    exit: {
        transition: {
            staggerChildren: 0.012,
            staggerDirection: -1,
        },
    },
} as const

export const waveItemVariants = {
    hidden: {
        opacity: 0,
        x: 26,
        y: 16,
        scale: 0.94,
        filter: 'blur(3px)',
    },
    visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            stiffness: 260,
            damping: 24,
            mass: 0.82,
        },
    },
    exit: {
        opacity: 0,
        x: -10,
        y: -8,
        scale: 0.97,
        filter: 'blur(2px)',
        transition: {
            duration: 0.16,
            ease: [0.4, 0, 0.2, 1],
        },
    },
} as const

export const headingVariants = {
    hidden: {
        opacity: 0,
        y: 6,
        filter: 'blur(2px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            delay: 0.08,
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -4,
        filter: 'blur(1.5px)',
        transition: {
            duration: 0.14,
            ease: [0.4, 0, 0.2, 1],
        },
    },
} as const
