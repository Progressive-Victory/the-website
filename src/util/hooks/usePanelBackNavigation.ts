'use client'

import { usePathname } from 'next/navigation'

interface UsePanelBackNavigationOptions {
    isPanelRoute: (pathname: string) => boolean
    onNavigateBack: () => void
}

export function usePanelBackNavigation({
    isPanelRoute,
    onNavigateBack,
}: UsePanelBackNavigationOptions) {
    const pathname = usePathname()

    return {
        handleNavigateBack: onNavigateBack,
        isPanelRoute: isPanelRoute(pathname),
    }
}
