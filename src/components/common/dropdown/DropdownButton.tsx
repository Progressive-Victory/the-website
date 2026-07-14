'use client'

import styles from './DropdownButton.module.css'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import {
    forwardRef,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type MouseEvent as ReactMouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { FiChevronDown } from 'react-icons/fi'
import { IoClose } from 'react-icons/io5'

export type DropdownButtonVariant = 'long' | 'short' | 'minimal' | 'icon'

interface DropdownVariantConfig {
    ariaHasPopup: 'menu' | 'dialog'
    buttonClassName: string
    chevronClassName?: string
    chevronSize?: number
    showLabel: boolean
    showEllipsisIcon: boolean
    showChevron: boolean
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
            showChevron: false,
            showCustomIcon: false,
        }
    }

    if (variant === 'icon') {
        return {
            ariaHasPopup: 'dialog',
            buttonClassName: styles.buttonIcon,
            showLabel: false,
            showEllipsisIcon: false,
            showChevron: false,
            showCustomIcon: true,
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
            showChevron: true,
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
        showChevron: true,
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
    icon?: React.ReactNode
    openIcon?: React.ReactNode
    /**
     * Render the menu in a portal anchored to the button so it escapes
     * `overflow: hidden` ancestors. Defaults to true for the `icon` variant.
     */
    portal?: boolean
}

export const DropdownButton = forwardRef<
    HTMLButtonElement,
    DropdownButtonProps
>(function DropdownButton(
    {
        label,
        menu,
        buttonVariant = 'long',
        icon,
        openIcon = <IoClose size={20} />,
        portal = buttonVariant === 'icon',
        className,
        onClick,
        ...props
    },
    ref
) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const menuRef = useRef<HTMLDivElement | null>(null)
    const [anchorStyle, setAnchorStyle] = useState<CSSProperties | null>(null)

    const closeDropdown = () => {
        setIsOpen(false)
    }

    const updateAnchorStyle = useCallback(() => {
        const button = buttonRef.current
        if (!button) return

        const rect = button.getBoundingClientRect()
        setAnchorStyle({
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            zIndex: 1000,
        })
    }, [])

    useLayoutEffect(() => {
        if (!isOpen || !portal) {
            setAnchorStyle(null)
            return
        }

        updateAnchorStyle()

        window.addEventListener('scroll', updateAnchorStyle, true)
        window.addEventListener('resize', updateAnchorStyle)

        return () => {
            window.removeEventListener('scroll', updateAnchorStyle, true)
            window.removeEventListener('resize', updateAnchorStyle)
        }
    }, [isOpen, portal, updateAnchorStyle])

    useEffect(() => {
        if (!isOpen) return

        const onDocumentMouseDown = (event: MouseEvent) => {
            const target = event.target as Node
            const container = containerRef.current
            const menuEl = menuRef.current

            if (container?.contains(target)) return
            if (menuEl?.contains(target)) return

            closeDropdown()
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
        <div ref={containerRef} className={styles.container}>
            <button
                type="button"
                ref={(node) => {
                    buttonRef.current = node
                    if (typeof ref === 'function') {
                        ref(node)
                    } else if (ref) {
                        ref.current = node
                    }
                }}
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
                    <EllipsisVerticalIcon
                        className={styles.shortIcon}
                        aria-hidden="true"
                    />
                ) : null}
                {variant.showCustomIcon ? (isOpen ? openIcon : icon) : null}
                {variant.showChevron ? (
                    <FiChevronDown
                        className={variant.chevronClassName}
                        aria-hidden="true"
                        size={variant.chevronSize}
                    />
                ) : null}
            </button>
            {isOpen && portal && anchorStyle
                ? createPortal(
                      <div
                          ref={menuRef}
                          className={styles.menuAnchor}
                          style={anchorStyle}
                      >
                          {renderedMenu}
                      </div>,
                      document.body
                  )
                : null}
            {isOpen && !portal ? renderedMenu : null}
        </div>
    )
})
