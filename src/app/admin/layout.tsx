'use client'

import styles from './admin.module.css'
import { ProtectedPage } from '@/components/ProtectedPage'
import AdminNav from '@/components/admin/AdminNav'
import { Header } from '@/components/layout/Header'
import { zPermission, zRole, zUser } from '@/contracts/data'
import { zActBlueDonor } from '@/contracts/data/ActBlueDonor'
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

    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <div className={styles.root}>
                <Header />

                <div className={styles.main}>
                    <AdminNav
                        userCount={users.query.data?.count}
                        roleCount={roles.query.data?.count}
                        permissionCount={permissions.query.data?.count}
                        donorCount={donors.query.data?.count}
                    />

                    <div className={styles.content}>{children}</div>
                </div>
            </div>
        </ProtectedPage>
    )
}
