import { AccessDenied } from '@/components/AccessDenied'
import { useAuth, useCurrentUser } from '@/util/hooks'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { useEffect } from 'react'

interface ProtectedPageProps {
    children: ReactNode
    requiredRoles: string[]
}

export function ProtectedPage({
    children,
    requiredRoles = [],
}: ProtectedPageProps) {
    const { isSessionLoading, session } = useAuth()
    const currentUser = useCurrentUser()
    const pathname = usePathname()
    const router = useRouter()

    const hasRequiredRoles =
        currentUser.data &&
        requiredRoles.every((role) =>
            currentUser.data?.roles?.some((found) => found.name == role)
        )

    useEffect(() => {
        if (isSessionLoading) return

        if (!session) {
            const params = new URLSearchParams({
                error: '401',
                redirect: pathname,
            })
            router.replace(`/login?${params}`)
            return
        }

        if (currentUser.isLoading) return

        if (currentUser.data && !hasRequiredRoles) router.replace('/404')
    }, [
        currentUser.data,
        currentUser.isLoading,
        hasRequiredRoles,
        isSessionLoading,
        pathname,
        router,
        session,
    ])

    if (isSessionLoading || !session || currentUser.isLoading) return null

    if (currentUser.data && !hasRequiredRoles) return null

    if (!currentUser.data || currentUser.error)
        return (
            <AccessDenied message="There was an error while checking your authentication." />
        )

    return children
}
