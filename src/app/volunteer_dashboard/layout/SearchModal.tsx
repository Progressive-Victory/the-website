'use client'

import styles from './SearchModal.module.css'
import { motion } from 'motion/react'
import React, { ChangeEvent, useEffect, useState } from 'react'

export interface SearchModalProps {
    open: boolean
    onClose: () => void
    title: string
    subtitle: string
    searchValue: string
    onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void
    children: React.ReactNode
}

const backdropVariants = {
    open: {
        opacity: 1,
        backdropFilter: 'blur(10px) saturate(140%)',
    },
    closed: {
        opacity: 0,
        backdropFilter: 'blur(0px) saturate(140%)',
    },
} as const

const modalVariants = {
    open: {
        opacity: 1,
        y: 0,
        scale: 1,
    },
    closed: {
        opacity: 0,
        y: 10,
        scale: 0.985,
    },
} as const

const backdropTransition = {
    duration: 0.22,
    ease: [0.2, 0.9, 0.2, 1],
} as const

const modalTransition = {
    duration: 0.26,
    ease: [0.22, 1, 0.36, 1],
} as const

export function SearchModal({
    open,
    onClose,
    title,
    subtitle,
    searchValue,
    onSearchChange,
    children,
}: SearchModalProps) {
    const [mounted, setMounted] = useState(false)
    const [animateOpen, setAnimateOpen] = useState(false)

    useEffect(() => {
        if (open) {
            setMounted(true)
            requestAnimationFrame(() => setAnimateOpen(true))
        } else if (mounted) {
            setAnimateOpen(false)
        }
    }, [open, mounted])

    if (!mounted) return null

    return (
        <motion.div
            className={styles.modalBackdrop}
            role="presentation"
            initial="closed"
            animate={animateOpen ? 'open' : 'closed'}
            variants={backdropVariants}
            transition={backdropTransition}
            onAnimationComplete={() => {
                if (!animateOpen) setMounted(false)
            }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <motion.div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                initial="closed"
                animate={animateOpen ? 'open' : 'closed'}
                variants={modalVariants}
                transition={modalTransition}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.modalHeaderLeft}>
                        <div className={styles.modalTitle}>{title}</div>
                        <div className={styles.modalSubtitle}>{subtitle}</div>
                    </div>

                    <div className={styles.modalHeaderRight}>
                        <div className={styles.modalSearch}>
                            <div className={styles.searchInputBare}>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchValue}
                                    onChange={onSearchChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.modalBody}>{children}</div>

                <div className={styles.modalFooter}>
                    <button
                        type="button"
                        className={styles.modalFooterButton}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}
