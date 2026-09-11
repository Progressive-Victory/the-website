import { DropdownOverlay, DropdownOverlayMenuContext } from './DropdownOverlay'
import styles from './DropdownOverlayButton.module.css'
import { cn } from '@/util'
import {
    type ButtonHTMLAttributes,
    type CSSProperties,
    type KeyboardEvent,
    type ReactNode,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import { createPortal } from 'react-dom'
import { FiCheck, FiChevronRight } from 'react-icons/fi'

type DropdownOverlayButtonMenu =
    | ReactNode
    | ((controls: { closeMenu: () => void }) => ReactNode)

export interface DropdownOverlayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode
    selected?: boolean
    checked?: boolean
    menu?: DropdownOverlayButtonMenu
}

export function DropdownOverlayButton({
    icon,
    selected,
    checked,
    menu,
    className,
    children,
    onClick,
    onKeyDown,
    ...props
}: DropdownOverlayButtonProps) {
    const hasCheckmark = checked !== undefined
    const hasMenu = menu !== undefined
    const menuGroup = useContext(DropdownOverlayMenuContext)
    const menuId = useId()
    const containerRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [isLocallyOpen, setIsLocallyOpen] = useState(false)
    const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null)
    const isOpen = menuGroup ? menuGroup.openMenuId === menuId : isLocallyOpen

    const setIsOpen = (open: boolean) => {
        if (menuGroup) {
            menuGroup.setOpenMenuId((currentMenuId) =>
                open ? menuId : currentMenuId === menuId ? null : currentMenuId
            )
            return
        }

        setIsLocallyOpen(open)
    }

    const cancelClose = () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
    }

    const openMenu = () => {
        cancelClose()
        setIsOpen(true)
    }

    const closeMenu = () => {
        cancelClose()
        setIsOpen(false)
    }

    const scheduleClose = () => {
        cancelClose()
        closeTimerRef.current = setTimeout(closeMenu, 180)
    }

    useLayoutEffect(() => {
        const button = buttonRef.current
        const submenu = menuRef.current
        if (!isOpen || !button || !submenu) return

        const updatePosition = () => {
            const buttonRect = button.getBoundingClientRect()
            const menuWidth = submenu.offsetWidth
            const menuHeight = submenu.offsetHeight
            const viewportPadding = 12
            const gap = 6
            const opensLeft =
                buttonRect.right + gap + menuWidth >
                window.innerWidth - viewportPadding
            const left = opensLeft
                ? buttonRect.left - gap - menuWidth
                : buttonRect.right + gap
            const top = Math.min(
                Math.max(viewportPadding, buttonRect.top - 10),
                Math.max(
                    viewportPadding,
                    window.innerHeight - menuHeight - viewportPadding
                )
            )

            setMenuStyle({
                position: 'fixed',
                top: `${Math.round(top)}px`,
                left: `${Math.round(Math.max(viewportPadding, left))}px`,
                right: 'auto',
            })
        }

        updatePosition()
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition, true)

        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const close = () => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
            closeTimerRef.current = null
            if (menuGroup) {
                menuGroup.setOpenMenuId((currentMenuId) =>
                    currentMenuId === menuId ? null : currentMenuId
                )
            } else {
                setIsLocallyOpen(false)
            }
        }

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node
            if (
                !containerRef.current?.contains(target) &&
                !menuRef.current?.contains(target)
            )
                close()
        }

        const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key !== 'Escape' && event.key !== 'ArrowLeft') return

            event.preventDefault()
            close()
            buttonRef.current?.focus()
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleDocumentKeyDown)
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleDocumentKeyDown)
        }
    }, [isOpen, menuGroup, menuId])

    useEffect(
        () => () => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
        },
        []
    )

    const renderedMenu = typeof menu === 'function' ? menu({ closeMenu }) : menu

    const handleClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick'] = (
        event
    ) => {
        onClick?.(event)
        if (!event.defaultPrevented && hasMenu) setIsOpen(!isOpen)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || !hasMenu) return

        if (event.key === 'ArrowRight' || event.key === 'Enter') {
            event.preventDefault()
            openMenu()
            requestAnimationFrame(() => {
                menuRef.current
                    ?.querySelector<HTMLElement>(
                        '[role="menuitem"], button:not(:disabled)'
                    )
                    ?.focus()
            })
        } else if (event.key === 'ArrowLeft' || event.key === 'Escape') {
            event.preventDefault()
            closeMenu()
            buttonRef.current?.focus()
        }
    }

    return (
        <div
            ref={containerRef}
            className={styles.container}
            onMouseEnter={() => {
                if (hasMenu && window.matchMedia('(hover: hover)').matches)
                    openMenu()
            }}
            onMouseLeave={() => hasMenu && scheduleClose()}
        >
            <button
                ref={buttonRef}
                type="button"
                className={cn(
                    styles.button,
                    icon && styles.hasIcon,
                    hasMenu && styles.hasMenu,
                    (hasCheckmark || hasMenu) && styles.hasTrailing,
                    checked && styles.checked,
                    selected && styles.selected,
                    checked && selected && styles.checkedSelected,
                    isOpen && styles.menuOpen,
                    className
                )}
                aria-pressed={selected}
                aria-current={checked ? 'true' : undefined}
                aria-haspopup={hasMenu ? 'menu' : undefined}
                aria-expanded={hasMenu ? isOpen : undefined}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                {...props}
            >
                {icon && <span className={styles.icon}>{icon}</span>}
                <span className={styles.label}>{children}</span>
                {hasMenu ? (
                    <span
                        className={cn(styles.trailing, styles.menuChevron)}
                        aria-hidden="true"
                    >
                        <FiChevronRight size={14} />
                    </span>
                ) : (
                    hasCheckmark && (
                        <span className={styles.trailing} aria-hidden="true">
                            {checked && <FiCheck size={14} />}
                        </span>
                    )
                )}
            </button>
            {isOpen &&
                hasMenu &&
                createPortal(
                    <DropdownOverlay
                        ref={menuRef}
                        role="menu"
                        data-dropdown-overlay-portal
                        className={styles.menu}
                        style={{
                            ...menuStyle,
                            visibility: menuStyle ? 'visible' : 'hidden',
                        }}
                        onMouseEnter={cancelClose}
                        onMouseLeave={scheduleClose}
                        onWheel={(event) => event.stopPropagation()}
                        body={renderedMenu}
                    />,
                    document.body
                )}
        </div>
    )
}
