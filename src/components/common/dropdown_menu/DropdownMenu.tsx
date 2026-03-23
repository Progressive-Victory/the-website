'use client'

import styles from './DropdownMenu.module.css'
import { DropdownMenuButton } from './DropdownMenuButton'
import {
    forwardRef,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
} from 'react'

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    triggerRef: React.RefObject<HTMLElement | null>
    onClose: () => void
    boundaryRef?: React.RefObject<HTMLElement | null>
    label?: React.ReactNode
    footer?: React.ReactNode
    closeOnScroll?: boolean
}

function DropdownMenuDivider() {
    return (
        <div role="separator" aria-hidden="true" className={styles.divider} />
    )
}

export const DropdownMenu = Object.assign(
    forwardRef<HTMLDivElement, DropdownMenuProps>(function DropdownMenu(
        {
            triggerRef,
            onClose,
            boundaryRef,
            label,
            footer,
            closeOnScroll = true,
            style,
            className,
            children,
            ...props
        },
        externalRef
    ) {
        const internalRef = useRef<HTMLDivElement | null>(null)
        const onCloseRef = useRef(onClose)

        useEffect(() => {
            onCloseRef.current = onClose
        })

        const setRef = useCallback(
            (node: HTMLDivElement | null) => {
                internalRef.current = node
                if (typeof externalRef === 'function') externalRef(node)
                else if (externalRef)
                    (
                        externalRef as React.MutableRefObject<HTMLDivElement | null>
                    ).current = node
            },
            [externalRef]
        )

        useLayoutEffect(() => {
            const VIEWPORT_PADDING = 12
            const BOUNDARY_TOP_PADDING = 12
            const CONSTRAINED_BOTTOM_MARGIN = 16
            const TRIGGER_GAP = 6
            const HORIZONTAL_PADDING = 8

            const update = () => {
                const trigger = triggerRef.current
                const menu = internalRef.current
                if (!trigger || !menu) return

                menu.style.transform = ''
                menu.style.maxHeight = ''

                const triggerRect = trigger.getBoundingClientRect()
                const viewportHeight = window.innerHeight

                const naturalHeight = menu.scrollHeight
                const naturalTop = triggerRect.bottom + TRIGGER_GAP
                const naturalViewportBottom = viewportHeight - VIEWPORT_PADDING

                const topBoundary = boundaryRef?.current
                    ? boundaryRef.current.getBoundingClientRect().top +
                      BOUNDARY_TOP_PADDING
                    : VIEWPORT_PADDING

                const naturalBottom = naturalTop + naturalHeight
                const useConstrainedMargin =
                    naturalBottom > naturalViewportBottom
                const viewportBottom =
                    viewportHeight -
                    VIEWPORT_PADDING -
                    (useConstrainedMargin ? CONSTRAINED_BOTTOM_MARGIN : 0)

                const overflowBelow = Math.max(
                    0,
                    naturalBottom - viewportBottom
                )
                const maxUpwardShift = Math.max(0, naturalTop - topBoundary)
                const upwardShift = Math.min(overflowBelow, maxUpwardShift)

                const shiftedTop = naturalTop - upwardShift
                const availableHeight = viewportBottom - shiftedTop

                if (availableHeight < naturalHeight) {
                    menu.style.maxHeight = `${Math.max(0, Math.floor(availableHeight))}px`
                }

                // Read horizontal position with no transform applied (reset above),
                // so this always reflects the true layout position.
                const menuRect = menu.getBoundingClientRect()
                const boundary = boundaryRef?.current?.getBoundingClientRect()
                const hBoundaryLeft = (boundary?.left ?? 0) + HORIZONTAL_PADDING
                const hBoundaryRight =
                    (boundary?.right ?? window.innerWidth) - HORIZONTAL_PADDING

                let offsetX = 0
                if (menuRect.left < hBoundaryLeft) {
                    offsetX = Math.round(hBoundaryLeft - menuRect.left)
                } else if (menuRect.right > hBoundaryRight) {
                    offsetX = Math.round(hBoundaryRight - menuRect.right)
                }

                menu.style.transform = `translateY(-${Math.floor(upwardShift)}px) translateX(${offsetX}px)`
            }

            update()

            const ro = new ResizeObserver(update)
            if (internalRef.current) ro.observe(internalRef.current)
            window.addEventListener('resize', update)
            window.addEventListener('scroll', update, true)

            return () => {
                ro.disconnect()
                window.removeEventListener('resize', update)
                window.removeEventListener('scroll', update, true)
            }
        }, [triggerRef, boundaryRef])

        useEffect(() => {
            if (!closeOnScroll) return
            const handleScroll = (e: Event) => {
                const menu = internalRef.current
                if (menu?.contains(e.target as Node)) return
                onCloseRef.current()
            }
            window.addEventListener('scroll', handleScroll, true)
            return () =>
                window.removeEventListener('scroll', handleScroll, true)
        }, [closeOnScroll])

        useEffect(() => {
            const handleMouseDown = (e: MouseEvent) => {
                const menu = internalRef.current
                const trigger = triggerRef.current
                if (!menu || !trigger) return
                if (
                    !menu.contains(e.target as Node) &&
                    !trigger.contains(e.target as Node)
                ) {
                    onCloseRef.current()
                }
            }
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onCloseRef.current()
            }
            document.addEventListener('mousedown', handleMouseDown)
            document.addEventListener('keydown', handleKeyDown)
            return () => {
                document.removeEventListener('mousedown', handleMouseDown)
                document.removeEventListener('keydown', handleKeyDown)
            }
        }, [triggerRef])

        return (
            <div
                ref={setRef}
                className={[styles.menu, className].filter(Boolean).join(' ')}
                style={style}
                {...props}
            >
                {label != null && <div className={styles.label}>{label}</div>}
                {children}
                {footer != null && (
                    <div className={styles.footer}>{footer}</div>
                )}
            </div>
        )
    }),
    { Button: DropdownMenuButton, Divider: DropdownMenuDivider }
)
