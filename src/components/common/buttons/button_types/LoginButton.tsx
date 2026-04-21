'use client'

import { BaseButton, BaseVisualProps } from '../Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'

export type LoginButtonProps = BaseVisualProps & {
    href?: string
    onClick?: () => void
}

export function LoginButton(props: LoginButtonProps) {
    const { className, ...rest } = props

    const mergedClassName = [buttonStyles.primary, className]
        .filter(Boolean)
        .join(' ')

    return <BaseButton {...rest} className={mergedClassName} />
}
