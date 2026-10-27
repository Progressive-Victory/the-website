'use client'

import styles from './page.module.css'
import { Form, FormGroup, TextField } from '@/components/common/forms'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import { parseErrorMessage } from '@/util'
import { usePaginatedSearch } from '@/util/hooks'
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
                label: 'All Permissions',
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
    const { query } = usePaginatedSearch('/permissions', zPermission, {
        all: true,
        search: { sort: SortDirection.ASC, limit: 100 },
    })

    if (query.isPending)
        return <div className={styles.emptyState}>Loading permissions...</div>

    if (query.error)
        return (
            <div className={styles.emptyState}>
                Error: {parseErrorMessage(query.error)}
            </div>
        )

    return (
        // # TODO awaiting API update to include permission descriptions field.
        <Form form={query.data?.data ?? []} title="All Permissions" readonly>
            <FormGroup title="Permissions">
                {query.data?.data.map((permission) => (
                    <TextField
                        key={permission.id}
                        label={permission.name}
                        getter={() => 'No Description'}
                    />
                ))}
            </FormGroup>
        </Form>
    )
}
