'use client'

import { usePathname, useRouter } from 'next/navigation'

export function usePanelBackNavigation() {
    const pathname = usePathname()
    const router = useRouter()
    const isPanelRoute = pathname.startsWith('/volunteer_dashboard/panels/')

    function handleNavigateBack() {
        router.push('/volunteer_dashboard')
    }

    return {
        handleNavigateBack,
        isPanelRoute,
    }
}
