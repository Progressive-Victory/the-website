'use client'

import styles from './DropdownOverlay.module.css'
import { areOverlayStylesEqual } from '@/util'
import {
    createContext,
    forwardRef,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type Dispatch,
    type RefObject,
    type SetStateAction,
} from 'react'
import { FiX } from 'react-icons/fi'

type DropdownOverlayNarrowLayoutMode = 'container' | 'trigger' | 'flow'

type DropdownOverlayAlign = 'auto' | 'start' | 'end'

const DROPDOWN_OVERLAY_LAYOUT_CONFIG = {
    viewportPadding: 12,
    narrowBreakpointQuery: '(max-width: 53rem)',
    parentGrowthThreshold: 24,
    triggerBoundaryInset: 8,
    overlayOffset: 6,
} as const

const INITIAL_OVERLAY_RESPONSIVE_STYLE: CSSProperties = {
    maxWidth: `calc(100dvw - ${DROPDOWN_OVERLAY_LAYOUT_CONFIG.viewportPadding * 2}px)`,
}

interface DropdownOverlayMenuContextValue {
    openMenuId: string | null
    setOpenMenuId: Dispatch<SetStateAction<string | null>>
}

export const DropdownOverlayMenuContext =
    createContext<DropdownOverlayMenuContextValue | null>(null)

interface RectLike {
    left: number
    right: number
}

interface VerticalRectLike {
    top: number
    bottom: number
}

function getFlipBoundary(
    anchor: HTMLElement
): (RectLike & VerticalRectLike) | undefined {
    const boundary = anchor.closest('[data-dropdown-boundary]')
    if (!boundary) return undefined

    const rect = boundary.getBoundingClientRect()
    const header = boundary.querySelector('[data-dropdown-boundary-top]')
    const firstContent =
        header?.nextElementSibling ?? boundary.firstElementChild
    const lastContent = boundary.lastElementChild

    return {
        left: rect.left,
        right: rect.right,
        top: firstContent?.getBoundingClientRect().top ?? rect.top,
        bottom: lastContent?.getBoundingClientRect().bottom ?? rect.bottom,
    }
}

function computeVerticalOverlayStyle(
    anchorRect: VerticalRectLike,
    boundary: VerticalRectLike,
    overlayHeight: number
): CSSProperties {
    const { overlayOffset } = DROPDOWN_OVERLAY_LAYOUT_CONFIG
    const spaceBelow = boundary.bottom - anchorRect.bottom
    const spaceAbove = anchorRect.top - boundary.top
    const openAbove =
        overlayHeight + overlayOffset > spaceBelow && spaceAbove > spaceBelow

    return openAbove
        ? { top: 'auto', bottom: `calc(100% + ${overlayOffset}px)` }
        : { bottom: undefined }
}

interface ComputeResponsiveOverlayStyleInput {
    narrowLayoutMode: DropdownOverlayNarrowLayoutMode
    align: DropdownOverlayAlign
    isNarrowLayout: boolean
    viewportWidth: number
    viewportMaxWidth: number
    anchorRect: RectLike
    anchorWidth: number
    boundaryRect: RectLike
    flipBoundaryRect?: RectLike
    overlayScrollWidth: number
}

function shouldAlignLeftWithinBoundary(
    align: DropdownOverlayAlign,
    anchorRect: RectLike,
    boundaryRect: RectLike,
    fitWidth: number,
    viewportWidth: number
) {
    const { viewportPadding, triggerBoundaryInset } =
        DROPDOWN_OVERLAY_LAYOUT_CONFIG
    const minLeft = Math.max(
        boundaryRect.left + triggerBoundaryInset,
        viewportPadding
    )
    const maxRight = Math.min(
        boundaryRect.right - triggerBoundaryInset,
        viewportWidth - viewportPadding
    )
    const roomAlignedLeft = maxRight - anchorRect.left
    const roomAlignedRight = anchorRect.right - minLeft
    const preferLeft = align === 'start'

    if (fitWidth <= (preferLeft ? roomAlignedLeft : roomAlignedRight))
        return preferLeft
    if (fitWidth <= (preferLeft ? roomAlignedRight : roomAlignedLeft))
        return !preferLeft
    return roomAlignedLeft >= roomAlignedRight
}

function computeResponsiveOverlayStyle({
    narrowLayoutMode,
    align,
    isNarrowLayout,
    viewportWidth,
    viewportMaxWidth,
    anchorRect,
    anchorWidth,
    boundaryRect,
    flipBoundaryRect,
    overlayScrollWidth,
}: ComputeResponsiveOverlayStyleInput): CSSProperties {
    if (isNarrowLayout) {
        if (narrowLayoutMode === 'flow') {
            return {
                position: 'static',
                top: 'auto',
                left: 'auto',
                right: 'auto',
                width: '100%',
                minWidth: '100%',
                maxWidth: '100%',
                marginTop: '0',
            }
        }

        const boundaryInset =
            narrowLayoutMode === 'container'
                ? 0
                : DROPDOWN_OVERLAY_LAYOUT_CONFIG.triggerBoundaryInset
        const boundaryStart = Math.max(
            boundaryRect.left + boundaryInset,
            DROPDOWN_OVERLAY_LAYOUT_CONFIG.viewportPadding
        )
        const usableEnd = Math.min(
            boundaryRect.right - boundaryInset,
            viewportWidth - DROPDOWN_OVERLAY_LAYOUT_CONFIG.viewportPadding
        )
        const usableStart =
            narrowLayoutMode === 'trigger'
                ? Math.max(anchorRect.left, boundaryStart)
                : boundaryStart
        const availableWidth = Math.max(0, usableEnd - usableStart)
        const width = Math.min(
            Math.max(anchorWidth, availableWidth),
            viewportMaxWidth
        )
        const leftOffset = usableStart - anchorRect.left

        return {
            left: `${Math.round(leftOffset)}px`,
            right: 'auto',
            width: `${Math.floor(width)}px`,
            minWidth: `${Math.floor(width)}px`,
            maxWidth: `${Math.floor(width)}px`,
        }
    }

    const fitWidth = Math.min(overlayScrollWidth, viewportMaxWidth)
    const rightAlignedStart = anchorRect.right - fitWidth
    const leftAlignedEnd = anchorRect.left + fitWidth
    const fitsWhenAlignedLeft =
        rightAlignedStart < DROPDOWN_OVERLAY_LAYOUT_CONFIG.viewportPadding &&
        leftAlignedEnd <=
            viewportWidth - DROPDOWN_OVERLAY_LAYOUT_CONFIG.viewportPadding
    const shouldAlignLeft = flipBoundaryRect
        ? shouldAlignLeftWithinBoundary(
              align,
              anchorRect,
              flipBoundaryRect,
              fitWidth,
              viewportWidth
          )
        : align === 'start' || (align === 'auto' && fitsWhenAlignedLeft)

    return {
        position: undefined,
        top: undefined,
        marginTop: undefined,
        left: shouldAlignLeft ? '0px' : 'auto',
        right: shouldAlignLeft ? 'auto' : '0px',
        width: undefined,
        minWidth: undefined,
        maxWidth: `${Math.floor(viewportMaxWidth)}px`,
    }
}

interface UseDropdownOverlayResponsiveStyleInput {
    overlayRef: RefObject<HTMLDivElement | null>
    narrowLayoutMode: DropdownOverlayNarrowLayoutMode
    align: DropdownOverlayAlign
}

function useDropdownOverlayResponsiveStyle({
    overlayRef,
    narrowLayoutMode,
    align,
}: UseDropdownOverlayResponsiveStyleInput): CSSProperties {
    const [responsiveStyle, setResponsiveStyle] = useState<CSSProperties>(
        INITIAL_OVERLAY_RESPONSIVE_STYLE
    )

    useLayoutEffect(() => {
        const overlay = overlayRef.current
        if (!overlay) return

        const {
            viewportPadding,
            narrowBreakpointQuery,
            parentGrowthThreshold,
        } = DROPDOWN_OVERLAY_LAYOUT_CONFIG

        const narrowLayoutMedia = window.matchMedia(narrowBreakpointQuery)
        let frame = 0

        const findResponsiveBoundary = (anchor: HTMLElement): HTMLElement => {
            const anchorWidth = anchor.clientWidth
            let node: HTMLElement | null = anchor

            while (node) {
                const parentElement = node.parentElement
                if (!(parentElement instanceof HTMLElement)) {
                    break
                }

                const parent: HTMLElement = parentElement
                if (parent.clientWidth >= anchorWidth + parentGrowthThreshold) {
                    return parent
                }
                node = parent
            }

            return anchor
        }

        const computeAnchoredStyle = (
            overlay: HTMLElement,
            anchor: HTMLElement,
            viewportWidth: number,
            viewportMaxWidth: number
        ): CSSProperties => {
            const isNarrowLayout = narrowLayoutMedia.matches
            const anchorRect = anchor.getBoundingClientRect()
            const flipBoundary = getFlipBoundary(anchor)
            const style = computeResponsiveOverlayStyle({
                narrowLayoutMode,
                align,
                isNarrowLayout,
                viewportWidth,
                viewportMaxWidth,
                anchorRect,
                anchorWidth: anchor.clientWidth,
                boundaryRect:
                    findResponsiveBoundary(anchor).getBoundingClientRect(),
                flipBoundaryRect: flipBoundary,
                overlayScrollWidth: overlay.scrollWidth,
            })

            if (
                !flipBoundary ||
                (isNarrowLayout && narrowLayoutMode === 'flow')
            )
                return style

            return {
                ...style,
                ...computeVerticalOverlayStyle(
                    anchorRect,
                    flipBoundary,
                    overlay.offsetHeight
                ),
            }
        }

        const applyLayout = () => {
            const currentOverlay = overlayRef.current
            if (!currentOverlay) return

            const anchor =
                currentOverlay.offsetParent instanceof HTMLElement
                    ? currentOverlay.offsetParent
                    : null

            const viewportWidth = window.innerWidth
            const viewportMaxWidth = Math.max(
                0,
                viewportWidth - viewportPadding * 2
            )

            const nextStyle: CSSProperties = !anchor
                ? { maxWidth: `${Math.floor(viewportMaxWidth)}px` }
                : computeAnchoredStyle(
                      currentOverlay,
                      anchor,
                      viewportWidth,
                      viewportMaxWidth
                  )

            setResponsiveStyle((currentStyle) =>
                areOverlayStylesEqual(currentStyle, nextStyle)
                    ? currentStyle
                    : nextStyle
            )
        }

        const scheduleLayout = () => {
            cancelAnimationFrame(frame)
            frame = window.requestAnimationFrame(applyLayout)
        }

        applyLayout()

        const anchor =
            overlay.offsetParent instanceof HTMLElement
                ? overlay.offsetParent
                : null
        const boundary = anchor ? findResponsiveBoundary(anchor) : null
        const repositionOnScroll =
            anchor?.closest('[data-dropdown-boundary]') == null

        const resizeObserver = new ResizeObserver(scheduleLayout)
        resizeObserver.observe(overlay)
        if (anchor) resizeObserver.observe(anchor)
        if (boundary && boundary !== anchor) resizeObserver.observe(boundary)

        window.addEventListener('resize', scheduleLayout)
        if (repositionOnScroll)
            window.addEventListener('scroll', scheduleLayout, true)
        narrowLayoutMedia.addEventListener('change', scheduleLayout)

        return () => {
            cancelAnimationFrame(frame)
            resizeObserver.disconnect()
            window.removeEventListener('resize', scheduleLayout)
            window.removeEventListener('scroll', scheduleLayout, true)
            narrowLayoutMedia.removeEventListener('change', scheduleLayout)
        }
    }, [overlayRef, narrowLayoutMode, align])

    return responsiveStyle
}

export interface DropdownOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
    header?: React.ReactNode
    label?: React.ReactNode
    onClose?: () => void
    body?: React.ReactNode
    footer?: React.ReactNode
    footerButtonLabel?: React.ReactNode
    footerButtonOnClick?: () => void
    footerButtonDisabled?: boolean
    headerClassName?: string
    closeButtonClassName?: string
    bodyClassName?: string
    footerClassName?: string
    footerButtonClassName?: string
    narrowLayoutMode?: DropdownOverlayNarrowLayoutMode
    align?: DropdownOverlayAlign
}

export const DropdownOverlay = forwardRef<HTMLDivElement, DropdownOverlayProps>(
    function DropdownOverlay(
        {
            header,
            label,
            onClose,
            body,
            footer,
            footerButtonLabel,
            footerButtonOnClick,
            footerButtonDisabled,
            headerClassName,
            closeButtonClassName,
            bodyClassName,
            footerClassName,
            footerButtonClassName,
            narrowLayoutMode = 'container',
            align = 'auto',
            className,
            style,
            children,
            ...props
        },
        ref
    ) {
        const localRef = useRef<HTMLDivElement | null>(null)
        const [openMenuId, setOpenMenuId] = useState<string | null>(null)
        const responsiveStyle = useDropdownOverlayResponsiveStyle({
            overlayRef: localRef,
            narrowLayoutMode,
            align,
        })

        const shellClassName = [
            styles.shell,
            align === 'start' && styles.alignStart,
            className,
        ]
            .filter(Boolean)
            .join(' ')
        const headerClasses = [styles.header, headerClassName]
            .filter(Boolean)
            .join(' ')
        const bodyClasses = [styles.body, bodyClassName]
            .filter(Boolean)
            .join(' ')
        const footerClasses = [styles.footer, footerClassName]
            .filter(Boolean)
            .join(' ')
        const footerButtonClasses = [styles.footerButton, footerButtonClassName]
            .filter(Boolean)
            .join(' ')
        const closeClasses = [styles.closeButton, closeButtonClassName]
            .filter(Boolean)
            .join(' ')

        return (
            <div
                ref={(node) => {
                    localRef.current = node
                    if (typeof ref === 'function') {
                        ref(node)
                    } else if (ref) {
                        ref.current = node
                    }
                }}
                className={shellClassName}
                style={{ ...responsiveStyle, ...style }}
                {...props}
            >
                <DropdownOverlayMenuContext.Provider
                    value={{ openMenuId, setOpenMenuId }}
                >
                    {header ? (
                        <div className={headerClasses}>{header}</div>
                    ) : label ? (
                        <div className={headerClasses}>
                            <span className={styles.title}>{label}</span>
                            <button
                                type="button"
                                className={closeClasses}
                                onClick={onClose}
                                aria-label="Close overlay"
                            >
                                <FiX size={16} aria-hidden="true" />
                            </button>
                        </div>
                    ) : null}
                    {body ? <div className={bodyClasses}>{body}</div> : null}
                    {footer || footerButtonLabel ? (
                        <div className={footerClasses}>
                            {footer}
                            {footerButtonLabel ? (
                                <button
                                    type="button"
                                    className={footerButtonClasses}
                                    onClick={footerButtonOnClick}
                                    disabled={footerButtonDisabled}
                                >
                                    {footerButtonLabel}
                                </button>
                            ) : null}
                        </div>
                    ) : null}
                    {children}
                </DropdownOverlayMenuContext.Provider>
            </div>
        )
    }
)
