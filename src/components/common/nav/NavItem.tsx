'use client'

/*
 * Nav.Item — SKELETON.
 *
 * Default nav row (replaces NavigationButton buttonType="default" and "card").
 * Carries the data attributes the selection indicator looks for
 * (`data-indicator-target`, `aria-current`). The `card` look is a CSS-only
 * variant, not a separate code path.
 */
import styles from './nav.module.css'
import Link from 'next/link'
import type { MouseEvent, ReactElement, ReactNode } from 'react'
import type { IconType } from 'react-icons/lib'

export interface NavItemProps {
    label: string
    href: string
    icon?: IconType
    iconNode?: ReactNode
    count?: number
    subtitle?: string
    description?: string
    tagLabel?: string
    active?: boolean
    variant?: 'default' | 'card'
    showIndicator?: boolean
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

export function NavItem({
    label,
    href,
    icon: Icon,
    iconNode,
    count,
    subtitle,
    description,
    tagLabel,
    active = false,
    variant = 'default',
    showIndicator = true,
    onClick,
}: NavItemProps): ReactElement {
    if (variant === 'card') {
        return (
            <Link
                href={href}
                className={styles.card}
                aria-current={active ? 'page' : undefined}
                data-show-indicator={showIndicator ? undefined : 'false'}
                onClick={onClick}
                title={label}
            >
                <div className={styles.cardTop}>
                    <div className={styles.cardLeft}>
                        {iconNode ??
                            (Icon ? (
                                <span
                                    className={styles.cardIconPill}
                                    aria-hidden="true"
                                >
                                    <Icon size={20} />
                                </span>
                            ) : null)}
                        <span className={styles.cardTitle}>{label}</span>
                    </div>
                    {typeof count === 'number' ? (
                        <span className={styles.cardCount}>
                            {count.toLocaleString()}
                        </span>
                    ) : null}
                </div>
                {description ? (
                    <span className={styles.cardDescription}>
                        {description}
                    </span>
                ) : null}
            </Link>
        )
    }

    return (
        <Link
            href={href}
            className={styles.item}
            data-variant={variant}
            data-indicator-target={active}
            data-show-indicator={showIndicator}
            aria-current={active ? 'page' : undefined}
            onClick={onClick}
        >
            {iconNode ?? (Icon ? <Icon /> : null)}
            <span className={styles.labelSection}>
                <span className={styles.label}>{label}</span>
                {subtitle ? (
                    <span className={styles.subtitle}>{subtitle}</span>
                ) : null}
            </span>
            {tagLabel ? (
                <span className={styles.tag}>{tagLabel}</span>
            ) : typeof count === 'number' ? (
                <span className={styles.count}>{count.toLocaleString()}</span>
            ) : null}
        </Link>
    )
}
