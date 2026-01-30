import { useCurrentUser } from '@/util/hooks'
import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

interface ProtectedPageProps {
    children: ReactNode
    requiredRoles: string[]
}

export function ProtectedPage({
    children,
    requiredRoles = [],
}: ProtectedPageProps) {
    const session = useSession()
    const currentUser = useCurrentUser()

    if (currentUser.isLoading || session.status == 'loading') return null

    if (session.status == 'unauthenticated')
        return (
            <div>
                <h1>Access Denied</h1>
                <p>You need to be logged in to view this page.</p>
            </div>
        )

    if (!currentUser.data || currentUser.error)
        return (
            <div>
                <h1>Access Denied</h1>
                <p>There was an error while checking your authentication.</p>
            </div>
        )

    if (
        !requiredRoles.every((role) =>
            currentUser.data?.roles?.some((found) => found.name == role)
        )
    )
        return (
            <div>
                <h1>Access Denied</h1>
                <p>You lack sufficient permissions to view this page.</p>
            </div>
        )

    return children
}
