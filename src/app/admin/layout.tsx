'use client'

import styles from './admin.module.css'
import { ProtectedPage } from '@/components/ProtectedPage'
import { NavigationStack } from '@/components/common/navigation_stack/NavigationStack'
import { Detail } from '@/components/common/navigation_stack/detail/Detail'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import { Sidebar } from '@/components/common/navigation_stack/sidebar/Sidebar'
import { Header } from '@/components/layout/Header'
import {
    zActBlueDonationPacket,
    zPermission,
    zRole,
    zUser,
} from '@/contracts/data'
import { zActBlueDonor } from '@/contracts/data/ActBlueDonor'
import { usePaginatedSearch } from '@/util/hooks'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { FaDonate, FaUserShield, FaUserTag, FaUsers } from 'react-icons/fa'
import { FaClipboardUser, FaDollarSign } from 'react-icons/fa6'
import type { IconType } from 'react-icons/lib'

interface AdminGroupChildConfigItem {
    key: string
    label: string
    href: `/admin/panels/${string}`
    icon?: IconType
    count?: number
}

interface AdminPanelConfigItem {
    href: `/admin/panels/${string}`
    key: string
    label: string
    icon: IconType
    count?: number
    buttonType?: 'default' | 'group'
    groupChildren?: AdminGroupChildConfigItem[]
}

export default function Layout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const previousPathnameRef = useRef(pathname)
    const previousPathname = previousPathnameRef.current
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

    const adminPanelConfig: AdminPanelConfigItem[] = [
        {
            key: 'members',
            label: 'Members',
            href: '/admin/panels/members',
            icon: FaUsers,
            count: users.query.data?.count,
        },
        {
            key: 'donors',
            label: 'Donors',
            href: '/admin/panels/donors',
            icon: FaDonate,
            count: donors.query.data?.count,
        },
        {
            key: 'contributions',
            label: 'Contributions',
            href: '/admin/panels/contributions',
            icon: FaDollarSign,
            count: contributions.query.data?.count,
        },
        {
            key: 'positions',
            label: 'Positions',
            href: '/admin/panels/positions',
            icon: FaClipboardUser,
            count: 0,
        },
        {
            key: 'roles',
            label: 'Roles',
            href: '/admin/panels/roles',
            icon: FaUserTag,
            count: roles.query.data?.count,
        },
        {
            key: 'permissions',
            label: 'Permissions',
            href: '/admin/panels/permissions',
            icon: FaUserShield,
            count: permissions.query.data?.count,
        },
        {
            key: 'fundraising',
            label: 'Fundraising',
            href: '/admin/panels/fundraising',
            icon: FaDonate,
            buttonType: 'group',
            groupChildren: [
                {
                    key: 'donors',
                    label: 'Donors',
                    href: '/admin/panels/donors',
                    icon: FaDonate,
                    count: donors.query.data?.count,
                },
                {
                    key: 'contributions',
                    label: 'Contributions',
                    href: '/admin/panels/contributions',
                    icon: FaDollarSign,
                    count: contributions.query.data?.count,
                },
            ],
        },
    ]

    useEffect(() => {
        previousPathnameRef.current = pathname
    }, [pathname])

    const currentTopLevelIndex = adminPanelConfig.findIndex(
        (panel) => panel.href === pathname
    )
    const previousTopLevelIndex = adminPanelConfig.findIndex(
        (panel) => panel.href === previousPathname
    )

    const activePanelLabel = adminPanelConfig
        .flatMap((panel) => [
            { href: panel.href, label: panel.label },
            ...(panel.groupChildren ?? []).map((groupChild) => ({
                href: groupChild.href,
                label: groupChild.label,
            })),
        ])
        .find((panel) => panel.href === pathname)?.label

    const isPanelSelected = pathname.startsWith('/admin/panels/')

    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <div className={styles.root}>
                <Header />

                <NavigationStack
                    className={styles.navigationStack}
                    isSelected={isPanelSelected}
                    sidebar={
                        <Sidebar
                            className={styles.sidebar}
                            label="Volunteer Dashboard"
                        >
                            {adminPanelConfig.map((panel) => (
                                <NavigationButton
                                    key={panel.key}
                                    active={pathname === panel.href}
                                    href={panel.href}
                                    label={panel.label}
                                    icon={panel.icon}
                                    count={panel.count}
                                    buttonType={panel.buttonType}
                                    indicatorDirection={
                                        pathname === panel.href &&
                                        currentTopLevelIndex !== -1 &&
                                        previousTopLevelIndex !== -1 &&
                                        previousPathname !== pathname
                                            ? currentTopLevelIndex >
                                              previousTopLevelIndex
                                                ? 'down'
                                                : 'up'
                                            : 'none'
                                    }
                                    hasActiveGroupChild={Boolean(
                                        panel.groupChildren?.some(
                                            (groupChild) =>
                                                pathname === groupChild.href
                                        )
                                    )}
                                    groupContent={panel.groupChildren?.map(
                                        (groupChild) => (
                                            <NavigationButton
                                                key={groupChild.key}
                                                active={
                                                    pathname === groupChild.href
                                                }
                                                href={groupChild.href}
                                                label={groupChild.label}
                                                icon={groupChild.icon}
                                                count={groupChild.count}
                                                resetPanelHistoryOnClick
                                            />
                                        )
                                    )}
                                    resetPanelHistoryOnClick
                                />
                            ))}
                        </Sidebar>
                    }
                    detail={
                        <Detail
                            bodyType="panel"
                            label={activePanelLabel}
                            body={children}
                        />
                    }
                    unSelected={
                        <Detail
                            bodyType="panel"
                            label="Admin Dashboard"
                            body={
                                <div className={styles.unselectedView}>
                                    <h2 className={styles.unselectedTitle}>
                                        Select a panel
                                    </h2>
                                    <p className={styles.unselectedDescription}>
                                        Choose a section from the left to open
                                        member, donor, contribution, role, or
                                        permission tools.
                                    </p>
                                </div>
                            }
                        />
                    }
                />
            </div>
        </ProtectedPage>
    )
}
