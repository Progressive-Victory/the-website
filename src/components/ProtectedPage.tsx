import styles from '../app/login/login.module.css'
import { HalftoneBackground } from './halftone/HalftoneBackground'
import { MainLayout } from './layout'
import { AccessDenied } from '@/components/AccessDenied'
import { useAuth, useCurrentUser } from '@/util/hooks'
import { redirect } from 'next/navigation'
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

    if (!session) redirect('/login')

    const isAccessDenied = () => {
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
