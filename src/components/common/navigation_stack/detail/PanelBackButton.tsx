'use client'

import styles from './PanelBackButton.module.css'
import { BackButton } from '@/components/common/buttons'
import { cn } from '@/util'
import { usePanelBackNavigation } from '@/util/hooks'
import { useMediaQuery } from 'usehooks-ts'

interface PanelBackButtonProps {
    className?: string
    showOnDesktop?: boolean
    showOnMobile?: boolean
}

export function PanelBackButton({
    className,
    showOnDesktop = false,
    showOnMobile = true,
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
            label="Back"
            onClick={handleNavigateBack}
            className={cn(styles.panelBackButton, className)}
        />
    )
}
