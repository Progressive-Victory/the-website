import styles from '../app/login/login.module.css'
import { HalftoneBackground } from './halftone/HalftoneBackground'
import { MainLayout } from './layout'
import { AccessDenied } from '@/components/AccessDenied'
import { hasPermission, useAuth, useCurrentUser } from '@/util/hooks'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

interface ProtectedPageProps {
    children: ReactNode
    requiredPermissions: string[]
}

export function ProtectedPage({
    children,
    requiredPermissions = [],
}: ProtectedPageProps) {
    const { isSessionLoading, session } = useAuth()
    const currentUser = useCurrentUser()

    if (currentUser.isLoading || isSessionLoading) return null

    if (!session) redirect('/login')

    const isAccessDenied = () => {
        const user = currentUser.data
        if (!user || currentUser.error)
            return (
                <AccessDenied message="There was an error while checking your authentication." />
            )

        if (
            !requiredPermissions.every((permission) =>
                hasPermission(user, permission)
            )
        )
            return (
                <AccessDenied message="You lack sufficient permissions to view this page." />
            )
        return false
    }
    const accessDenied = isAccessDenied()

    return accessDenied ? (
        <MainLayout>
            <div className={styles.backgroundCover} />
            <HalftoneBackground />
            <div className={styles.body}>{accessDenied}</div>
        </MainLayout>
    ) : (
        children
    )
}
