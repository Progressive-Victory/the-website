'use client'

import { DonateButton } from '@/components/common/buttons/button_types/DonateButton'
import styles from '@/components/layout/header.module.css'
import { cn } from '@/util'
import { motion } from 'motion/react'
import { HamburgerIcon } from './HamburgerIcon'
import { menuButtonVariants } from './headerAnimations'

interface MobileMenuControlsProps {
    isOpen: boolean
    onToggle: () => void
}

export function MobileMenuControls({
    isOpen,
    onToggle,
}: MobileMenuControlsProps) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
            }}
        >
            <DonateButton
                label="Donate"
                className={cn(
                    styles.mobileDonateButton,
                    isOpen && styles.fadeOutTop
                )}
            />

            <motion.button
                type="button"
                className={styles.headerMenuButton}
                onClick={onToggle}
                initial={false}
                animate={isOpen ? 'open' : 'closed'}
                whileHover="hover"
                whileTap="tap"
                variants={menuButtonVariants}
                transition={{
                    type: 'spring',
                    stiffness: 520,
                    damping: 32,
                }}
                aria-label={
                    isOpen ? 'Close navigation menu' : 'Open navigation menu'
                }
                aria-expanded={isOpen}
                aria-controls="site-nav-drawer"
            >
                <HamburgerIcon isOpen={isOpen} />
            </motion.button>
        </div>
    )
}
