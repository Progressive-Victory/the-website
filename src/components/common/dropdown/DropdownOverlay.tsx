'use client'

import styles from './DropdownOverlay.module.css'
import { areOverlayStylesEqual } from '@/util'
import {
    forwardRef,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type RefObject,
} from 'react'
import { FiX } from 'react-icons/fi'

type DropdownOverlayNarrowLayoutMode = 'container' | 'trigger' | 'flow'

const DROPDOWN_OVERLAY_LAYOUT_CONFIG = {
    viewportPadding: 12,
    narrowBreakpointQuery: '(max-width: 53rem)',
    parentGrowthThreshold: 24,
    triggerBoundaryInset: 8,
} as const

const INITIAL_OVERLAY_RESPONSIVE_STYLE: CSSProperties = {
    maxWidth: `calc(100dvw - ${DROPDOWN_OVERLAY_LAYOUT_CONFIG.viewportPadding * 2}px)`,
}

interface RectLike {
    left: number
    right: number
}

interface ComputeResponsiveOverlayStyleInput {
    narrowLayoutMode: DropdownOverlayNarrowLayoutMode
    isNarrowLayout: boolean
    viewportWidth: number
    viewportMaxWidth: number
    anchorRect: RectLike
    anchorWidth: number
    boundaryRect: RectLike
    overlayScrollWidth: number
}

function computeResponsiveOverlayStyle({
    narrowLayoutMode,
    isNarrowLayout,
    viewportWidth,
    viewportMaxWidth,
    anchorRect,
    anchorWidth,
    boundaryRect,
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
    const shouldAlignLeft =
        rightAlignedStart < DROPDOWN_OVERLAY_LAYOUT_CONFIG.viewportPadding &&
        leftAlignedEnd <=
            viewportWidth - DROPDOWN_OVERLAY_LAYOUT_CONFIG.viewportPadding

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
}

// This function figures out the container dimensions and sets the dropdown width and horizontal position to make sure it fits within the container and aligns it with dropdownbutton. It also updates width dynamically on window resize.
function useDropdownOverlayResponsiveStyle({
    overlayRef,
    narrowLayoutMode,
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
                : computeResponsiveOverlayStyle({
                      narrowLayoutMode,
                      isNarrowLayout: narrowLayoutMedia.matches,
                      viewportWidth,
                      viewportMaxWidth,
                      anchorRect: anchor.getBoundingClientRect(),
                      anchorWidth: anchor.clientWidth,
                      boundaryRect:
                          findResponsiveBoundary(
                              anchor
                          ).getBoundingClientRect(),
                      overlayScrollWidth: currentOverlay.scrollWidth,
                  })

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

        const resizeObserver = new ResizeObserver(scheduleLayout)
        resizeObserver.observe(overlay)
        if (anchor) resizeObserver.observe(anchor)
        if (boundary && boundary !== anchor) resizeObserver.observe(boundary)

        window.addEventListener('resize', scheduleLayout)
        window.addEventListener('scroll', scheduleLayout, true)
        narrowLayoutMedia.addEventListener('change', scheduleLayout)

        return () => {
            cancelAnimationFrame(frame)
            resizeObserver.disconnect()
            window.removeEventListener('resize', scheduleLayout)
            window.removeEventListener('scroll', scheduleLayout, true)
            narrowLayoutMedia.removeEventListener('change', scheduleLayout)
        }
    }, [overlayRef, narrowLayoutMode])

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
            className,
            style,
            children,
            ...props
        },
        ref
    ) {
        const localRef = useRef<HTMLDivElement | null>(null)
        const responsiveStyle = useDropdownOverlayResponsiveStyle({
            overlayRef: localRef,
            narrowLayoutMode,
        })

        const shellClassName = [styles.shell, className]
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
            </div>
        )
    }
)
