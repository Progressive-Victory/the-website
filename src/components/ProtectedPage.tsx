// app/ProtectedPage.jsx
import { checkAuth, ResponseCode } from '@/util/auth' // your NextAuth options
import { error } from 'console'

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
    const response = await checkAuth(requiredRoles)

    switch(response) {
        case ResponseCode.Successful:
            return <>{children}</>
        case ResponseCode.Exception:
            return (
                <div>
                    <h1>Access Denied</h1>
                    <p>
                        There was an error while checking your authentication.
                    </p>
                </div>
            )
        case ResponseCode.InsufficientAccess:
            return (
                <div>
                    <h1>Access Denied</h1>
                    <p>
                        You lack sufficient permissions to view this page.
                    </p>
                </div>
            )
        case ResponseCode.NoSession:
            return (
                <div>
                    <h1>Access Denied</h1>
                    <p>
                        You need to be logged in to view this page.
                    </p>
                </div>
            )
        default:
            throw error("Unidentifed response code")
    }
}
