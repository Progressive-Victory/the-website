// app/ProtectedPage.jsx
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/util/auth' // your NextAuth options
import { IUser } from '@/models/User'

// Role checking utility function
const hasRequiredRoles = (user: IUser, requiredRoles: string[] = []) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false
    return requiredRoles.every((role) => user.roles.includes(role))
}

const getUser = async () => {
    const response = await fetch('/api/user')
    const data = await response.json()
    return data
}

interface ProtectedPageProps {
    children: React.ReactNode
    requiredRoles: string[]
}

/**
 * A server-side protected wrapper that conditionally renders its child component
 * based on authentication and role requirements.
 */
export default async function ProtectedPage({
    children,
    requiredRoles = [],
}: ProtectedPageProps) {
    // Get the server session
    const session = await getServerSession(authOptions)
    const user = await getUser()
    // No session found
    if (!session || !session.user) {
        return (
            <div>
                <h1>Access Denied</h1>
                <p>You must be signed in to view this page.</p>
            </div>
        )
    }

    // If required roles are specified, verify them
    if (requiredRoles.length > 0 && !hasRequiredRoles(user, requiredRoles)) {
        return (
            // TODO: Make this pretty
            <div>
                <h1>Access Denied</h1>
                <p>
                    You do not have the necessary permissions to view this page.
                </p>
            </div>
        )
    }

    // Render the provided client component if all checks pass
    return <>{children}</>
}
