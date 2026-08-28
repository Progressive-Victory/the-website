'use client'

import styles from './NavigationButton.module.css'
import { TagSection } from './TagSection'
import type { TagProps } from './TagSection'
import { cn } from '@/util'
import { useCollapse } from '@/util/hooks/useCollapse'
import Link from 'next/link'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'
import type { MouseEvent } from 'react'
import type { IconType } from 'react-icons/lib'

export type NavigationButtonType = 'default' | 'group' | 'card' | 'account'
export type IndicatorDirection = 'up' | 'down' | 'none'

export interface NavigationButtonProps {
    label: string
    subtitle?: string
    tag?: TagProps
    href: string
    icon?: IconType | ReactNode
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
    classNames?: {
        link?: string
        label?: string
    }
}

export function NavigationButton({
    label,
    subtitle,
    tag,
    href,
    icon,
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
    classNames,
}: NavigationButtonProps): ReactElement {
    const IconComponent = typeof icon === 'function' ? icon : null
    const hasIcon = icon != null
    const isCardButton = buttonType === 'card'
    const isAccountButton = buttonType === 'account'
    const hasSubtitle = subtitle != null && subtitle !== ''
    const {
        isOpen: isGroupOpen,
        shouldRender: shouldRenderGroupChildren,
        contentHeight: groupChildrenHeight,
        contentRef: groupChildrenRef,
        toggle: handleGroupTagClick,
    } = useCollapse({ deps: [groupContent] })

    return (
        <div
            className={cn(
                styles.item,
                isCardButton && styles.cardItem,
                isAccountButton && styles.accountItem,
                active ? styles.itemActive : styles.itemInactive,
                active &&
                    indicatorDirection === 'up' &&
                    styles.itemActiveFromUp,
                active &&
                    indicatorDirection === 'down' &&
                    styles.itemActiveFromDown,
                className,
            )}
            style={style}
        >
            <div className={styles.itemHeader}>
                <Link
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                        isCardButton ? styles.cardLink : styles.link,
                        isAccountButton && styles.accountLink,
                        classNames?.link,
                    )}
                    data-indicator-target={
                        showIndicator && hasActiveGroupChild && !isGroupOpen
                            ? 'true'
                            : undefined
                    }
                    data-show-indicator={showIndicator ? undefined : 'false'}
                    href={href}
                    onClick={onClick}
                    title={label}
                >
                    {hasIcon && (
                        <span
                            className={cn(
                                styles.iconSection,
                                isAccountButton && styles.accountIconSection,
                            )}
                            aria-hidden="true"
                        >
                            {IconComponent ? (
                                <IconComponent size={isCardButton ? 20 : 19} />
                            ) : (
                                (icon as ReactNode)
                            )}
                        </span>
                    )}

                    <span
                        className={cn(
                            styles.labelSection,
                            hasSubtitle &&
                                !isAccountButton &&
                                styles.labelSectionWithSubtitle,
                            isAccountButton && styles.accountText,
                            classNames?.label,
                        )}
                    >
                        {label}
                        {subtitle && (
                            <span
                                className={cn(
                                    !isAccountButton && styles.subtitleSection,
                                    isAccountButton && styles.accountSubtitle,
                                )}
                            >
                                {subtitle}
                            </span>
                        )}
                    </span>

                    <TagSection
                        buttonType={buttonType}
                        tag={tag}
                        isAccountButton={isAccountButton}
                        isCardButton={isCardButton}
                        hasActiveGroupChild={hasActiveGroupChild}
                        isGroupOpen={isGroupOpen}
                        onGroupTagClick={handleGroupTagClick}
                    />

                    {description && (
                        <span className={styles.description}>
                            {description}
                        </span>
                    )}
                </Link>
            </div>

            {buttonType === 'group' && shouldRenderGroupChildren && (
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
            )}
        </div>
    )
}
