'use client'

import styles from './NavigationButton.module.css'
import { cn } from '@/util'
import Link from 'next/link'
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

const GROUP_CHILDREN_ANIMATION_MS = 220

export type NavigationButtonType = 'default' | 'group' | 'card' | 'account'
export type IndicatorDirection = 'up' | 'down' | 'none'

export interface NavigationButtonProps {
    label: string
    subtitle?: string
    tagLabel?: string
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
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
    showIndicator?: boolean
    active?: boolean
    style?: CSSProperties
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
    tagLabel,
    href,
    icon,
    iconNode,
    count,
    description,
    buttonType = 'default',
    groupContent,
    hasActiveGroupChild = false,
    indicatorDirection = 'none',
    onClick,
    showIndicator = true,
    active = false,
    style,
    className,
    linkClassName,
    iconSectionClassName,
    labelClassName,
    subtitleClassName,
    tagSectionClassName,
}: NavigationButtonProps): ReactElement {
    const Icon = icon
    const hasIcon = Boolean(iconNode ?? Icon)
    const isAccountButton = buttonType === 'account'
    const hasSubtitle = subtitle != null && subtitle !== ''
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

    if (buttonType === 'card') {
        return (
            <div className={cn(styles.item, styles.cardItem, className)}>
                <div className={styles.itemHeader}>
                    <Link
                        aria-current={active ? 'page' : undefined}
                        className={styles.cardLink}
                        data-show-indicator={
                            showIndicator ? undefined : 'false'
                        }
                        href={href}
                        onClick={(event) => {
                            onClick?.(event)
                        }}
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
            className={cn(
                styles.item,
                isAccountButton && styles.accountItem,
                active ? styles.itemActive : styles.itemInactive,
                active && indicatorDirection === 'up' && styles.itemActiveFromUp,
                active && indicatorDirection === 'down' && styles.itemActiveFromDown,
                className,
            )}
            style={style}
        >
            <div className={styles.itemHeader}>
                <Link
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                        styles.link,
                        isAccountButton && styles.accountLink,
                        linkClassName,
                    )}
                    data-indicator-target={
                        showIndicator && hasActiveGroupChild && !isGroupOpen
                            ? 'true'
                            : undefined
                    }
                    data-show-indicator={showIndicator ? undefined : 'false'}
                    href={href}
                    onClick={(event) => {
                        onClick?.(event)
                    }}
                    title={label}
                >
                    {hasIcon ? (
                        <span
                            className={cn(
                                styles.iconSection,
                                isAccountButton && styles.accountIconSection,
                                iconSectionClassName,
                            )}
                        >
                            {iconNode ?? (Icon ? <Icon size={19} /> : null)}
                        </span>
                    ) : null}

                    <span
                        className={cn(
                            styles.labelSection,
                            hasSubtitle && !isAccountButton && styles.labelSectionWithSubtitle,
                            isAccountButton && styles.accountText,
                            labelClassName,
                        )}
                    >
                        {label}
                        {subtitle ? (
                            <span
                                className={cn(
                                    !isAccountButton && styles.subtitleSection,
                                    isAccountButton && styles.accountSubtitle,
                                    subtitleClassName,
                                )}
                            >
                                {subtitle}
                            </span>
                        ) : null}
                    </span>

                    <span
                        className={cn(
                            styles.tagSection,
                            tagLabel && styles.tagSectionWithLabel,
                            isAccountButton && styles.accountTagSection,
                            tagSectionClassName,
                        )}
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
                        ) : tagLabel ? (
                            <span className={styles.tagLabel}>{tagLabel}</span>
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
                    className={styles.groupChildrenClip}
                    data-open={isGroupOpen}
                    style={
                        {
                            '--group-children-open-height': `${groupChildrenHeight}px`,
                        } as CSSProperties
                    }
                >
                    <div
                        className={styles.groupChildren}
                        ref={groupChildrenRef}
                    >
                        {groupContent}
                    </div>
                </div>
            ) : null}
        </div>
    )
}
