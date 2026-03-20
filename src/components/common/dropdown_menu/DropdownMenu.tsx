'use client'

import styles from './DropdownMenu.module.css'
import { DropdownMenuButton } from './DropdownMenuButton'
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Ref to the trigger element that opened this menu. Used for positioning and click-outside detection. */
    triggerRef: React.RefObject<HTMLElement | null>
    /** Called when a click outside both the menu and trigger is detected, or when Escape is pressed. */
    onClose: () => void
    /** Optional boundary element — the menu will not shift upward past its top edge, and stays within its horizontal edges. */
    boundaryRef?: React.RefObject<HTMLElement | null>
    label?: React.ReactNode
    footer?: React.ReactNode
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
            style,
            className,
            children,
            ...props
        },
        externalRef
    ) {
        const internalRef = useRef<HTMLDivElement | null>(null)
        // Always-fresh ref so event handlers never close over stale state
        const onCloseRef = useRef(onClose)
        const [maxHeight, setMaxHeight] = useState<number | undefined>()
        const [offset, setOffset] = useState(0)
        const [offsetX, setOffsetX] = useState(0)
        // Tracks the currently-applied X shift so we can compute the natural
        // (untransformed) menu rect without creating a measurement feedback loop.
        const offsetXRef = useRef(0)

        useEffect(() => {
            onCloseRef.current = onClose
        })

        // Merge forwarded external ref with our internal ref
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

        // Viewport-aware positioning: slides the menu upward / horizontally and
        // caps its height so it is always fully visible within the viewport.
        useEffect(() => {
            const VIEWPORT_PADDING = 12
            const BOUNDARY_TOP_PADDING = 12
            const CONSTRAINED_BOTTOM_MARGIN = 16
            const TRIGGER_GAP = 6
            const HORIZONTAL_PADDING = 8

            const update = () => {
                const trigger = triggerRef.current
                const menu = internalRef.current
                if (!trigger || !menu) return

                // --- Vertical positioning ---
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

                setOffset(Math.floor(upwardShift))
                setMaxHeight(
                    availableHeight >= naturalHeight
                        ? undefined
                        : Math.max(0, Math.floor(availableHeight))
                )

                // --- Horizontal positioning ---
                // Subtract the currently-applied X transform to recover the
                // menu's natural (CSS-determined) viewport position.
                const menuRect = menu.getBoundingClientRect()
                const naturalLeft = menuRect.left - offsetXRef.current
                const naturalRight = menuRect.right - offsetXRef.current

                const boundary = boundaryRef?.current?.getBoundingClientRect()
                const hBoundaryLeft = (boundary?.left ?? 0) + HORIZONTAL_PADDING
                const hBoundaryRight =
                    (boundary?.right ?? window.innerWidth) - HORIZONTAL_PADDING

                let newOffsetX = 0
                if (naturalLeft < hBoundaryLeft) {
                    newOffsetX = Math.round(hBoundaryLeft - naturalLeft)
                } else if (naturalRight > hBoundaryRight) {
                    newOffsetX = Math.round(hBoundaryRight - naturalRight)
                }

                if (newOffsetX !== offsetXRef.current) {
                    offsetXRef.current = newOffsetX
                    setOffsetX(newOffsetX)
                }
            }

            update()

            // Re-run whenever the menu content resizes (e.g. expanding custom fields)
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

        // Click-outside and Escape key to close
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
                style={{
                    maxHeight: maxHeight != null ? `${maxHeight}px` : undefined,
                    transform: `translateY(-${offset}px) translateX(${offsetX}px)`,
                    ...style,
                }}
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
