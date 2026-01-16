'use client'

import { runAction, type ActionProps } from './actions'
import { buildButtonClassName } from './classnames'
import type { BaseVisualProps, ButtonStyleKey } from './types'
import styles from '@/components/common/buttons/button.module.css'
import Image from 'next/image'
import type React from 'react'

export type BaseButtonProps = BaseVisualProps & {
    styleKey: ButtonStyleKey
    action: ActionProps

    renderContent?: (args: { showNavChevron: boolean }) => React.ReactNode

    isAccount?: boolean
    avatarSrc?: string
    avatarAlt?: string

    rotateChevronOnHover?: boolean
}

export function BaseButton(props: BaseButtonProps) {
    const {
        label,
        styleKey,
        buttonVariant = 'default',
        showChevron,
        rotateChevronOnHover = true,
        className,
        disabled,
        action,
        renderContent,
        isAccount,
        avatarSrc,
        avatarAlt,
    } = props

    const isLongVariant = buttonVariant === 'long'

    const showNavChevron =
        showChevron === true && (isLongVariant || showChevron === true)

    const hasAvatar = typeof avatarSrc === 'string' && avatarSrc.length > 0
    const isAccountCompact = isAccount === true && !isLongVariant

    const composed = buildButtonClassName({
        styleKey,
        buttonVariant,
        showNavChevron,
        isAccountCompact,
    })

    const chevronBehaviorClass =
        showNavChevron && !rotateChevronOnHover ? styles.noChevronRotate : ''

    const finalClassName = [composed, chevronBehaviorClass, className]
        .filter(Boolean)
        .join(' ')

    const content =
        renderContent?.({ showNavChevron }) ??
        (isAccount && hasAvatar ? (
            isLongVariant ? (
                <span className={styles.accountContent}>
                    <Image
                        src={avatarSrc}
                        alt={avatarAlt ?? 'Account avatar'}
                        width={40}
                        height={40}
                        className={styles.accountAvatar}
                        style={{ objectFit: 'cover' }}
                    />
                    <span>{label}</span>
                </span>
            ) : (
                <Image
                    src={avatarSrc}
                    alt={avatarAlt ?? 'Account avatar'}
                    width={52}
                    height={52}
                    className={styles.accountAvatarSolo}
                    style={{ objectFit: 'cover' }}
                />
            )
        ) : (
            <span className={styles.buttonContent}>
                <span className={styles.buttonLabel}>{label}</span>
                {showNavChevron ? (
                    <span className={styles.navAffordance} aria-hidden="true" />
                ) : null}
            </span>
        ))

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => runAction(action, label)}
            className={finalClassName}
        >
            {content}
        </button>
    )
}
