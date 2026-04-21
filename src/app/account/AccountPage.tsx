'use client'

import { AccountInfoForm } from './AccountInfoForm'
import styles from '@/app/account/account.module.css'
import { DiscordAvatar } from '@/components/common'
import { BaseButton } from '@/components/common/buttons/Button'
import { User } from '@/contracts/data'
import { useUpdatedUser } from '@/queries/users.queries'
import { hasPermission, useCurrentUser, useAuth } from '@/util/hooks'
import { useMemo } from 'react'

export function AccountPage() {
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
                metaData: {
                    userWhoUpdatedId: user.id,
                    dataSource: 'Account Page',
                },
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                birthdate: user.birthdate,
                address: {
                    addressLine1: user.address.addressLine1,
                    addressLine2: user.address.addressLine2,
                    city: user.address.city,
                    county: user.address.county,
                    state: user.address.state,
                    zip: user.address.zip,
                },
            },
        })
    }

    if (isSessionLoading) return null

    if (!session) return null

    return (
        <div className={styles.root}>
            <div className={styles.main}>
                <section className={styles.content}>
                    <header className={styles.contentHeader}>
                        <div className={styles.headerTopRow}>
                            <div className={styles.headerTextBlock}>
                                <p className={styles.pageTitle}>
                                    Account Dashboard
                                </p>

                                <p className={styles.pageSubtitle}>
                                    View and update your personal account
                                    information. We use this info to create and
                                    ship membership cards.
                                </p>
                            </div>

                            <div className={styles.headerActions}>
                                {canAccessAdminPanel && (
                                    <BaseButton
                                        label="Admin Panel"
                                        href="/admin"
                                        className={styles.secondaryButton}
                                    />
                                )}

                                <BaseButton
                                    label="Sign Out"
                                    onClick={handleSignOut}
                                    className={styles.primaryButton}
                                />
                            </div>
                        </div>
                    </header>

                    <div className={styles.contentPanel}>
                        {loggedInUser.data && (
                            <AccountInfoForm
                                user={loggedInUser.data}
                                onSave={onSave}
                                subtitle={
                                    loggedInUser.data.discordUsers?.[0]
                                        ?.username
                                        ? `@${loggedInUser.data.discordUsers[0].username}`
                                        : undefined
                                }
                                avatar={
                                    <DiscordAvatar
                                        discordUserId={
                                            loggedInUser.data.discordUsers?.[0]
                                                ?.id
                                        }
                                        imageId={
                                            loggedInUser.data.discordUsers?.[0]
                                                ?.image
                                        }
                                        size={48}
                                    />
                                }
                                title={
                                    `${loggedInUser.data.firstName ?? ''} ${loggedInUser.data.lastName ?? ''}`.trim() ||
                                    'Account'
                                }
                            />
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
