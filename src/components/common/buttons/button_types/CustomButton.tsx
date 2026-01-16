'use client'

import { BaseButton } from '../Button'
import type { BaseVisualProps, ButtonStyleKey } from '../types'
import type React from 'react'

export type CustomButtonProps = BaseVisualProps & {
    styleKey?: ButtonStyleKey
    onClick: () => void
    renderContent?: (args: { showNavChevron: boolean }) => React.ReactNode
}

export function CustomButton(props: CustomButtonProps) {
    const { styleKey = 'primary', onClick, ...rest } = props

    return (
        <BaseButton
            {...rest}
            styleKey={styleKey}
            action={{ buttonFunction: 'custom', onClick }}
        />
    )
}
