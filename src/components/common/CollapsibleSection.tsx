'use client'

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
                <div className="my-4">
                    <h2
                        className={`relative text-xl ${subGroup ? 'font-medium' : 'font-semibold'}`}
                    >
                        {title}
                        <button
                            className="absolute right-0 top-0 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:text-gray-500"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <FiChevronDown /> : <FiChevronLeft />}
                        </button>
                    </h2>
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
            )}
            {isOpen && children}
        </section>
    )
}
