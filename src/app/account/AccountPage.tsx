'use client'

import {
    AccountContributionsSection,
    AccountDetailsSection,
    ManualDonorLinkRequest,
} from './sections/index'
import styles from '@/app/account/account.module.css'
import { OnboardingStage, User } from '@/contracts/data'
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

    const { updateUser, linkUser } = useUpdatedUser({
        loggedInUser: loggedInUser.data,
    })

    const onSave = (user: User) => {
        updateUser.mutate({
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
                shirtSize: user.shirtSize,
            },
        })
    }

    const onLinkFormSubmit = (donorLinkForm: ManualDonorLinkRequest) => {
        if (!loggedInUser.data) return

        linkUser.mutate({
            id: loggedInUser.data.id,
            user: loggedInUser.data,
            donorLinkRequest: donorLinkForm,
        })
    }

    if (isSessionLoading || !session) return null

    if (
        loggedInUser.data &&
        loggedInUser.data.onboardingStage != OnboardingStage.JOINED
    ) {
        window.location.href = '/volunteer'
        return null
    }

    return (
        <div className={styles.root}>
            <div className={styles.main}>
                {loggedInUser.data && (
                    <>
                        <AccountDetailsSection
                            userData={loggedInUser.data}
                            canAccessAdminPanel={canAccessAdminPanel}
                            handleSignOut={handleSignOut}
                            onSave={onSave}
                            donorLinkError={linkUser.error}
                            onDonorLinkSubmit={onLinkFormSubmit}
                        />
                        {loggedInUser.data.donors?.length && (
                            <AccountContributionsSection
                                user={loggedInUser.data}
                                error={linkUser.error}
                                onSubmit={onLinkFormSubmit}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
