'use client'

import styles from '@/components/layout/header.module.css'
import { motion } from 'motion/react'
import {
    hamburgerLineBaseStyle,
    hamburgerLineVariantsBottom,
    hamburgerLineVariantsMiddle,
    hamburgerLineVariantsTop,
} from './headerAnimations'

export function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <motion.span
            className={styles.headerMenuIconWrapper}
            aria-hidden="true"
            initial={false}
            animate={isOpen ? 'open' : 'closed'}
            style={{
                display: 'inline-flex',
                width: '1.75rem',
                height: '1.75rem',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
            <motion.span
                variants={hamburgerLineVariantsTop}
                className={styles.headerMenuIcon}
                style={hamburgerLineBaseStyle}
            />
            <motion.span
                variants={hamburgerLineVariantsMiddle}
                className={styles.headerMenuIcon}
                style={hamburgerLineBaseStyle}
            />
            <motion.span
                variants={hamburgerLineVariantsBottom}
                className={styles.headerMenuIcon}
                style={hamburgerLineBaseStyle}
            />
        </motion.span>
    )
}
