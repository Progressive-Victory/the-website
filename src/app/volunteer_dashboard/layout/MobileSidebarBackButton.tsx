'use client'

import styles from './MobileSidebarBackButton.module.css'
import { PanelBackButton } from '@/components/common/navigation_stack/detail/PanelBackButton'
import { cn } from '@/util'

interface MobileSidebarBackButtonProps {
    label: string
    sidebarMobileVisible: boolean
    onBack: () => void
    className?: string
    showOnDesktop?: boolean
}

export function MobileSidebarBackButton({
    label,
    sidebarMobileVisible,
    onBack,
    className,
    showOnDesktop = false,
}: MobileSidebarBackButtonProps) {
    if (sidebarMobileVisible) return null

    return (
        <div className={cn(styles.wrapper, className)}>
            <PanelBackButton
                label={label}
                onClick={onBack}
                showOnDesktop={showOnDesktop}
            />
        </div>
    )
}
