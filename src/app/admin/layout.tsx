'use client'

import styles from './admin.module.css'
import { ProtectedPage } from '@/components/ProtectedPage'
import { DiscordAvatar } from '@/components/common'
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
import { usePaginatedSearch, useCurrentUser } from '@/util/hooks'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { ReactElement, ReactNode } from 'react'
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
                    unSelected={renderAdminUnselectedDetail({
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

function renderAdminUnselectedDetail({
    currentUserName,
    currentUserHandle,
    currentUserDiscordId,
    currentUserDiscordImage,
    userCount,
    donorCount,
    contributionCount,
    roleCount,
    permissionCount,
}: {
    currentUserName?: string
    currentUserHandle?: string
    currentUserDiscordId?: string
    currentUserDiscordImage?: string
    userCount?: number
    donorCount?: number
    contributionCount?: number
    roleCount?: number
    permissionCount?: number
}): ReactElement {
    return (
        <Detail
            bodyType="blank"
            body={
                <div className={styles.unselectedView}>
                    <div className={styles.unselectedProfileHeader}>
                        <DiscordAvatar
                            discordUserId={currentUserDiscordId}
                            imageId={currentUserDiscordImage}
                            size={132}
                            className={styles.unselectedAvatar}
                        />
                        <div className={styles.unselectedNameSlot}>
                            <div className={styles.unselectedWelcome}>
                                Welcome back,
                            </div>
                            <h2 className={styles.unselectedProfileName}>
                                {(currentUserName?.trim()
                                    ? currentUserName
                                    : undefined) ??
                                    (currentUserHandle
                                        ? `@${currentUserHandle}`
                                        : 'Admin User')}
                            </h2>
                            {currentUserHandle ? (
                                <div className={styles.unselectedProfileHandle}>
                                    @{currentUserHandle}
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className={styles.unselectedGrid}>
                        <NavigationButton
                            label="Members"
                            description="Member accounts and profiles."
                            href="/admin/panels/members"
                            icon={FaUsers}
                            count={userCount}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Fundraising"
                            description="Donors, contributions, and fundraising stats."
                            href="/admin/panels/fundraising"
                            icon={FaDonate}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Donors"
                            description="ActBlue donors, totals, and records."
                            href="/admin/panels/donors"
                            icon={FaDonate}
                            count={donorCount}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Contributions"
                            description="Contribution lineitems and payment info."
                            href="/admin/panels/contributions"
                            icon={FaDollarSign}
                            count={contributionCount}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Roles"
                            description="User roles and access levels."
                            href="/admin/panels/roles"
                            icon={FaUserTag}
                            count={roleCount}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Permissions"
                            description="Granular permission definitions."
                            href="/admin/panels/permissions"
                            icon={FaUserShield}
                            count={permissionCount}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Positions"
                            description="Staff and volunteer position records."
                            href="/admin/panels/positions"
                            icon={FaClipboardUser}
                            count={0}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                    </div>
                </div>
            }
        />
    )
}
