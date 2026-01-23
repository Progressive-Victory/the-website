'use client'

import { BaseButton, BaseVisualProps } from '../Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'

const DONATE_HREF = 'https://secure.actblue.com/donate/pvwebsite'

export type DonateButtonProps = BaseVisualProps

export function DonateButton(props: DonateButtonProps) {
    const { className, ...rest } = props

    const mergedClassName = [buttonStyles.prominent, className]
        .filter(Boolean)
        .join(' ')

    return (
        <BaseButton {...rest} className={mergedClassName} href={DONATE_HREF} />
    )
}
