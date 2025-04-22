// app/ProtectedPage.jsx
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/util/auth' // your NextAuth options
import { IUser, User } from '@/models/User'
import { IRole, Role } from '@/models/Role'
import dbConnect from '@/util/libmongo'
import { getToken } from 'next-auth/jwt'

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

const getUser = async (token: string) => {
    await dbConnect()
    const usr = User.findOne()
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

    await dbConnect()

    const user = await User.findOne({discordId: session.discordId})
        .populate('roles')
        .exec()

    console.log("User Object:" + user)
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
