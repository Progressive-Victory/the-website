'use client'

import styles from './NavigationButton.module.css'
import { TagSection } from './TagSection'
import type { TagProps } from './TagSection'
import skeleton from '@/components/common/Skeleton.module.css'
import { cn } from '@/util'
import { useCollapse } from '@/util/hooks/useCollapse'
import Link from 'next/link'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'
import type { MouseEvent } from 'react'
import type { IconType } from 'react-icons/lib'

export type NavigationButtonType = 'default' | 'group' | 'card' | 'account'
export type IndicatorDirection = 'up' | 'down' | 'none'

export interface SubTagProps {
    label: string
    className?: string
}

interface LabelSectionProps {
    label: string
    subtitle?: string
    labelPill?: string
    isAccountButton: boolean
    className?: string
}

function LabelSection({
    label,
    subtitle,
    labelPill,
    isAccountButton,
    className,
}: LabelSectionProps) {
    const hasSubtitle = subtitle != null && subtitle !== ''
    const pill = labelPill && (
        <span className={styles.labelPill}>{labelPill}</span>
    )

    return (
        <span
            className={cn(
                styles.labelSection,
                hasSubtitle &&
                    !isAccountButton &&
                    styles.labelSectionWithSubtitle,
                isAccountButton && styles.accountText,
                className
            )}
        >
            <span className={styles.labelText}>{label}</span>
            {hasSubtitle ? (
                <span className={styles.subtitleRow}>
                    <span
                        className={cn(
                            !isAccountButton && styles.subtitleSection,
                            isAccountButton && styles.accountSubtitle
                        )}
                    >
                        {subtitle}
                    </span>
                    {pill}
                </span>
            ) : (
                pill
            )}
        </span>
    )
}

export interface NavigationButtonProps {
    label: string
    labelPill?: string
    ariaLabel?: string
    subtitle?: string
    tag?: TagProps
    subTags?: SubTagProps[]
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
    loading?: boolean
    style?: CSSProperties
    className?: string
    classNames?: {
        link?: string
        label?: string
    }
}

function NavigationButtonSkeleton({
    icon,
    subtitle,
    style,
    className,
    classNames,
}: Pick<
    NavigationButtonProps,
    'icon' | 'subtitle' | 'style' | 'className' | 'classNames'
>) {
    const IconComponent = typeof icon === 'function' ? icon : null
    const hasSubtitle = subtitle != null

    return (
        <div
            aria-hidden="true"
            className={cn(styles.item, styles.skeletonItem, className)}
            style={style}
        >
            <div className={styles.itemHeader}>
                <a className={cn(styles.link, classNames?.link)}>
                    {icon != null && (
                        <span className={styles.iconSection}>
                            {IconComponent ? (
                                <IconComponent size={19} />
                            ) : (
                                (icon as ReactNode)
                            )}
                        </span>
                    )}
                    <span
                        className={cn(
                            styles.labelSection,
                            hasSubtitle && styles.labelSectionWithSubtitle,
                            classNames?.label
                        )}
                    >
                        <span className={styles.labelText}>
                            <span
                                className={cn(
                                    skeleton.bar,
                                    styles.skeletonLabel
                                )}
                            />
                        </span>
                        {hasSubtitle && (
                            <span className={styles.subtitleRow}>
                                <span className={styles.subtitleSection}>
                                    <span
                                        className={cn(
                                            skeleton.bar,
                                            styles.skeletonSubtitle
                                        )}
                                    />
                                </span>
                            </span>
                        )}
                    </span>
                </a>
            </div>
        </div>
    )
}

export function NavigationButton({
    label,
    labelPill,
    ariaLabel,
    subtitle,
    tag,
    subTags,
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
    loading,
    style,
    className,
    classNames,
}: NavigationButtonProps): ReactElement {
    const IconComponent = typeof icon === 'function' ? icon : null
    const hasIcon = icon != null
    const isCardButton = buttonType === 'card'
    const isAccountButton = buttonType === 'account'
    const hasSubTags = !isAccountButton && !!subTags?.length
    const {
        isOpen: isGroupOpen,
        shouldRender: shouldRenderGroupChildren,
        contentHeight: groupChildrenHeight,
        contentRef: groupChildrenRef,
        toggle: handleGroupTagClick,
    } = useCollapse({ deps: [groupContent] })

    if (loading)
        return (
            <NavigationButtonSkeleton
                icon={icon}
                subtitle={subtitle}
                style={style}
                className={className}
                classNames={classNames}
            />
        )

    const getItemClassName = () =>
        cn(
            styles.item,
            isCardButton && styles.cardItem,
            isAccountButton && styles.accountItem,
            active ? styles.itemActive : styles.itemInactive,
            active && indicatorDirection === 'up' && styles.itemActiveFromUp,
            active &&
                indicatorDirection === 'down' &&
                styles.itemActiveFromDown,
            className
        )

    const getLinkClassName = () =>
        cn(
            isCardButton ? styles.cardLink : styles.link,
            isAccountButton && styles.accountLink,
            hasSubTags && styles.linkWithSubTags,
            classNames?.link
        )

    const getIconClassName = () =>
        cn(styles.iconSection, isAccountButton && styles.accountIconSection)

    const renderItemHeader = () => (
        <div className={styles.itemHeader}>
            <Link
                aria-label={ariaLabel}
                aria-current={active ? 'page' : undefined}
                className={getLinkClassName()}
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
                    <span className={getIconClassName()} aria-hidden="true">
                        {IconComponent ? (
                            <IconComponent size={isCardButton ? 20 : 19} />
                        ) : (
                            (icon as ReactNode)
                        )}
                    </span>
                )}

                <LabelSection
                    label={label}
                    subtitle={subtitle}
                    labelPill={labelPill}
                    isAccountButton={isAccountButton}
                    className={classNames?.label}
                />

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
                    <span className={styles.description}>{description}</span>
                )}

                {hasSubTags && (
                    <span className={styles.subTagRow}>
                        {subTags.map((subTag, index) => (
                            <span
                                key={`${subTag.label}-${index}`}
                                className={cn(styles.subTag, subTag.className)}
                            >
                                {subTag.label}
                            </span>
                        ))}
                    </span>
                )}
            </Link>
        </div>
    )

    const renderComponent = () => (
        <div className={getItemClassName()} style={style}>
            {renderItemHeader()}
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

    return renderComponent()
}
