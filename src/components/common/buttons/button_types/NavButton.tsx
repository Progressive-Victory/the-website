'use client'

import type { BaseVisualProps } from '../Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import cx from 'classnames'
import NextLink from 'next/link'

export type NavButtonProps = BaseVisualProps & {
    href: string
    isSubnavOpen?: boolean
    onOpenSubnav?: () => void
}

function isTouchDesktop() {
    if (typeof window === 'undefined') return false

    const isDesktop = window.matchMedia('(min-width: 1280px)').matches
    if (!isDesktop) return false

    return (
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
    )
}

export function NavButton(props: NavButtonProps) {
    const {
        label,
        href,
        buttonVariant = 'default',
        showChevron,
        className,
        disabled,
        isSubnavOpen,
        onOpenSubnav,
    } = props

    const showNavChevron =
        showChevron === true &&
        (buttonVariant === 'long' || showChevron === true)

    const finalClassName = cx(
        buttonStyles.buttonBase,
        buttonStyles.plain,
        className,
        buttonVariant === 'long'
            ? buttonStyles.longVariant
            : buttonVariant === 'mobile' && buttonStyles.wideVariant,
        showNavChevron && buttonStyles.navButton,
        buttonVariant === 'long' && showNavChevron && buttonStyles.longNavButton
    )

    return (
        <NextLink
            href={href}
            className={finalClassName}
            aria-disabled={disabled ?? undefined}
            tabIndex={disabled ? -1 : 0}
            onClick={(e) => {
                if (disabled) {
                    e.preventDefault()
                    return
                }

                if (isTouchDesktop() && !isSubnavOpen) {
                    e.preventDefault()
                    e.stopPropagation()
                    onOpenSubnav?.()
                }
            }}
        >
            <span className={buttonStyles.buttonContent}>
                <span className={buttonStyles.buttonLabel}>{label}</span>
                {showNavChevron && (
                    <span
                        className={buttonStyles.navAffordance}
                        aria-hidden="true"
                    />
                )}
            </span>
        </NextLink>
    )
}
