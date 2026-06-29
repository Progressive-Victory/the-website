'use client'

import { DiscordAvatar } from '../../DiscordAvatar'
import { BaseButton } from '../Button'
import type { BaseVisualProps } from '../Button'
import styles from '@/components/common/buttons/Button.module.css'
import cx from 'classnames'

export type AccountButtonProps = BaseVisualProps & {
    href: string
    discordUserId: string | undefined
    imageId: string | undefined
}

export function AccountButton({
    discordUserId,
    imageId,
    label,
    buttonVariant = 'default',
    className,
    ...rest
}: AccountButtonProps) {
    const isLongVariant = buttonVariant === 'long'
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
                if (isLongVariant) {
                    return (
                        <span className={styles.accountContent}>
                            <DiscordAvatar
                                discordUserId={discordUserId}
                                imageId={imageId}
                                size={44}
                                className={styles.accountAvatar}
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
                    <DiscordAvatar
                        discordUserId={discordUserId}
                        imageId={imageId}
                        size={52}
                        className={styles.accountAvatarSolo}
                    />
                )
            }}
        />
    )
}
