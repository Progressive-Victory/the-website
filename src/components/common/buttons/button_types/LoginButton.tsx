'use client'

import { BaseButton } from '../Button'
import type { BaseVisualProps, ButtonStyleKey } from '../types'

export type LoginButtonProps = BaseVisualProps & {
    href: string
    styleKey?: ButtonStyleKey
}

export function LoginButton(props: LoginButtonProps) {
    const { styleKey = 'primary', href, ...rest } = props

    return (
        <BaseButton
            {...rest}
            styleKey={styleKey}
            action={{ buttonFunction: 'link', href }}
        />
    )
}
