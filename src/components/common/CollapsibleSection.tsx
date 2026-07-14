'use client'

import styles from './CollapsibleSection.module.css'
import { cn } from '@/util'
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
                <h2
                    className={`relative my-4 flex items-start justify-between gap-4 text-xl ${subGroup ? 'font-medium' : 'font-semibold'}`}
                >
                    <span className="min-w-0">
                        <span className="block truncate">{title}</span>
                        {subtitle ? (
                            <span className="block text-sm font-normal text-gray-500">
                                {subtitle}
                            </span>
                        ) : null}
                    </span>
                    <button
                        className="absolute right-0 top-0 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:text-gray-500"
                        onClick={() => setIsOpen(!isOpen)}
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
