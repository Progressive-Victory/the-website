'use client'

import { renderAdminUnselectedDetail } from './admin'
import styles from './admin.module.css'
import { ProtectedPage } from '@/components/ProtectedPage'
import { NavigationStack } from '@/components/common/navigation_stack/NavigationStack'
import { Detail } from '@/components/common/navigation_stack/detail/Detail'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import {
    Sidebar,
    SidebarFeatured,
} from '@/components/common/navigation_stack/sidebar/Sidebar'
import { Header } from '@/components/layout/Header'
import {
    zActBlueDonationPacket,
    zPermission,
    zRole,
    zUser,
} from '@/contracts/data'
import { zActBlueDonor } from '@/contracts/data/ActBlueDonor'
import { usePaginatedSearch, useCurrentUser } from '@/util/hooks'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { FaDonate, FaUserShield, FaUserTag, FaUsers } from 'react-icons/fa'
import { FaClipboardUser, FaDollarSign, FaFlask } from 'react-icons/fa6'
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
    const showWelcomeRef = useRef(
        typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('from') ===
                'welcome'
    )
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
    const currentUser = useCurrentUser()

    const adminPanelConfig: AdminPanelConfigItem[] = [
        {
            key: 'members',
            label: 'Members',
            href: '/admin/panels/members',
            icon: FaUsers,
            count: users.query.data?.count,
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
            key: 'test',
            label: 'Test',
            href: '/admin/panels/test',
            icon: FaUserShield,
            count: permissions.query.data?.count,
        },
        {
            key: 'test_grouped',
            label: 'Test Grouped',
            href: '/admin/panels/test_grouped',
            icon: FaFlask,
            buttonType: 'group',
            groupChildren: [
                {
                    key: 'test-1',
                    label: 'Test 1',
                    href: '/admin/panels/test-1',
                    icon: FaFlask,
                },
                {
                    key: 'test-2',
                    label: 'Test 2',
                    href: '/admin/panels/test-2',
                    icon: FaFlask,
                },
                {
                    key: 'test-3',
                    label: 'Test 3',
                    href: '/admin/panels/test-3',
                    icon: FaFlask,
                },
                {
                    key: 'test-4',
                    label: 'Test 4',
                    href: '/admin/panels/test-4',
                    icon: FaFlask,
                },
                {
                    key: 'test-5',
                    label: 'Test 5',
                    href: '/admin/panels/test-5',
                    icon: FaFlask,
                },
                {
                    key: 'test-6',
                    label: 'Test 6',
                    href: '/admin/panels/test-6',
                    icon: FaFlask,
                },
                {
                    key: 'test-7',
                    label: 'Test 7',
                    href: '/admin/panels/test-7',
                    icon: FaFlask,
                },
                {
                    key: 'test-8',
                    label: 'Test 8',
                    href: '/admin/panels/test-8',
                    icon: FaFlask,
                },
                {
                    key: 'test-9',
                    label: 'Test 9',
                    href: '/admin/panels/test-9',
                    icon: FaFlask,
                },
                {
                    key: 'test-10',
                    label: 'Test 10',
                    href: '/admin/panels/test-10',
                    icon: FaFlask,
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
                            sidebarStyle="minimal"
                            showScrollbar={false}
                            showSelectionIndicator
                            featured={<SidebarFeatured />}
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
                    unSelected={renderAdminUnselectedDetail({
                        showWelcome: showWelcomeRef.current,
                        currentUserName:
                            `${currentUser.data?.firstName ?? ''} ${currentUser.data?.lastName ?? ''}`.trim(),
                        currentUserHandle:
                            currentUser.data?.discordUsers?.[0]?.username,
                        currentUserDiscordId:
                            currentUser.data?.discordUsers?.[0]?.id,
                        currentUserDiscordImage:
                            currentUser.data?.discordUsers?.[0]?.image,
                        userCount: users.query.data?.count,
                        donorCount: donors.query.data?.count,
                        contributionCount: contributions.query.data?.count,
                        roleCount: roles.query.data?.count,
                        permissionCount: permissions.query.data?.count,
                    })}
                />
            </div>
        </ProtectedPage>
    )
}
