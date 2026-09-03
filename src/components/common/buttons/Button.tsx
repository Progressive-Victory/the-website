'use client'

import styles from '@/components/common/buttons/Button.module.css'
import { cn } from '@/util'
import type React from 'react'

export type ButtonVariant = 'default' | 'long' | 'mobile'

export interface BaseVisualProps {
    label: string
    buttonVariant?: ButtonVariant
    showChevron?: boolean
    className?: string
    disabled?: boolean
}

export type BaseButtonProps = BaseVisualProps & {
    className: string
    href?: string
    onClick?: () => void
    renderContent?: (args: { showNavChevron: boolean }) => React.ReactNode
    rotateChevronOnHover?: boolean

    target?: React.HTMLAttributeAnchorTarget
    rel?: string
}

export function BaseButton(props: BaseButtonProps) {
    const {
        label,
        className,
        buttonVariant = 'default',
        showChevron,
        rotateChevronOnHover = true,
        disabled,
        href,
        onClick,
        renderContent,
        target,
        rel,
    } = props

    const showNavChevron =
        showChevron === true &&
        (buttonVariant === 'long' || showChevron === true)

    const finalClassName = cn(
        styles.buttonBase,
        className,
        buttonVariant === 'long'
            ? styles.longVariant
            : buttonVariant === 'mobile'
              ? styles.wideVariant
              : undefined,
        showNavChevron && styles.navButton,
        buttonVariant === 'long' && showNavChevron && styles.longNavButton,
        showNavChevron && !rotateChevronOnHover && styles.noChevronRotate
    )

    const content = renderContent?.({ showNavChevron }) ?? (
        <span className={styles.buttonContent}>
            <span className={styles.buttonLabel}>{label}</span>
            {showNavChevron ? (
                <span className={styles.navAffordance} aria-hidden="true" />
            ) : null}
        </span>
    )

    if (href) {
        const finalRel =
            target === '_blank' ? (rel ?? 'noopener noreferrer') : rel

        return (
            <a
                href={href}
                className={finalClassName}
                target={target}
                rel={finalRel}
                aria-disabled={disabled ?? undefined}
                onClick={(e) => {
                    if (disabled) e.preventDefault()
                }}
            >
                {content}
            </a>
        )
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={finalClassName}
        >
            {content}
        </button>
    )
}
