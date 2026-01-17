'use client'

import styles from '@/app/account/account.module.css'
import {
    ContentPageFrame,
    ContentSection,
} from '@/components/content_sections/ContentSections'
import { hasPermission, useCurrentUser, useFetch } from '@/util/hooks'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useMemo, useEffect } from 'react'

export function Account() {
    const { data: session } = useSession()
    const { onSignOut } = useFetch()
    const user = useCurrentUser()

    const canAccessAdminPanel = useMemo(() => {
        return user.data
            ? hasPermission(user.data, 'Admin Panel Access')
            : false
    }, [user.data])

    const handleSignOut = () => {
        onSignOut()
        void signOut({ callbackUrl: '/' })
    }

    if (!session) return null

    return (
        <div className={styles.pageRoot}>
            <ContentPageFrame>
                <ContentSection
                    title="Account Controls"
                    titleAlign="center"
                    highlight="Controls"
                    highlightColor="#CE3728"
                >
                    <div className={styles.controlsRow}>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className={styles.primaryButton}
                        >
                            Sign Out
                        </button>

                        {canAccessAdminPanel && (
                            <Link href="/admin" className={styles.adminLink}>
                                <span className={styles.primaryButton}>
                                    Admin Panel
                                </span>
                            </Link>
                        )}
                    </div>
                </ContentSection>

                <div className={styles.notice}>
                    <InformationCircleIcon className={styles.noticeIcon} />
                    <span>Pardon our dust while we work on this page</span>
                </div>
            </ContentPageFrame>
        </div>
    )
}
