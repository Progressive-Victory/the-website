// app/ProtectedPage.jsx
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/util/auth' // your NextAuth options
import { IUser } from '@/models/User'
import { IRole } from '@/models/Role'

// Role checking utility function
const hasRequiredRoles = (user: IUser, requiredRoles: string[] = []) => {
    console.log(user)
    console.log(user.roles)
    const userRoles = user.roles as IRole[]
    const roleStrs = userRoles.map((role: IRole) => role.name)
    console.log("Required Roles: " + requiredRoles)
    console.log("User Roles: " + roleStrs)
    if (!user || !user.roles || !Array.isArray(user.roles)) return false
    return requiredRoles.every((role) => roleStrs.includes(role))
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
    const session = await getServerSession(authOptions)
    console.log("Component Session: " + session)
    const response = await fetch(process.env.URL + '/api/user')
    const user = await response.json()
    if(!session) throw Error("Failed to retrieve session from server.")

    // Get the server session
    //const session = await getServerSession(authOptions)
    // No session found
    if (!session || !session.user) {
        return (
            <div>
                <h1>Access Denied</h1>
                <p>You must be signed in to view this page.</p>
            </div>
        )
    }

    console.log("UwU")
    // If required roles are specified, verify them
    if (user && requiredRoles.length > 0 && hasRequiredRoles(user, requiredRoles)) {
        // Render the provided client component if all checks pass
        return <>{children}</>
    }

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
