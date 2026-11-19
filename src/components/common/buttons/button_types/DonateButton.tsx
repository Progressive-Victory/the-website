'use client'

import { BaseButton, BaseVisualProps } from '../Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { useCurrentUser } from '@/util/hooks'

const DONATE_HREF = 'https://secure.actblue.com/donate/pvwebsite'

export type DonateButtonProps = BaseVisualProps

export function DonateButton(props: DonateButtonProps) {
    const { className, ...rest } = props
    const loggedInUser = useCurrentUser()
    const discordId = loggedInUser?.data?.discordUsers?.[0]?.id ?? null

    const href = discordId
        ? `${DONATE_HREF}?refcode2=${discordId}`
        : DONATE_HREF

    const mergedClassName = [buttonStyles.prominent, className]
        .filter(Boolean)
        .join(' ')

    return <BaseButton {...rest} className={mergedClassName} href={href} />
}
