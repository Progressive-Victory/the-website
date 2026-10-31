'use client'

import styles from './MobileSidebarBackButton.module.css'
import { useIsContainerDesktop } from '@/components/common/navigation_stack/NavigationStack.helpers'
import { PanelBackButton } from '@/components/common/navigation_stack/detail/PanelBackButton'
import { cn } from '@/util'

interface MobileSidebarBackButtonProps {
    label: string
    sidebarMobileVisible: boolean
    onBack: () => void
    className?: string
}

export function MobileSidebarBackButton({
    label,
    sidebarMobileVisible,
    onBack,
    className,
}: MobileSidebarBackButtonProps) {
    const isDesktop = useIsContainerDesktop()
    if (isDesktop || sidebarMobileVisible) return null

    return (
        <div className={cn(styles.wrapper, className)}>
            <PanelBackButton label={label} onClick={onBack} />
        </div>
    )
}
