'use client'

import { NavItem, SubnavColumn } from '../types'
import { SubNavButton } from '@/components/common/buttons/button_types/SubNavButton'
import styles from '@/components/layout/header.module.css'
import { AnimatePresence, motion } from 'motion/react'

function DesktopSubnavColumn({ column }: { column: SubnavColumn }) {
    return (
        <div className={styles.subnavColumn}>
            <div className={styles.subnavColumnTitle}>{column.title}</div>
            <div className={styles.subnavColumnItems}>
                {column.items.map((child) => (
                    <SubNavButton
                        key={child.name}
                        label={child.name}
                        href={child.href}
                        buttonVariant="default"
                    />
                ))}
            </div>
        </div>
    )
}

interface DesktopSubnavProps {
    activeSubnav: NavItem | null
    isOpen: boolean
    onClose: () => void
}

export function DesktopSubnav({
    activeSubnav,
    isOpen,
    onClose,
}: DesktopSubnavProps) {
    const columns = activeSubnav?.subnav?.columns

    return (
        <>
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        key="desktop-subnav-backdrop"
                        className={styles.desktopSubnavBackdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        aria-hidden="true"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onClose()
                        }}
                    />
                ) : null}
            </AnimatePresence>

            <AnimatePresence>
                {columns?.length ? (
                    <motion.div
                        key="desktop-subnav"
                        className={styles.desktopSubnavRoot}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        onMouseLeave={onClose}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.desktopSubnavGrid}>
                            {columns.map((col) => (
                                <DesktopSubnavColumn
                                    key={col.title}
                                    column={col}
                                />
                            ))}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    )
}
