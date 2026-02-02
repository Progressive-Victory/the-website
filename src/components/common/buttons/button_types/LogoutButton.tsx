'use client'

import { BaseButton, BaseVisualProps } from '../Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { signOut } from 'next-auth/react'

export type LogoutButtonProps = BaseVisualProps & {
    callbackUrl?: string
}

export function LogoutButton(props: LogoutButtonProps) {
    const { className, callbackUrl, ...rest } = props

    const mergedClassName = [buttonStyles.primary, className]
        .filter(Boolean)
        .join(' ')

    return (
        <BaseButton
            {...rest}
            className={mergedClassName}
            onClick={() => {
                void signOut({ callbackUrl })
            }}
        />
    )
}
