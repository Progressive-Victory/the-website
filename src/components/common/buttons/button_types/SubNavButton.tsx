'use client'

import { BaseButton, BaseVisualProps } from '../Button'
import buttonStyles from '@/components/common/buttons/button.module.css'

export type SubNavButtonProps = BaseVisualProps & {
    href: string
}

export function SubNavButton(props: SubNavButtonProps) {
    const { showChevron, className, ...rest } = props

    const mergedClassName = [buttonStyles.minimal, className]
        .filter(Boolean)
        .join(' ')

    return (
        <BaseButton
            {...rest}
            className={mergedClassName}
            showChevron={showChevron ?? false}
        />
    )
}
