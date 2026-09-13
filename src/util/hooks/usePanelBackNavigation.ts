'use client'

import { usePathname, useRouter } from 'next/navigation'

// TODO this is going to be refactored in a later PR on this branch
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
