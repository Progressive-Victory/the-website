'use client'

import styles from './BackButton.module.css'
import { cn } from '@/util'
import { FiChevronLeft } from 'react-icons/fi'

interface BackButtonProps {
    label: string
    onClick: () => void
    className?: string
}

export function BackButton({ label, onClick, className }: BackButtonProps) {
    return (
        <button
            className={cn(styles.backButton, className)}
            onClick={onClick}
            type="button"
            aria-label={label}
        >
            <FiChevronLeft size={18} />
            <span>{label}</span>
        </button>
    )
}
