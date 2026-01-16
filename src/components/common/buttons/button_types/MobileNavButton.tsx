'use client'

import { BaseButton } from '../Button'
import type { BaseVisualProps, ButtonStyleKey } from '../types'

export type MobileNavButtonProps = BaseVisualProps & {
    href: string
    styleKey?: ButtonStyleKey
}

export function MobileNavButton(props: MobileNavButtonProps) {
    const { styleKey = 'plain', href, showChevron, ...rest } = props

    return (
        <BaseButton
            {...rest}
            styleKey={styleKey}
            action={{ buttonFunction: 'link', href }}
            showChevron={showChevron ?? true}
            rotateChevronOnHover={false}
        />
    )
}
