'use client'

import buttonStyles from '@/components/common/buttons/button.module.css'
import type React from 'react'

export function ChevronButton(props: {
    label: string
    onClick: () => void
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            aria-label={props.label}
            onClick={props.onClick}
            disabled={props.disabled}
            className={buttonStyles.chevronOnlyButton}
        >
            <span className={buttonStyles.navAffordance} aria-hidden="true" />
        </button>
    )
}
