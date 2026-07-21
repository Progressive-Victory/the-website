'use client'

import styles from './CollapsibleSection.module.css'
import cx from 'classnames'
import { useState } from 'react'
import { FiChevronDown, FiChevronLeft } from 'react-icons/fi'

export interface CollapsibleSectionProps {
    children?: React.ReactNode
    title?: string
    subtitle?: string
    initialOpenState?: boolean
    subGroup?: boolean
}

export function CollapsibleSection({
    children,
    title,
    subtitle,
    initialOpenState = true,
    subGroup,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(initialOpenState)

    return (
        <section>
            {title && (
                <div className={styles.header}>
                    <h2
                        className={cx(
                            styles.title,
                            subGroup && styles.titleSub
                        )}
                    >
                        {title}
                        <button
                            className={styles.toggle}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <FiChevronDown /> : <FiChevronLeft />}
                        </button>
                    </h2>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            )}
            {isOpen && children}
        </section>
    )
}
