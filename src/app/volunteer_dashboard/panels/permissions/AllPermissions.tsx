'use client'

import styles from './page.module.css'
import { Form, FormGroup, TextField } from '@/components/common/forms'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import { cn, parseErrorMessage } from '@/util'
import { useCurrentUser, usePaginatedSearch } from '@/util/hooks'
import { zPermission } from 'pv-contracts/data'
import { SortDirection } from 'pv-contracts/requests'
import { FaUserShield } from 'react-icons/fa'

interface AllPermissionsSidebarItemProps {
    selected: boolean
    onSelect: () => void
}

export function AllPermissionsSidebarItem({
    selected,
    onSelect,
}: AllPermissionsSidebarItemProps) {
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

export function AllPermissions() {
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
