'use client'

import styles from './DropdownButton.module.css'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { forwardRef } from 'react'
import { FiChevronDown } from 'react-icons/fi'

export type DropdownButtonVariant = 'long' | 'short' | 'minimal'

interface DropdownVariantConfig {
    ariaHasPopup: 'menu' | 'dialog'
    buttonClassName: string
    chevronClassName?: string
    chevronSize?: number
    showLabel: boolean
    showEllipsisIcon: boolean
}

function getDropdownVariantConfig(
    variant: DropdownButtonVariant,
    classes: {
        long: string
        short: string
        minimal: string
        chevron: string
        chevronMinimal: string
    }
): DropdownVariantConfig {
    if (variant === 'short') {
        return {
            ariaHasPopup: 'menu',
            buttonClassName: classes.short,
            showLabel: false,
            showEllipsisIcon: true,
        }
    }

    if (variant === 'minimal') {
        return {
            ariaHasPopup: 'dialog',
            buttonClassName: classes.minimal,
            chevronClassName: classes.chevronMinimal,
            chevronSize: 12,
            showLabel: true,
            showEllipsisIcon: false,
        }
    }

    return {
        ariaHasPopup: 'dialog',
        buttonClassName: classes.long,
        chevronClassName: classes.chevron,
        chevronSize: 14,
        showLabel: true,
        showEllipsisIcon: false,
    }
}

export interface DropdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isOpen: boolean
    label?: string
    menu?: React.ReactNode
    buttonVariant?: DropdownButtonVariant
}

export const DropdownButton = forwardRef<
    HTMLButtonElement,
    DropdownButtonProps
>(function DropdownButton(
    { isOpen, label, menu, buttonVariant = 'long', className, ...props },
    ref
) {
    const variant = getDropdownVariantConfig(buttonVariant, {
        long: styles.button,
        short: styles.buttonShort,
        minimal: styles.buttonMinimal,
        chevron: styles.chevron,
        chevronMinimal: styles.chevronMinimal,
    })

    return (
        <>
            <button
                type="button"
                ref={ref}
                className={[variant.buttonClassName, className]
                    .filter(Boolean)
                    .join(' ')}
                aria-haspopup={variant.ariaHasPopup}
                aria-expanded={isOpen}
                {...props}
            >
                {variant.showLabel ? <span>{label}</span> : null}
                {variant.showEllipsisIcon ? (
                    <EllipsisVerticalIcon
                        className={styles.shortIcon}
                        aria-hidden="true"
                    />
                ) : (
                    <FiChevronDown
                        className={variant.chevronClassName}
                        aria-hidden="true"
                        size={variant.chevronSize}
                    />
                )}
            </button>
            {isOpen && menu}
        </>
    )
})
