'use client'

import styles from './admin.module.css'
import Sidebar from './layout/Sidebar'
import { ProtectedPage } from '@/components/ProtectedPage'
import { Header } from '@/components/layout/Header'
import {
    zEndorsement,
    zActBlueDonationPacket,
    zPermission,
    zRole,
    zUser,
} from '@/contracts/data'
import { zActBlueDonor } from '@/contracts/data/ActBlueDonor'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import z from 'zod'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { ready, onGet } = useFetch()

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
    const endorsements = useQuery({
        queryKey: ['/endorsements'],
        queryFn: ready
            ? () => onGet('/endorsements', z.array(zEndorsement))
            : skipToken,
        placeholderData: keepPreviousData,
    })

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
                        endorsementCount={endorsements.data?.length}
                    />

                    <div className={styles.content}>{children}</div>
                </div>
            </div>
        </ProtectedPage>
    )
}
