'use client'

import AccountInfoForm from './AccountInfoForm'
import MembershipPurchaseDialog from './MembershipPurchaseDialog'
import styles from './account.module.css'
import { MainLayout } from '@/components/layout/MainLayout'

interface AccountInformation {
    discordUsername: string
    discordId: string
    firstName: string
    lastName: string
    dateOfBirth: Date
    state: string
    city: string
    zip: number
    addressLine1: string
    addressLine2: string
    emailAddress: string
    phoneNumber: string
}

const Account = (accountInformation: AccountInformation) => {
    return (
        <MainLayout>
            <div className={`${styles.background} halftone`} />
            <div
                className={styles.whiteHouseImage}
                style={{
                    backgroundImage: "url('/images/blend_test.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'right',
                    mixBlendMode: 'lighten',
                    transform: 'scaleX(-1)',
                }}
            />
            <div className={styles.mainDiv}>
                <div className={styles.contentBox}>
                    <header>
                        <p className={styles.pageTitle}>Account Dashboard</p>
                    </header>
                    <div className={styles.contentRow}>
                        <div className={styles.accountInfoColumn}>
                            <p className={styles.accountNameTitle}>
                                {accountInformation.discordUsername}
                            </p>
                            <AccountInfoForm
                                {...accountInformation}
                            ></AccountInfoForm>
                        </div>
                        <div className={styles.divider} />
                        <MembershipPurchaseDialog />
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default Account
