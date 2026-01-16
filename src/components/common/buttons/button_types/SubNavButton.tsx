'use client'

import { BaseButton } from '../Button'
import type { BaseVisualProps, ButtonStyleKey } from '../types'

export type SubNavButtonProps = BaseVisualProps & {
    href: string
    styleKey?: ButtonStyleKey
}

export function SubNavButton(props: SubNavButtonProps) {
    const { styleKey = 'minimal', href, showChevron, ...rest } = props

    return (
        <BaseButton
            {...rest}
            styleKey={styleKey}
            action={{ buttonFunction: 'link', href }}
            showChevron={showChevron ?? false}
        />
    )
}
