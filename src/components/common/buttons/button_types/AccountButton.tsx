'use client'

import { BaseButton } from '../Button'
import type { BaseVisualProps } from '../Button'
import styles from '@/components/common/buttons/button.module.css'
import cx from 'classnames'
import Image from 'next/image'

export type AccountButtonProps = BaseVisualProps & {
    href: string
    avatarSrc?: string
    avatarAlt?: string
}

export function AccountButton(props: AccountButtonProps) {
    const {
        avatarSrc,
        avatarAlt,
        buttonVariant = 'default',
        className,
        label,
        ...rest
    } = props

    const isLongVariant = buttonVariant === 'long'
    const hasAvatar = typeof avatarSrc === 'string' && avatarSrc.length > 0
    const isAccountCompact = !isLongVariant

    const mergedClassName = cx(
        styles.primary,
        isAccountCompact && styles.accountCompact,
        className
    )

    return (
        <BaseButton
            {...rest}
            label={label}
            buttonVariant={buttonVariant}
            className={mergedClassName}
            renderContent={({ showNavChevron }) => {
                if (!hasAvatar) return undefined

                if (isLongVariant) {
                    return (
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
                            {showNavChevron ? (
                                <span
                                    className={styles.navAffordance}
                                    aria-hidden="true"
                                />
                            ) : null}
                        </span>
                    )
                }

                return (
                    <Image
                        src={avatarSrc}
                        alt={avatarAlt ?? 'Account avatar'}
                        width={52}
                        height={52}
                        className={styles.accountAvatarSolo}
                        style={{ objectFit: 'cover' }}
                    />
                )
            }}
        />
    )
}
