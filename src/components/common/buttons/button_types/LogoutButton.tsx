'use client'

import { BaseButton, BaseVisualProps } from '../Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { useAuth } from '@/util/hooks'

export type LogoutButtonProps = BaseVisualProps & {
    callbackUrl?: string
}

export function LogoutButton({
    className,
    callbackUrl,
    ...rest
}: LogoutButtonProps) {
    const { onLogout } = useAuth()

    const mergedClassName = [buttonStyles.primary, className]
        .filter(Boolean)
        .join(' ')

    return (
        <BaseButton
            {...rest}
            className={mergedClassName}
            onClick={() => {
                void onLogout(callbackUrl)
            }}
        />
    )
}
