'use client'

import styles from './DropdownButton.module.css'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import {
    forwardRef,
    useEffect,
    useRef,
    useState,
    type MouseEvent as ReactMouseEvent,
} from 'react'
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
    variant: DropdownButtonVariant
): DropdownVariantConfig {
    if (variant === 'short') {
        return {
            ariaHasPopup: 'menu',
            buttonClassName: styles.buttonShort,
            showLabel: false,
            showEllipsisIcon: true,
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
        }
    }

    return {
        ariaHasPopup: 'dialog',
        buttonClassName: styles.button,
        chevronClassName: styles.chevron,
        chevronSize: 14,
        showLabel: true,
        showEllipsisIcon: false,
    }
}

export interface DropdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string
    menu?:
        | React.ReactNode
        | ((controls: { closeDropdown: () => void }) => React.ReactNode)
    buttonVariant?: DropdownButtonVariant
}

export const DropdownButton = forwardRef<
    HTMLButtonElement,
    DropdownButtonProps
>(function DropdownButton(
    { label, menu, buttonVariant = 'long', className, onClick, ...props },
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
        <div ref={containerRef}>
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
            {isOpen && renderedMenu}
        </div>
    )
})
