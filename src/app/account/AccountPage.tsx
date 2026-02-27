'use client'

import { AccountInfoForm } from './AccountInfoForm'
import styles from '@/app/account/account.module.css'
import { User } from '@/contracts/data'
import { useUpdatedUser } from '@/queries/users.queries'
import { hasPermission, useCurrentUser, useAuth } from '@/util/hooks'
import Link from 'next/link'
import { useMemo } from 'react'

export function Account() {
	const { isSessionLoading, session, onLogout } = useAuth()
    const loggedInUser = useCurrentUser()

 	const canAccessAdminPanel = useMemo(() => {
        return loggedInUser.data
            ? hasPermission(loggedInUser.data, 'Admin Panel Access')
            : false
    }, [loggedInUser.data])

    const handleSignOut = () => {
        void onLogout()
    }

    const updateMutation = useUpdatedUser({ loggedInUser: loggedInUser.data })

    const onSave = (user: User) => {
        updateMutation.mutate({
            id: user.id,
            user,
            request: {
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                birthdate: user.birthdate,
                zipCode: user.location?.zip ?? null,
            },
        })
    }

	if (isSessionLoading) return null

    if (!session) return null

    return (
        <div className={styles.pageRoot}>
            <div className={styles.contentColumn}>
                <p className={styles.pageTitle}>Account Dashboard</p>
                <div className={styles.contentRow}>
                    <div className={styles.accountColumn}>
                        <div className={styles.accountControls}>
                            <div className={styles.sectionHeader}>
                                Account Controls
                            </div>

                            <div className={styles.controlRow}>
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className={styles.primaryButton}
                                >
                                    Sign Out
                                </button>

                                {canAccessAdminPanel && (
                                    <Link
                                        href="/admin"
                                        className={styles.adminLink}
                                    >
                                        <span className={styles.primaryButton}>
                                            Admin Panel
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {loggedInUser.data && (
                            <AccountInfoForm
                                user={loggedInUser.data}
                                onSave={onSave}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
