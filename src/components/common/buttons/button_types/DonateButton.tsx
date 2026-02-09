'use client'

import { BaseButton, BaseVisualProps } from '../Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { DonationOverlay } from '@/components/donation'
import React from 'react'

const DONATE_HREF = 'https://secure.actblue.com/donate/pvwebsite'

export type DonateButtonProps = BaseVisualProps

export function DonateButton(props: DonateButtonProps) {
    const { className, ...rest } = props

    const mergedClassName = [buttonStyles.prominent, className]
        .filter(Boolean)
        .join(' ')

    const [showDonationOverlay, setShowDonationOverlay] = React.useState(false)

    const handleShowOverlay = () => {
        setShowDonationOverlay(!showDonationOverlay)
    }

    return (
        <div>
            <BaseButton
                {...rest}
                className={mergedClassName}
                onClick={handleShowOverlay}
            />
            {showDonationOverlay && (
                <DonationOverlay
                    handleShowOverlay={handleShowOverlay}
                ></DonationOverlay>
            )}
        </div>
    )
}
