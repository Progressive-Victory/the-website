'use client'

import styles from './DropdownButton.module.css'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { forwardRef } from 'react'
import { FiChevronDown } from 'react-icons/fi'

export interface DropdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isOpen: boolean
    label?: string
    menu?: React.ReactNode
    buttonVariant?: 'long' | 'short' | 'minimal'
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
                    <EllipsisVerticalIcon
                        className={styles.shortIcon}
                        aria-hidden="true"
                    />
                </button>
                {isOpen && menu}
            </>
        )
    }

    if (buttonVariant === 'minimal') {
        return (
            <>
                <button
                    type="button"
                    ref={ref}
                    className={[styles.buttonMinimal, className]
                        .filter(Boolean)
                        .join(' ')}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    {...props}
                >
                    <span>{label}</span>
                    <FiChevronDown
                        className={styles.chevronMinimal}
                        aria-hidden="true"
                        size={12}
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
