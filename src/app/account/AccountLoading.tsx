'use client'

import styles from '@/app/account/account.module.css'

export function AccountLoading() {
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
                                    Getting your account information...
                                </p>
                            </div>
                        </div>
                    </header>
                </section>
            </div>
        </div>
    )
}
