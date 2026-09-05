'use client'

import styles from './DropdownButton.module.css'
import {
    forwardRef,
    useEffect,
    useRef,
    useState,
    type MouseEvent as ReactMouseEvent,
} from 'react'
import { FaEllipsisVertical } from 'react-icons/fa6'
import { FiChevronDown } from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'

/*
 * How To Use:
 *
 * This component is a standardized button trigger for our dropdown menus.
 * It has predefined styling and functionality options built in as defaults
 * as well as avenues to customize said style and function.
 *
 * For best results use DropdownButton in conjunction with the DropdownOverlay.
 *
 *
 *
 * DropdownButtonProps:
 * - label: The text label for the button.
 * - buttonVariant: Predefined style variant for button.
 * - className: Additional CSS class applied to the <button> element.
 * - menu: The dropdown menu content, this is where you put DropdownOverlay.
 *
 *
 * ButtonVariants:
 *     - 'long': Shows button label with an animating chevron icon on the right.
 *     - 'short': No label shown, only an Ellipsis Icon
 *     - 'icon': No label shown, only a custom Icon
 *     - 'minimal': Shows button label only.
 *
 *
 *
 *
 * Example usage:
 *
 * import { DropdownButton } from '@/components/common'
 *
 *
 * <DropdownButton
 *     label="Example"
 *     buttonVariant="long"
 *     menu={ <DropdownOverlay> }
 * />
 *
 */

export type DropdownButtonVariant = 'long' | 'short' | 'minimal' | 'icon'

interface DropdownVariantConfig {
    ariaHasPopup: 'menu' | 'dialog'
    buttonClassName: string
    chevronClassName?: string
    chevronSize?: number
    showLabel: boolean
    showEllipsisIcon: boolean
    showCustomIcon: boolean
}

function getDropdownVariantConfig(
    variant: DropdownButtonVariant
): DropdownVariantConfig {
    if (variant === 'icon') {
        return {
            ariaHasPopup: 'menu',
            buttonClassName: styles.buttonIcon,
            showLabel: false,
            showEllipsisIcon: false,
            showCustomIcon: true,
        }
    }

    if (variant === 'short') {
        return {
            ariaHasPopup: 'menu',
            buttonClassName: styles.buttonShort,
            showLabel: false,
            showEllipsisIcon: true,
            showCustomIcon: false,
        }
    }

    if (variant === 'minimal') {
        return {
            ariaHasPopup: 'dialog',
            buttonClassName: styles.buttonMinimal,
            chevronClassName: styles.chevronMinimal,
            chevronSize: 12,
            showLabel: true,
            showEllipsisIcon: false,
            showCustomIcon: false,
        }
    }

    return {
        ariaHasPopup: 'dialog',
        buttonClassName: styles.button,
        chevronClassName: styles.chevron,
        chevronSize: 14,
        showLabel: true,
        showEllipsisIcon: false,
        showCustomIcon: false,
    }
}

export interface DropdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string
    icon?: React.ReactNode
    menu?:
        | React.ReactNode
        | ((controls: { closeDropdown: () => void }) => React.ReactNode)
    buttonVariant?: DropdownButtonVariant
}

export const DropdownButton = forwardRef<
    HTMLButtonElement,
    DropdownButtonProps
>(function DropdownButton(
    { label, icon, menu, buttonVariant = 'long', className, onClick, ...props },
    ref
) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const closeDropdown = () => {
        setIsOpen(false)
    }

    useEffect(() => {
        if (!isOpen) return

        const onDocumentMouseDown = (event: MouseEvent) => {
            const container = containerRef.current
            if (!container) return

            if (!container.contains(event.target as Node)) {
                closeDropdown()
            }
        }

        const onDocumentKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeDropdown()
            }
        }

        document.addEventListener('mousedown', onDocumentMouseDown)
        document.addEventListener('keydown', onDocumentKeyDown)

        return () => {
            document.removeEventListener('mousedown', onDocumentMouseDown)
            document.removeEventListener('keydown', onDocumentKeyDown)
        }
    }, [isOpen])

    const variant = getDropdownVariantConfig(buttonVariant)

    const renderedMenu =
        typeof menu === 'function' ? menu({ closeDropdown }) : menu

    const handleButtonClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return

        setIsOpen((current) => !current)
    }

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <button
                type="button"
                ref={ref}
                className={[variant.buttonClassName, className]
                    .filter(Boolean)
                    .join(' ')}
                aria-haspopup={variant.ariaHasPopup}
                aria-expanded={isOpen}
                onClick={handleButtonClick}
                {...props}
            >
                {variant.showLabel ? <span>{label}</span> : null}
                {variant.showCustomIcon ? (
                    isOpen ? (
                        <IoClose size={20} aria-hidden="true" />
                    ) : (
                        icon
                    )
                ) : variant.showEllipsisIcon ? (
                    <FaEllipsisVertical
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
            {isOpen && renderedMenu}
        </div>
    )
})
