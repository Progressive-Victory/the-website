'use client'

import { renderVolunteerDashboardUnselectedDetail } from './home'
import styles from './page.module.css'
import { ProtectedPage } from '@/components/ProtectedPage'
import { DiscordAvatar } from '@/components/common/DiscordAvatar'
import { NavigationStack } from '@/components/common/navigation_stack/NavigationStack'
import { Detail } from '@/components/common/navigation_stack/detail/Detail'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import { Sidebar } from '@/components/common/navigation_stack/sidebar/Sidebar'
import { Header } from '@/components/layout/Header'
import {
    zActBlueDonationPacket,
    zActBlueDonor,
    zPermission,
    zRole,
    zUser,
} from '@/contracts/data'
import { usePositionQueries } from '@/queries'
import { usePaginatedSearch, useCurrentUser } from '@/util/hooks'
import { useQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { FaDonate, FaUserShield, FaUserTag, FaUsers } from 'react-icons/fa'
import { FaClipboardUser, FaDollarSign } from 'react-icons/fa6'
import type { IconType } from 'react-icons/lib'
import { useMediaQuery } from 'usehooks-ts'

interface DashboardGroupChildConfigItem {
    key: string
    label: string
    href: `/volunteer_dashboard/panels/${string}`
    icon?: IconType
    count?: number
}

interface DashboardPanelConfigItem {
    href: `/volunteer_dashboard/panels/${string}`
    key: string
    label: string
    icon: IconType
    count?: number
    buttonType?: 'default' | 'group'
    groupChildren?: DashboardGroupChildConfigItem[]
}

export default function Layout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const previousPathnameRef = useRef(pathname)
    const positionQueries = usePositionQueries()
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
    const positionHierarchy = useQuery({
        queryKey: ['positionHierarchy'],
        queryFn: positionQueries.getPositionHierarchy,
        enabled: positionQueries.ready,
    })

    const positionCount = positionHierarchy.data?.positions?.length

    const currentUser = useCurrentUser()
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const discordUser = currentUser.data?.discordUsers?.[0]
    const displayName =
        `${currentUser.data?.firstName ?? ''} ${currentUser.data?.lastName ?? ''}`.trim() ||
        (discordUser?.username ? `@${discordUser.username}` : 'User')

    const dashboardPanelConfig: DashboardPanelConfigItem[] = [
        {
            key: 'members',
            label: 'Members',
            href: '/volunteer_dashboard/panels/members',
            icon: FaUsers,
            count: users.query.data?.count,
        },
        {
            key: 'fundraising',
            label: 'Fundraising',
            href: '/volunteer_dashboard/panels/fundraising',
            icon: FaDonate,
            buttonType: 'group',
            groupChildren: [
                {
                    key: 'donors',
                    label: 'Donors',
                    href: '/volunteer_dashboard/panels/donors',
                    icon: FaDonate,
                    count: donors.query.data?.count,
                },
                {
                    key: 'contributions',
                    label: 'Contributions',
                    href: '/volunteer_dashboard/panels/contributions',
                    icon: FaDollarSign,
                    count: contributions.query.data?.count,
                },
            ],
        },
        {
            key: 'positions',
            label: 'Positions',
            href: '/volunteer_dashboard/panels/positions',
            icon: FaClipboardUser,
            count: positionCount,
        },
        {
            key: 'roles',
            label: 'Roles',
            href: '/volunteer_dashboard/panels/roles',
            icon: FaUserTag,
            count: roles.query.data?.count,
        },
        {
            key: 'permissions',
            label: 'Permissions',
            href: '/volunteer_dashboard/panels/permissions',
            icon: FaUserShield,
            count: permissions.query.data?.count,
        },
    ]

    useEffect(() => {
        previousPathnameRef.current = pathname
    }, [pathname])

    const currentTopLevelIndex = dashboardPanelConfig.findIndex(
        (panel) => panel.href === pathname
    )
    const previousTopLevelIndex = dashboardPanelConfig.findIndex(
        (panel) => panel.href === previousPathname
    )

    const activePanelLabel = dashboardPanelConfig
        .flatMap((panel) => [
            { href: panel.href, label: panel.label },
            ...(panel.groupChildren ?? []).map((groupChild) => ({
                href: groupChild.href,
                label: groupChild.label,
            })),
        ])
        .find((panel) => panel.href === pathname)?.label

    const isPanelSelected = pathname.startsWith('/volunteer_dashboard/panels/')

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
                            variant="minimal"
                            showScrollbar={false}
                            showSelectionIndicator
                            label="Volunteer Dashboard"
                            featured={
                                <NavigationButton
                                    buttonType="account"
                                    href={
                                        isDesktop
                                            ? '/volunteer_dashboard'
                                            : '/volunteer_dashboard/panels/members'
                                    }
                                    icon={
                                        <DiscordAvatar
                                            discordUserId={discordUser?.id}
                                            imageId={discordUser?.image}
                                            size={40}
                                        />
                                    }
                                    label={displayName}
                                    resetPanelHistoryOnClick={!isDesktop}
                                    subtitle={
                                        discordUser?.username
                                            ? `@${discordUser.username}`
                                            : undefined
                                    }
                                />
                            }
                        >
                            {dashboardPanelConfig.map((panel) => (
                                <NavigationButton
                                    key={panel.key}
                                    active={pathname === panel.href}
                                    href={panel.href}
                                    label={panel.label}
                                    icon={panel.icon}
                                    tag={{ count: panel.count }}
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
                                                tag={{
                                                    count: groupChild.count,
                                                }}
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
                    unselected={renderVolunteerDashboardUnselectedDetail({
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
                        positionCount,
                    })}
                />
            </div>
        </ProtectedPage>
    )
}
