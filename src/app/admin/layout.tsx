'use client'

import styles from './admin.module.css'
import Sidebar from './layout/Sidebar'
import { ProtectedPage } from '@/components/ProtectedPage'
import { Header } from '@/components/layout/Header'
import {
    zActBlueDonationPacket,
    zPermission,
    zRole,
    zUser,
    zActBlueDonor
} from 'pv-contracts/data'
import { usePaginatedSearch } from '@/util/hooks'

export default function Layout({ children }: { children: React.ReactNode }) {
    const users = usePaginatedSearch('/users', zUser, { search: { limit: 0 } })
    const roles = usePaginatedSearch('/roles', zRole, { search: { limit: 0 } })
    const permissions = usePaginatedSearch('/permissions', zPermission, {
        search: { limit: 0 },
    })
    const donors = usePaginatedSearch('/actblue/donors', zActBlueDonor, {
        search: { limit: 0 },
    })
    const contributions = usePaginatedSearch(
        '/actblue/contributions',
        zActBlueDonationPacket,
        { search: { limit: 0 } }
    )

    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <div className={styles.root}>
                <Header />

                <div className={styles.main}>
                    <Sidebar
                        userCount={users.query.data?.count}
                        roleCount={roles.query.data?.count}
                        permissionCount={permissions.query.data?.count}
                        donorCount={donors.query.data?.count}
                        contributionCount={contributions.query.data?.count}
                    />

                    <div className={styles.content}>{children}</div>
                </div>
            </div>
        </ProtectedPage>
    )
}
