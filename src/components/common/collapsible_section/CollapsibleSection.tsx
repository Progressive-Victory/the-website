'use client'

import styles from './collapsibleSection.module.css'
import { cn } from '@/util'
import { useState } from 'react'
import { FiChevronDown, FiChevronLeft } from 'react-icons/fi'

export interface CollapsibleSectionProps {
    children?: React.ReactNode
    title?: string | React.ReactNode
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
                    <div
                        className={cn(
                            styles.title,
                            subGroup && styles.titleSub
                        )}
                    >
                        {typeof title === 'string' ? (
                            <h2>{title}</h2>
                        ) : (
                            <>{title}</>
                        )}
                        <button
                            className={styles.toggle}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <FiChevronDown /> : <FiChevronLeft />}
                        </button>
                    </div>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            )}
            {isOpen && children}
        </section>
    )
}
