'use client'

import { useState } from 'react'
import { FiChevronDown, FiChevronLeft } from 'react-icons/fi'

export interface CollapsibleSectionProps {
    children?: React.ReactNode
    title?: string
    initialOpenState?: boolean
}

export function CollapsableSection({
    children,
    title,
    initialOpenState,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(initialOpenState)

    return (
        <section>
            {title && (
                <h2 className="relative my-4 text-xl font-semibold">
                    {title}
                    <button
                        className="absolute right-0 top-0 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:text-gray-500"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <FiChevronDown /> : <FiChevronLeft />}
                    </button>
                </h2>
            )}
            {isOpen && children}
        </section>
    )
}
