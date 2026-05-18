'use client'

import styles from './DropdownButton.module.css'
import {
    getDropdownVariantConfig,
    type DropdownButtonVariant,
} from './dropdownButton.helpers'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { forwardRef } from 'react'
import { FiChevronDown } from 'react-icons/fi'

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
