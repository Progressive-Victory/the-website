'use client'

import styles from './NavigationButton.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactElement,
    type ReactNode,
} from 'react'
import type { MouseEvent } from 'react'
import type { IconType } from 'react-icons/lib'

const PANEL_HISTORY_STORAGE_KEY = 'pv.admin.panel.history'
const GROUP_CHILDREN_ANIMATION_MS = 220

export type NavigationButtonType = 'default' | 'group' | 'card' | 'account'
export type IndicatorDirection = 'up' | 'down' | 'none'

export interface NavigationButtonProps {
    label: string
    subtitle?: string
    href: string
    icon?: IconType
    iconNode?: ReactNode
    count?: number
    description?: string
    buttonType?: NavigationButtonType
    groupContent?: ReactNode
    hasActiveGroupChild?: boolean
    indicatorDirection?: IndicatorDirection
    trackPanelHistory?: boolean
    resetPanelHistoryOnClick?: boolean
    active?: boolean
    className?: string
    linkClassName?: string
    iconSectionClassName?: string
    labelClassName?: string
    subtitleClassName?: string
    tagSectionClassName?: string
}

export function NavigationButton({
    label,
    subtitle,
    href,
    icon,
    iconNode,
    count,
    description,
    buttonType = 'default',
    groupContent,
    hasActiveGroupChild = false,
    indicatorDirection = 'none',
    trackPanelHistory = false,
    resetPanelHistoryOnClick = false,
    active = false,
    className,
    linkClassName,
    iconSectionClassName,
    labelClassName,
    subtitleClassName,
    tagSectionClassName,
}: NavigationButtonProps): ReactElement {
    const Icon = icon
    const isAccountButton = buttonType === 'account'
    const pathname = usePathname()
    const formattedCount = (count ?? 0).toLocaleString()
    const [isGroupOpen, setIsGroupOpen] = useState(false)
    const [shouldRenderGroupChildren, setShouldRenderGroupChildren] =
        useState(false)
    const [groupChildrenHeight, setGroupChildrenHeight] = useState(0)
    const groupChildrenCloseTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)
    const groupChildrenRef = useRef<HTMLDivElement | null>(null)

    useLayoutEffect(() => {
        if (!shouldRenderGroupChildren) {
            setGroupChildrenHeight(0)
            return
        }

        function updateGroupChildrenHeight() {
            setGroupChildrenHeight(groupChildrenRef.current?.scrollHeight ?? 0)
        }

        updateGroupChildrenHeight()

        const groupChildrenElement = groupChildrenRef.current

        const resizeObserver =
            typeof ResizeObserver === 'undefined' ||
            groupChildrenElement === null
                ? null
                : new ResizeObserver(() => {
                      updateGroupChildrenHeight()
                  })

        if (resizeObserver && groupChildrenElement) {
            resizeObserver.observe(groupChildrenElement)
        }

        return () => {
            resizeObserver?.disconnect()
        }
    }, [groupContent, shouldRenderGroupChildren])

    useEffect(() => {
        return () => {
            if (groupChildrenCloseTimeoutRef.current !== null) {
                clearTimeout(groupChildrenCloseTimeoutRef.current)
            }
        }
    }, [])

    function handleGroupTagClick(event: MouseEvent<HTMLElement>) {
        event.preventDefault()
        event.stopPropagation()

        if (groupChildrenCloseTimeoutRef.current !== null) {
            clearTimeout(groupChildrenCloseTimeoutRef.current)
            groupChildrenCloseTimeoutRef.current = null
        }

        if (isGroupOpen) {
            setIsGroupOpen(false)
            groupChildrenCloseTimeoutRef.current = setTimeout(() => {
                setShouldRenderGroupChildren(false)
                groupChildrenCloseTimeoutRef.current = null
            }, GROUP_CHILDREN_ANIMATION_MS)
            return
        }

        setShouldRenderGroupChildren(true)
        requestAnimationFrame(() => {
            setIsGroupOpen(true)
        })
    }

    function handleNavigationClick() {
        if (typeof window === 'undefined') {
            return
        }

        if (resetPanelHistoryOnClick) {
            window.sessionStorage.removeItem(PANEL_HISTORY_STORAGE_KEY)
            return
        }

        if (!trackPanelHistory) {
            return
        }

        if (!pathname.startsWith('/admin/panels/')) {
            return
        }

        const rawHistory = window.sessionStorage.getItem(
            PANEL_HISTORY_STORAGE_KEY
        )
        const panelHistory = rawHistory
            ? (JSON.parse(rawHistory) as string[])
            : []

        const nextHistory =
            panelHistory[panelHistory.length - 1] === pathname
                ? panelHistory
                : [...panelHistory, pathname]

        window.sessionStorage.setItem(
            PANEL_HISTORY_STORAGE_KEY,
            JSON.stringify(nextHistory.slice(-50))
        )
    }

    if (buttonType === 'card') {
        return (
            <div
                className={[styles.item, styles.cardItem, className]
                    .filter(Boolean)
                    .join(' ')}
            >
                <div className={styles.itemHeader}>
                    <Link
                        aria-current={active ? 'page' : undefined}
                        className={styles.cardLink}
                        href={href}
                        onClick={handleNavigationClick}
                        title={label}
                    >
                        <div className={styles.cardTop}>
                            <div className={styles.cardLeft}>
                                {Icon ? (
                                    <div
                                        className={styles.cardIconPill}
                                        aria-hidden="true"
                                    >
                                        <Icon size={20} />
                                    </div>
                                ) : null}

                                <div className={styles.cardTitle}>{label}</div>
                            </div>

                            {count !== undefined ? (
                                <div className={styles.cardCount}>
                                    {formattedCount}
                                </div>
                            ) : null}
                        </div>

                        {description ? (
                            <div className={styles.cardDescription}>
                                {description}
                            </div>
                        ) : null}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div
            className={[
                styles.item,
                isAccountButton ? styles.accountItem : null,
                active ? styles.itemActive : styles.itemInactive,
                active && indicatorDirection === 'up'
                    ? styles.itemActiveFromUp
                    : null,
                active && indicatorDirection === 'down'
                    ? styles.itemActiveFromDown
                    : null,
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className={styles.itemHeader}>
                <Link
                    aria-current={active ? 'page' : undefined}
                    className={[
                        styles.link,
                        isAccountButton ? styles.accountLink : null,
                        linkClassName,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    data-indicator-target={
                        hasActiveGroupChild && !isGroupOpen ? 'true' : undefined
                    }
                    href={href}
                    onClick={handleNavigationClick}
                    title={label}
                >
                    <span
                        className={[
                            styles.iconSection,
                            isAccountButton ? styles.accountIconSection : null,
                            iconSectionClassName,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {iconNode ?? (Icon ? <Icon size={19} /> : null)}
                    </span>

                    <span
                        className={[
                            styles.labelSection,
                            isAccountButton ? styles.accountText : null,
                            labelClassName,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {label}
                        {subtitle ? (
                            <span
                                className={[
                                    isAccountButton
                                        ? styles.accountSubtitle
                                        : null,
                                    subtitleClassName,
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                {subtitle}
                            </span>
                        ) : null}
                    </span>

                    <span
                        className={[
                            styles.tagSection,
                            isAccountButton ? styles.accountTagSection : null,
                            tagSectionClassName,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {buttonType === 'group' ? (
                            <span
                                aria-hidden="true"
                                className={styles.groupTagButton}
                                data-collapsed-active-child={
                                    hasActiveGroupChild && !isGroupOpen
                                }
                                data-open={isGroupOpen}
                                onClick={handleGroupTagClick}
                            >
                                <span className={styles.groupTagChevron} />
                            </span>
                        ) : !isAccountButton && count !== undefined ? (
                            <span className={styles.count}>
                                {formattedCount}
                            </span>
                        ) : null}
                    </span>
                </Link>
            </div>

            {buttonType === 'group' && shouldRenderGroupChildren ? (
                <div
                    className={styles.groupChildren}
                    data-open={isGroupOpen}
                    ref={groupChildrenRef}
                    style={
                        {
                            '--group-children-open-height': `${groupChildrenHeight}px`,
                        } as CSSProperties
                    }
                >
                    {groupContent}
                </div>
            ) : null}
        </div>
    )
}
