'use client'

import blockStyles from './Block.module.css'
import styles from './BlockList.module.css'
import { DropdownButton, DropdownMenu } from '@/components/common'
import cx from 'classnames'
import {
    useEffect,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from 'react'
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from 'react-icons/fi'

export interface BlockListItem {
    key: string | number
    label: ReactNode
    subtitle?: ReactNode
    tag?: ReactNode
    selected?: boolean
    onClick?: () => void
}

export interface BlockListProps {
    title: string
    defaultCollapsed?: boolean
    items: BlockListItem[]
    pageSize?: number
    emptyMessage?: string
    boundaryRef?: RefObject<HTMLElement | null>
    className?: string
}

interface PaginationArrowProps {
    icon: React.ElementType
    title: string
    enabled: boolean
    onClick: () => void
}

function PaginationArrow({ icon: Icon, title, enabled, onClick }: PaginationArrowProps) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            disabled={!enabled}
            onClick={onClick}
            className={cx(styles.arrow, enabled ? styles.arrowEnabled : styles.arrowDisabled)}
        >
            <Icon size={15} />
        </button>
    )
}

export function BlockList({
    title,
    defaultCollapsed,
    items,
    pageSize = 10,
    emptyMessage,
    boundaryRef,
    className,
}: BlockListProps) {
    const [isCollapsed, setIsCollapsed] = useState(!!defaultCollapsed)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [page, setPage] = useState(0)

    const menuButtonRef = useRef<HTMLButtonElement | null>(null)
    const bodyRef = useRef<HTMLDivElement | null>(null)
    const bodyContentRef = useRef<HTMLDivElement | null>(null)
    const isCollapsedRef = useRef(!!defaultCollapsed)
    const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const pageCount = Math.ceil(items.length / pageSize)
    const safePage = Math.min(page, Math.max(0, pageCount - 1))
    const pageItems = items.slice(safePage * pageSize, (safePage + 1) * pageSize)
    const isPaginated = items.length > pageSize

    // Reset to page 0 when items change
    useEffect(() => { setPage(0) }, [items])

    useEffect(() => { isCollapsedRef.current = isCollapsed }, [isCollapsed])

    // Collapse / expand: re-enable transition, then animate
    useEffect(() => {
        const body = bodyRef.current
        const content = bodyContentRef.current
        if (!body) return

        if (resizeTimerRef.current) {
            clearTimeout(resizeTimerRef.current)
            resizeTimerRef.current = null
        }

        body.style.transition = ''

        if (isCollapsed) {
            body.style.overflow = 'hidden'
            body.style.height = '0px'
        } else {
            body.style.height = `${content?.offsetHeight ?? 0}px`
        }
    }, [isCollapsed])

    // Resize: write height directly to DOM — no state update, no transition
    useEffect(() => {
        const el = bodyContentRef.current
        const body = bodyRef.current
        if (!el || !body) return

        const updateHeight = () => {
            if (isCollapsedRef.current) return

            body.style.transition = 'none'
            body.style.height = `${el.offsetHeight}px`

            if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
            resizeTimerRef.current = setTimeout(() => {
                if (body && !isCollapsedRef.current) body.style.transition = ''
                resizeTimerRef.current = null
            }, 200)
        }

        const observer = new ResizeObserver(updateHeight)
        observer.observe(el)
        return () => {
            observer.disconnect()
            if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
        }
    }, [])

    const toggle = () => {
        setIsCollapsed((c) => !c)
        setIsMenuOpen(false)
    }

    return (
        <div
            className={cx(
                blockStyles.block,
                styles.root,
                isMenuOpen && blockStyles.blockMenuOpen,
                className
            )}
        >
            <div className={cx(blockStyles.header, styles.header)}>
                <div className={blockStyles.titleGroup}>
                    <h1 className={blockStyles.title}>{title}</h1>
                </div>
                <div className={blockStyles.menuControl}>
                    <DropdownButton
                        ref={menuButtonRef}
                        buttonVariant="short"
                        isOpen={isMenuOpen}
                        aria-label={`${title} options`}
                        onClick={() => setIsMenuOpen((o) => !o)}
                        menu={
                            <DropdownMenu
                                triggerRef={menuButtonRef}
                                onClose={() => setIsMenuOpen(false)}
                                boundaryRef={boundaryRef}
                                label="Quick Actions"
                                role="menu"
                                aria-label={`${title} menu`}
                            >
                                <DropdownMenu.Button
                                    label={isCollapsed ? 'Show' : 'Hide'}
                                    onClick={toggle}
                                />
                            </DropdownMenu>
                        }
                    />
                </div>
            </div>

            <div
                ref={bodyRef}
                className={blockStyles.body}
                onTransitionEnd={(e) => {
                    if (
                        e.propertyName === 'height' &&
                        !isCollapsedRef.current &&
                        bodyRef.current
                    ) {
                        bodyRef.current.style.overflow = 'visible'
                    }
                }}
                aria-hidden={isCollapsed}
            >
                <div ref={bodyContentRef} className={styles.listContent}>
                    {items.length === 0 ? (
                        <div className={cx(styles.entry, styles.entryUi)}>
                            {emptyMessage ?? 'No items'}
                        </div>
                    ) : (
                        pageItems.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={item.onClick}
                                className={cx(
                                    styles.entry,
                                    item.selected && styles.entrySelected,
                                    !isPaginated && styles.entryLastRound
                                )}
                            >
                                <span className={styles.entryMain}>
                                    <span className={styles.entryLabel}>
                                        {item.label}
                                    </span>
                                    {item.subtitle && (
                                        <span className={styles.entrySubtitle}>
                                            {item.subtitle}
                                        </span>
                                    )}
                                </span>
                                {item.tag}
                            </button>
                        ))
                    )}

                    {isPaginated && (
                        <div className={styles.footer}>
                            <PaginationArrow
                                icon={FiChevronsLeft}
                                title="First page"
                                enabled={safePage > 0}
                                onClick={() => setPage(0)}
                            />
                            <PaginationArrow
                                icon={FiChevronLeft}
                                title="Previous page"
                                enabled={safePage > 0}
                                onClick={() => setPage((p) => p - 1)}
                            />
                            <span className={styles.footerPageLabel}>
                                {safePage + 1}
                                <span className={styles.footerPageOf}>
                                    {' '}of {pageCount}
                                </span>
                            </span>
                            <PaginationArrow
                                icon={FiChevronRight}
                                title="Next page"
                                enabled={safePage < pageCount - 1}
                                onClick={() => setPage((p) => p + 1)}
                            />
                            <PaginationArrow
                                icon={FiChevronsRight}
                                title="Last page"
                                enabled={safePage < pageCount - 1}
                                onClick={() => setPage(pageCount - 1)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export interface BlockListTagProps {
    children: ReactNode
    /** Text shown in the hover tooltip */
    tooltip?: string
}

/** Trailing pill tag for a BlockList entry, with an optional hover tooltip. */
export function BlockListTag({ children, tooltip }: BlockListTagProps) {
    return (
        <span className={styles.entryTag} data-tooltip={tooltip}>
            {children}
        </span>
    )
}
