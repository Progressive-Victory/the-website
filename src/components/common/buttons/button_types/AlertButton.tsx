'use client'

import { BaseButton } from '../Button'
import type { BaseVisualProps, ButtonStyleKey } from '../types'

export type AlertButtonProps = BaseVisualProps & {
    alertMessage: string
    styleKey?: ButtonStyleKey
}

export function AlertButton(props: AlertButtonProps) {
    const { styleKey = 'prominent', alertMessage, ...rest } = props

    return (
        <BaseButton
            {...rest}
            styleKey={styleKey}
            action={{ buttonFunction: 'alert', alertMessage }}
        />
    )
}
