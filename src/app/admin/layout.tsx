'use client'

import styles from './admin.module.css'
import Sidebar from './layout/Sidebar'
import { ProtectedPage } from '@/components/ProtectedPage'
import { Header } from '@/components/layout/Header'
import {
    zActBlueDonationPacket,
    zActBlueDonor,
    zPermission,
    zRole,
    zUser,
} from '@/contracts/data'
import { zDiscordEvent } from '@/contracts/data/DiscordEvent'
import { usePositionQueries } from '@/queries'
import { usePaginatedSearch } from '@/util/hooks'
import { useQuery } from '@tanstack/react-query'

export default function Layout({ children }: { children: React.ReactNode }) {
    const positionQueries = usePositionQueries()

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
    const events = usePaginatedSearch('/discordEvents', zDiscordEvent, {
        search: { limit: 0 },
    })
    const positionHierarchy = useQuery({
        queryKey: ['positionHierarchy'],
        queryFn: positionQueries.getPositionHierarchy,
        enabled: positionQueries.ready,
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
                        positionCount={
                            positionHierarchy.data?.positions?.length
                        }
                        donorCount={donors.query.data?.count}
                        contributionCount={contributions.query.data?.count}
                        eventCount={events.query.data?.count}
                    />

                    <div className={styles.content}>{children}</div>
                </div>
            </div>
        </ProtectedPage>
    )
}
