'use client'

import styles from '@/components/common/buttons/Button.module.css'
import cx from 'classnames'
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
    href: string

    renderContent?: (args: { showNavChevron: boolean }) => React.ReactNode
    rotateChevronOnHover?: boolean
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
        renderContent,
    } = props

    const showNavChevron =
        showChevron === true &&
        (buttonVariant === 'long' || showChevron === true)

    const finalClassName = cx(
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

    const handleClick = () => {
        location.href = href
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={handleClick}
            className={finalClassName}
        >
            {content}
        </button>
    )
}
