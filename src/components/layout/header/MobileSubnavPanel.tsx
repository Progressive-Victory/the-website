'use client'

import { NavItem, SubnavColumn } from '../types'
import { SubNavButton } from '@/components/common/buttons/button_types/SubNavButton'
import styles from '@/components/layout/header.module.css'
import { motion } from 'motion/react'
import { PANEL_TRANSITION, itemVariants } from './headerAnimations'

function MobileBackButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            className={styles.mobileBackButton}
            onClick={onClick}
            aria-label="Back to main menu"
        >
            <span className={styles.mobileBackIcon} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M15 18l-6-6 6-6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span className={styles.mobileBackText}>Back</span>
        </button>
    )
}

function MobileSubnavColumn({ column }: { column: SubnavColumn }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                rowGap: '0.5rem',
            }}
        >
            <div
                style={{
                    padding: '0 10px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    color: 'rgba(255,255,255,0.82)',
                }}
            >
                {column.title}
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: '0.75rem',
                }}
            >
                {column.items.map((child) => (
                    <motion.div
                        key={child.name}
                        variants={itemVariants}
                        animate="visible"
                        exit="exit"
                    >
                        <SubNavButton
                            label={child.name}
                            href={child.href}
                            buttonVariant="long"
                            showChevron={false}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

interface MobileSubnavPanelProps {
    item: NavItem
    onBack: () => void
}

export function MobileSubnavPanel({ item, onBack }: MobileSubnavPanelProps) {
    return (
        <motion.div
            key="mobile-panel-subnav"
            className={styles.mobilePanel}
            initial={{ x: '8%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: '8%', opacity: 0 }}
            transition={PANEL_TRANSITION}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: '1rem',
                }}
            >
                <div className={styles.mobileSubnavTopBar}>
                    <MobileBackButton onClick={onBack} />
                    <div className={styles.mobileSubnavTitle}>{item.name}</div>
                </div>

                {item.subnav?.columns?.map((col) => (
                    <MobileSubnavColumn key={col.title} column={col} />
                ))}
            </div>
        </motion.div>
    )
}
