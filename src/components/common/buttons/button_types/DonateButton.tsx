'use client'

import { BaseButton } from '../Button'
import type { BaseVisualProps, ButtonStyleKey } from '../types'

const DONATE_HREF = 'https://secure.actblue.com/donate/pvwebsite'

export type DonateButtonProps = BaseVisualProps & {
    styleKey?: ButtonStyleKey
}

export function DonateButton(props: DonateButtonProps) {
    const { styleKey = 'prominent', ...rest } = props

    return (
        <BaseButton
            {...rest}
            styleKey={styleKey}
            action={{ buttonFunction: 'link', href: DONATE_HREF }}
        />
    )
}
