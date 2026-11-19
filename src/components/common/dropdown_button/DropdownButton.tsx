'use client'

import styles from './DropdownButton.module.css'
import { forwardRef } from 'react'
import { FaEllipsisVertical } from 'react-icons/fa6'
import { FiChevronDown } from 'react-icons/fi'

export interface DropdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isOpen: boolean
    label?: string
    menu?: React.ReactNode
    buttonVariant?: 'long' | 'short'
}

export const DropdownButton = forwardRef<
    HTMLButtonElement,
    DropdownButtonProps
>(function DropdownButton(
    { isOpen, label, menu, buttonVariant = 'long', className, ...props },
    ref
) {
    if (buttonVariant === 'short') {
        return (
            <>
                <button
                    type="button"
                    ref={ref}
                    className={[styles.buttonShort, className]
                        .filter(Boolean)
                        .join(' ')}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    {...props}
                >
                    <FaEllipsisVertical
                        className={styles.shortIcon}
                        aria-hidden="true"
                    />
                </button>
                {isOpen && menu}
            </>
        )
    }

    return (
        <>
            <button
                type="button"
                ref={ref}
                className={[styles.button, className].filter(Boolean).join(' ')}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                {...props}
            >
                <span>{label}</span>
                <FiChevronDown
                    className={styles.chevron}
                    aria-hidden="true"
                    size={14}
                />
            </button>
            {isOpen && menu}
        </>
    )
})
