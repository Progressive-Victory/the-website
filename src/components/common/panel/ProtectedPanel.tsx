'use client'

import { Panel } from './Panel'
import styles from './ProtectedPanel.module.css'
import { hasPermission, useCurrentUser } from '@/util/hooks'
import type { ReactNode } from 'react'
import { FaLock } from 'react-icons/fa6'

interface ProtectedPanelProps {
    children: ReactNode
    label: string
    requiredPermissions: number[]
}

export function ProtectedPanel({
    children,
    label,
    requiredPermissions,
}: ProtectedPanelProps) {
    const currentUser = useCurrentUser()

    if (currentUser.isLoading) return null

    const user = currentUser.data
    const authorized =
        user != null &&
        !currentUser.error &&
        requiredPermissions.every((permissionId) =>
            hasPermission(user, permissionId)
        )

    if (authorized) return children

    return (
        <Panel includeHeader label={label} headerRight={false}>
            <div className={styles.container}>
                <div className={styles.card} role="alert">
                    <div className={styles.iconBadge}>
                        <FaLock />
                    </div>
                    <h2 className={styles.title}>Access Denied</h2>
                    <p className={styles.message}>
                        {user && !currentUser.error
                            ? `You don't have permission to view ${label} Panel. Relogin if permissions were just updated.`
                            : 'We couldn’t verify your permissions. Please refresh the page or try again later.'}
                    </p>
                </div>
            </div>
        </Panel>
    )
}
