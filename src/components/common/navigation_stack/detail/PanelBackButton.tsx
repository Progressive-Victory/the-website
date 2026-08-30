'use client'

import { BackButton } from '@/components/common/buttons'
import { usePanelBackNavigation } from '@/util/hooks'
import { useMediaQuery } from 'usehooks-ts'

interface PanelBackButtonProps {
    className?: string
    showOnDesktop?: boolean
    showOnMobile?: boolean
    onClick?: () => void
    label?: string
}

export function PanelBackButton({
    className,
    showOnDesktop = false,
    showOnMobile = true,
    onClick,
    label = 'Back',
}: PanelBackButtonProps) {
    const { handleNavigateBack, isPanelRoute } = usePanelBackNavigation()
    const isDesktop = useMediaQuery('(min-width: 64rem)')

    const shouldShowForViewport =
        (isDesktop && showOnDesktop) || (!isDesktop && showOnMobile)

    if (!isPanelRoute || !shouldShowForViewport) {
        return null
    }

    return (
        <BackButton
            label={label}
            onClick={onClick ?? handleNavigateBack}
            className={className}
        />
    )
}
