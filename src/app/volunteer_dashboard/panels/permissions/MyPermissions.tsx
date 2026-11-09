'use client'

import styles from './page.module.css'
import { Form } from '@/components/common/forms'
import { List, ToggleRow } from '@/components/common/list'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import { parseErrorMessage } from '@/util'
import { useCurrentUser, usePaginatedSearch } from '@/util/hooks'
import { zPermission } from 'pv-contracts/data'
import { SortDirection } from 'pv-contracts/requests'
import { FaUserShield } from 'react-icons/fa'

interface MyPermissionsSidebarItemProps {
    selected: boolean
    onSelect: () => void
}

export function MyPermissionsSidebarItem({
    selected,
    onSelect,
}: MyPermissionsSidebarItemProps) {
    return (
        <SidebarBody<string>
            items={[]}
            pinnedItems={['featured']}
            selectedKey={selected ? 'featured' : null}
            renderItem={(key) => ({
                key,
                label: 'My Permissions',
                icon: (
                    <FaUserShield className={styles.featuredIcon} size={40} />
                ),
                href: '/volunteer_dashboard/panels/permissions',
                onClick: (event) => {
                    event.preventDefault()
                    onSelect()
                },
            })}
        />
    )
}

export function MyPermissions() {
    const currentUser = useCurrentUser()
    const { query } = usePaginatedSearch('/permissions', zPermission, {
        all: true,
        search: { sort: SortDirection.ASC, limit: 100 },
    })

    if (query.isPending || currentUser.isLoading)
        return <div className={styles.emptyState}>Loading permissions...</div>

    const error = query.error ?? currentUser.error
    if (error)
        return (
            <div className={styles.emptyState}>
                Error: {parseErrorMessage(error)}
            </div>
        )

    if (!currentUser.data)
        return <div className={styles.emptyState}>Loading permissions...</div>

    const grantedPermissionIds = new Set(
        currentUser.data.positions?.flatMap((position) =>
            position.permissions.map((permission) => permission.id)
        ) ?? []
    )
    const permissions = [...(query.data?.data ?? [])].sort(
        (a, b) => a.id - b.id
    )

    return (
        <Form form={permissions} title="My Permissions" readonly>
            <List title="Permissions">
                {permissions.map((permission) => (
                    <ToggleRow
                        key={permission.id}
                        label={permission.name}
                        value={grantedPermissionIds.has(permission.id)}
                        readOnly
                    />
                ))}
            </List>
        </Form>
    )
}
