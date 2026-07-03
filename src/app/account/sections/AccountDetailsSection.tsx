'use client'

import { AccountInfoForm } from '../AccountInfoForm'
import styles from '@/app/account/account.module.css'
import { DiscordAvatar } from '@/components/common'
import { BaseButton } from '@/components/common/buttons/Button'
import { User } from '@/contracts/data'

interface AccountDetailsSectionProps {
    userData: User
    canAccessAdminPanel: boolean
    handleSignOut: () => void
    onSave: (user: User) => void
}

export function AccountDetailsSection({
    userData,
    canAccessAdminPanel,
    handleSignOut,
    onSave,
}: AccountDetailsSectionProps) {
    return (
        <section className={styles.content}>
            <header className={styles.contentHeader}>
                <div className={styles.headerTopRow}>
                    <div className={styles.headerTextBlock}>
                        <p className={styles.pageTitle}>Account Dashboard</p>

                        <p className={styles.pageSubtitle}>
                            View and update your personal account information.
                            We use this info to create and ship membership
                            cards.
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        {canAccessAdminPanel && (
                            <BaseButton
                                label="Project Lootbox"
                                href="/admin?from=welcome"
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
                <AccountInfoForm
                    user={userData}
                    onSave={onSave}
                    subtitle={
                        userData.discordUsers?.[0]?.username
                            ? `@${userData.discordUsers[0].username}`
                            : undefined
                    }
                    avatar={
                        <DiscordAvatar
                            discordUserId={userData.discordUsers?.[0]?.id}
                            imageId={userData.discordUsers?.[0]?.image}
                            size={48}
                        />
                    }
                    title={
                        `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim() ||
                        'Account'
                    }
                />
            </div>
        </section>
    )
}
