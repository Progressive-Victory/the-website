'use client'

import { BaseVisualProps } from '../Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { signOut } from 'next-auth/react'

export type LogoutButtonProps = BaseVisualProps & {
    callbackUrl?: string
    children?: React.ReactNode
}

export function LogoutButton(props: LogoutButtonProps) {
    const { className, callbackUrl, children = 'Sign Out', ...rest } = props

    const mergedClassName = [buttonStyles.primary, className]
        .filter(Boolean)
        .join(' ')

    return (
        <button
            type="button"
            className={mergedClassName}
            onClick={() => {
                void signOut({ callbackUrl })
            }}
            {...rest}
        >
            {children}
        </button>
    )
}
