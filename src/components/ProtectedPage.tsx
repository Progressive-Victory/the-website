import { AccessDenied } from '@/components/AccessDenied'
import { useAuth, useCurrentUser } from '@/util/hooks'
import { ReactNode } from 'react'

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

    if (currentUser.isLoading || isSessionLoading) return null

    if (!session)
        return (
            <AccessDenied message="You need to be logged in to view this page." />
        )

    if (!currentUser.data || currentUser.error)
        return (
            <AccessDenied message="There was an error while checking your authentication." />
        )

    if (
        !requiredRoles.every((role) =>
            currentUser.data?.roles?.some((found) => found.name == role)
        )
    )
        return (
            <AccessDenied message="You lack sufficient permissions to view this page." />
        )
    return children
}
