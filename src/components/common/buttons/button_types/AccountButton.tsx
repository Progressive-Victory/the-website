'use client'

import { BaseButton } from '../Button'
import type { BaseVisualProps, ButtonStyleKey } from '../types'

export type AccountButtonProps = BaseVisualProps & {
    href: string
    avatarSrc?: string
    avatarAlt?: string
    styleKey?: ButtonStyleKey
}

export function AccountButton(props: AccountButtonProps) {
    const { styleKey = 'primary', href, ...rest } = props

    return (
        <BaseButton
            {...rest}
            isAccount
            styleKey={styleKey}
            action={{ buttonFunction: 'link', href }}
        />
    )
}
