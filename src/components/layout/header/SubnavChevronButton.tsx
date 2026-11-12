'use client'

import buttonStyles from '@/components/common/buttons/Button.module.css'
import type React from 'react'

interface SubnavChevronButtonProps {
    itemName: string
    onOpen: () => void
}

export function SubnavChevronButton({
    itemName,
    onOpen,
}: SubnavChevronButtonProps) {
    const stopAndOpen = (e: React.SyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onOpen()
    }

    return (
        <span
            className={buttonStyles.embeddedChevron}
            role="button"
            tabIndex={0}
            aria-label={`Open ${itemName} submenu`}
            onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            onClick={stopAndOpen}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    stopAndOpen(e)
                }
            }}
        >
            <span className={buttonStyles.navAffordance} aria-hidden="true" />
        </span>
    )
}
