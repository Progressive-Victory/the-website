'use client'

import { useIsContainerDesktop } from '../NavigationStack.helpers'
import styles from './PanelBackButton.module.css'
import { BackButton } from '@/components/common/buttons'
import { cn } from '@/util'
import { usePanelBackNavigation } from '@/util/hooks'
import { createContext, useContext } from 'react'

export const PanelRouteBackHiddenContext = createContext(false)

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
    const isDesktop = useIsContainerDesktop()
    const routeBackHidden = useContext(PanelRouteBackHiddenContext)

    const shouldShowForViewport =
        (isDesktop && showOnDesktop) || (!isDesktop && showOnMobile)

    if (!isPanelRoute || !shouldShowForViewport) {
        return null
    }

    if (!onClick && routeBackHidden) return null

    return (
        <BackButton
            label={label}
            onClick={onClick ?? handleNavigateBack}
            className={cn(styles.panelBackButton, className)}
        />
    )
}
