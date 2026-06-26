'use client'

import { renderAdminUnselectedDetail } from './admin'
import styles from './admin.module.css'
import { ProtectedPage } from '@/components/ProtectedPage'
import { DiscordAvatar } from '@/components/common'
import { Nav } from '@/components/common/nav'
import {
    SplitView,
    Sidebar,
    clearPanelHistory,
} from '@/components/common/split_view'
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
import type { ReactNode } from 'react'
import { FaDonate, FaUserShield, FaUserTag, FaUsers } from 'react-icons/fa'
import { FaClipboardUser, FaDollarSign, FaFlask } from 'react-icons/fa6'
import type { IconType } from 'react-icons/lib'
import { useMediaQuery } from 'usehooks-ts'

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
    const isDesktop = useMediaQuery('(min-width: 64rem)')
    const showWelcome =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('from') === 'welcome'
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

    const isPanelSelected = pathname.startsWith('/admin/panels/')

    const discordUser = currentUser.data?.discordUsers?.[0]
    const accountName =
        `${currentUser.data?.firstName ?? ''} ${currentUser.data?.lastName ?? ''}`.trim() ||
        (discordUser?.username ? `@${discordUser.username}` : 'Admin User')
    const accountHref = isDesktop ? '/admin' : '/admin/panels/members'

    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <div className={styles.root}>
                <Header />

                <SplitView
                    className={styles.navigationStack}
                    selected={isPanelSelected}
                >
                    <SplitView.Sidebar>
                        <Sidebar
                            className={styles.sidebar}
                            variant="minimal"
                            selectionIndicator
                        >
                            <Sidebar.Featured>
                                <Nav.Account
                                    href={accountHref}
                                    avatar={
                                        <DiscordAvatar
                                            discordUserId={discordUser?.id}
                                            imageId={discordUser?.image}
                                            size={40}
                                        />
                                    }
                                    name={accountName}
                                    subtitle={
                                        discordUser?.username
                                            ? `@${discordUser.username}`
                                            : undefined
                                    }
                                    onClick={() => {
                                        if (!isDesktop) {
                                            clearPanelHistory()
                                        }
                                    }}
                                />
                            </Sidebar.Featured>

                            <Sidebar.List selectionIndicator>
                                {adminPanelConfig.map((panel) =>
                                    panel.buttonType === 'group' ? (
                                        <Nav.Group
                                            key={panel.key}
                                            label={panel.label}
                                            icon={panel.icon}
                                            count={panel.count}
                                            hasActiveChild={Boolean(
                                                panel.groupChildren?.some(
                                                    (groupChild) =>
                                                        pathname ===
                                                        groupChild.href
                                                )
                                            )}
                                        >
                                            {panel.groupChildren?.map(
                                                (groupChild) => (
                                                    <Nav.Item
                                                        key={groupChild.key}
                                                        active={
                                                            pathname ===
                                                            groupChild.href
                                                        }
                                                        href={groupChild.href}
                                                        label={groupChild.label}
                                                        icon={groupChild.icon}
                                                        count={groupChild.count}
                                                        onClick={
                                                            clearPanelHistory
                                                        }
                                                    />
                                                )
                                            )}
                                        </Nav.Group>
                                    ) : (
                                        <Nav.Item
                                            key={panel.key}
                                            active={pathname === panel.href}
                                            href={panel.href}
                                            label={panel.label}
                                            icon={panel.icon}
                                            count={panel.count}
                                            onClick={clearPanelHistory}
                                        />
                                    )
                                )}
                            </Sidebar.List>
                        </Sidebar>
                    </SplitView.Sidebar>

                    <SplitView.Detail>
                        {isPanelSelected
                            ? children
                            : renderAdminUnselectedDetail({
                                  showWelcome,
                                  currentUserName:
                                      `${currentUser.data?.firstName ?? ''} ${currentUser.data?.lastName ?? ''}`.trim(),
                                  currentUserHandle: discordUser?.username,
                                  currentUserDiscordId: discordUser?.id,
                                  currentUserDiscordImage: discordUser?.image,
                                  userCount: users.query.data?.count,
                                  donorCount: donors.query.data?.count,
                                  contributionCount:
                                      contributions.query.data?.count,
                                  roleCount: roles.query.data?.count,
                                  permissionCount:
                                      permissions.query.data?.count,
                              })}
                    </SplitView.Detail>
                </SplitView>
            </div>
        </ProtectedPage>
    )
}
