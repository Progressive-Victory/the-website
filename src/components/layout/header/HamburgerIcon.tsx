'use client'

import {
    hamburgerLineVariantsBottom,
    hamburgerLineVariantsMiddle,
    hamburgerLineVariantsTop,
} from './headerAnimations'
import styles from '@/components/layout/header.module.css'
import { motion } from 'motion/react'

export function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <motion.span
            className={[
                styles.headerMenuIconWrapper,
                styles.hamburgerIcon,
            ].join(' ')}
            aria-hidden="true"
            initial={false}
            animate={isOpen ? 'open' : 'closed'}
        >
            <motion.span
                variants={hamburgerLineVariantsTop}
                className={styles.hamburgerLineBaseStyle}
            />
            <motion.span
                variants={hamburgerLineVariantsMiddle}
                className={styles.hamburgerLineBaseStyle}
            />
            <motion.span
                variants={hamburgerLineVariantsBottom}
                className={styles.hamburgerLineBaseStyle}
            />
        </motion.span>
    )
}
