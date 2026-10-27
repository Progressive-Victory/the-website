'use client'

import styles from './page.module.css'
import { Form, FormGroup, TextField } from '@/components/common/forms'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import { usePositionQueries } from '@/queries'
import { cn, parseErrorMessage } from '@/util'
import { useCurrentUser, usePaginatedSearch } from '@/util/hooks'
import { useQuery } from '@tanstack/react-query'
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
    const positionQueries = usePositionQueries()
    const positionHierarchy = useQuery({
        queryKey: ['positionHierarchy'],
        queryFn: positionQueries.getPositionHierarchy,
        enabled: positionQueries.ready,
    })
    const { query } = usePaginatedSearch('/permissions', zPermission, {
        all: true,
        search: { sort: SortDirection.ASC, limit: 100 },
    })

    if (query.isPending || currentUser.isLoading || positionHierarchy.isPending)
        return <div className={styles.emptyState}>Loading permissions...</div>

    const error = query.error ?? currentUser.error ?? positionHierarchy.error
    if (error)
        return (
            <div className={styles.emptyState}>
                Error: {parseErrorMessage(error)}
            </div>
        )

    if (!currentUser.data)
        return <div className={styles.emptyState}>Loading permissions...</div>

    const userId = currentUser.data.id
    const grantedPermissionIds = new Set(
        positionHierarchy.data?.positions
            .filter((position) => position.userIds.includes(userId))
            .flatMap((position) =>
                position.permissions.map((permission) => permission.id)
            ) ?? []
    )

    return (
        <Form form={query.data?.data ?? []} title="My Permissions" readonly>
            <FormGroup title="Permissions" className={styles.permissionList}>
                {query.data?.data.map((permission) => (
                    <TextField
                        key={permission.id}
                        label={permission.name}
                        getter={() =>
                            grantedPermissionIds.has(permission.id)
                                ? 'Yes'
                                : 'No'
                        }
                        readonlyClassName={cn(
                            styles.permissionStatus,
                            grantedPermissionIds.has(permission.id) &&
                                styles.permissionStatusEnabled
                        )}
                    />
                ))}
            </FormGroup>
        </Form>
    )
}
