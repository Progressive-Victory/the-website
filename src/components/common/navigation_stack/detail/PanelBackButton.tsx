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
    isPanelRoute?: (pathname: string) => boolean
    onNavigateBack?: () => void
}

export function PanelBackButton({
    className,
    showOnDesktop = false,
    showOnMobile = true,
    isPanelRoute: isPanelRouteFn = () => false,
    onNavigateBack = () => {},
}: PanelBackButtonProps) {
    const { handleNavigateBack, isPanelRoute } = usePanelBackNavigation({
        isPanelRoute: isPanelRouteFn,
        onNavigateBack,
    })
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
