'use client'

import { BaseButton } from '../Button'
import type { BaseVisualProps, ButtonStyleKey } from '../types'

export type NavButtonProps = BaseVisualProps & {
    href: string
    styleKey?: ButtonStyleKey
}

export function NavButton(props: NavButtonProps) {
    const { styleKey = 'plain', href, showChevron, ...rest } = props

    return (
        <BaseButton
            {...rest}
            styleKey={styleKey}
            action={{ buttonFunction: 'link', href }}
            showChevron={showChevron ?? true}
        />
    )
}
