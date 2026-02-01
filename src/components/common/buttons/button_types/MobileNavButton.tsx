'use client'

import { BaseButton, BaseVisualProps } from '../Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'

export type MobileNavButtonProps = BaseVisualProps & {
    href: string
}

export function MobileNavButton(props: MobileNavButtonProps) {
    const { showChevron, className, ...rest } = props

    const mergedClassName = [buttonStyles.plain, className]
        .filter(Boolean)
        .join(' ')

    return (
        <BaseButton
            {...rest}
            className={mergedClassName}
            showChevron={showChevron ?? true}
            rotateChevronOnHover={false}
        />
    )
}
