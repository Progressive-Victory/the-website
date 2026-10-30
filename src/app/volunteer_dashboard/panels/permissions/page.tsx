'use client'

import { MyPermissions, MyPermissionsSidebarItem } from './MyPermissions'
import styles from './page.module.css'
import { MobileSidebarBackButton } from '@/app/volunteer_dashboard/layout/MobileSidebarBackButton'
import {
    Form,
    FormGroup,
    FormState,
    TextField,
} from '@/components/common/forms'
import Panel from '@/components/common/panel/Panel'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import {
    SidebarListFilters,
    type SidebarListFiltersProps,
} from '@/components/common/panel/sidebar_list/SidebarList'
import { FetchError } from '@/models'
import { usePositionQueries } from '@/queries'
import { cn, parseErrorMessage } from '@/util'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Permission, zPermission } from 'pv-contracts/data'
import { SortDirection, UpdatePermissionRequest } from 'pv-contracts/requests'
import { PaginatedResponse } from 'pv-contracts/responses'
import { useState } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { IoEllipsisVertical } from 'react-icons/io5'

export default function Page() {
    const queryClient = useQueryClient()
    const { onPatch } = useFetch()
    const positionQueries = usePositionQueries()

    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null)
    const [featuredSelected, setFeaturedSelected] = useState(true)
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)

    const [formState, setFormState] = useState<FormState<Permission> | null>(
        null
    )

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch('/permissions', zPermission, {
        search: { sort: SortDirection.ASC },
    })

    const updateMutation = useMutation<
        Permission,
        FetchError,
        {
            id: number
            permission: Permission
            request: UpdatePermissionRequest
        },
        Permission | undefined
    >({
        mutationFn: ({ id, request }) =>
            onPatch('/permissions/:permissionId', request, zPermission, {
                params: { permissionId: id },
            }),
        onMutate: ({ id, permission }) => {
            const prev = searchQuery.data?.data?.find((prev) => prev.id == id)
            setSelectedPermission(permission)
            queryClient.setQueryData(
                ['/permissions', search],
                (res: PaginatedResponse<Permission>) => ({
                    ...res,
                    data: res.data.map((prev) =>
                        prev.id == permission.id ? permission : prev
                    ),
                })
            )
            return prev
        },
        onError: (error, _variables, prev) => {
            console.error(error)
            setSelectedPermission(prev ?? null)
            queryClient.setQueryData(
                [`/permissions`, search],
                (res: PaginatedResponse<Permission>) => ({
                    ...res,
                    data: res.data.map((permission) =>
                        permission.id == prev?.id ? prev : permission
                    ),
                })
            )
        },
        onSuccess: (data) => {
            setSelectedPermission(data)
            queryClient.setQueryData(
                [`/permissions`, search],
                (res: PaginatedResponse<Permission>) => ({
                    ...res,
                    data: res.data.map((permission) =>
                        permission.id == data.id ? data : permission
                    ),
                })
            )
        },
        onSettled: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['/permissions'] }),
                queryClient.invalidateQueries({
                    queryKey: ['positionHierarchy'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['/users/current'],
                }),
            ]),
    })

    const handleSelectItem = (value: Permission | null): boolean => {
        if (value && value.id === selectedPermission?.id) return true
        if (!value && featuredSelected) return true

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return false
        }

        setSelectedPermission(value)
        setFeaturedSelected(value === null)
        setFormState(null)
        return true
    }

    const handleSave = (permission: Permission) => {
        updateMutation.mutate({
            id: permission.id,
            permission,
            request: { name: permission.name },
        })
    }

    const permissions = [...(searchQuery.data?.data ?? [])].sort((a, b) =>
        search.sort === SortDirection.DESC ? b.id - a.id : a.id - b.id
    )
    const resultCount = searchQuery.data?.count

    const positionHierarchy = useQuery({
        queryKey: ['positionHierarchy'],
        queryFn: positionQueries.getPositionHierarchy,
        enabled: positionQueries.ready,
    })
    const assignedPositions = (positionHierarchy.data?.positions ?? [])
        .filter((position) =>
            position.permissions.some(
                (permission) => permission.id === selectedPermission?.id
            )
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    const sidebarFilters: SidebarListFiltersProps = {
        search,
        onSearch,
        showSort: true,
        showLimit: true,
    }

    return (
        <Panel
            includeSidebar
            largeTitle
            sidebarWidth="24rem"
            sidebarClassName={styles.sidebarBg}
            sidebarMobileVisible={sidebarMobileVisible}
            label="Permissions"
            showScrollbar={false}
            sidebarList={{
                search: { search, onSearch },
                footer: {
                    page: search.page ?? 0,
                    pageSize: search.limit ?? 25,
                    count: resultCount,
                    isPending: searchQuery.isPending,
                    onPageChange: (nextPage: number) =>
                        onSearch({ ...search, page: nextPage }),
                },
                filters: sidebarFilters,
            }}
            prominentHeaderButton={{
                icon: <IoEllipsisVertical size={20} />,
                menu: () => <SidebarListFilters {...sidebarFilters} />,
            }}
            sidebarBody={
                <>
                    <MyPermissionsSidebarItem
                        selected={featuredSelected}
                        onSelect={() => {
                            const selected = handleSelectItem(null)
                            if (selected) {
                                setSidebarMobileVisible(false)
                            }
                        }}
                    />
                    <SidebarBody<Permission>
                        items={permissions}
                        isLoading={searchQuery.isPending}
                        error={searchQuery.error}
                        selectedKey={selectedPermission?.id}
                        renderItem={(permission) => ({
                            key: permission.id,
                            label: permission.name,
                            href: `/volunteer_dashboard/panels/permissions?permissionId=${permission.id}`,
                            onClick: (event) => {
                                event.preventDefault()
                                const selected = handleSelectItem(permission)
                                if (selected) {
                                    setSidebarMobileVisible(false)
                                }
                            },
                        })}
                    />
                </>
            }
        >
            <div className={styles.detailPane}>
                <MobileSidebarBackButton
                    label="Permissions"
                    sidebarMobileVisible={sidebarMobileVisible}
                    onBack={() => setSidebarMobileVisible(true)}
                />
                {featuredSelected && <MyPermissions />}
                {selectedPermission && (
                    <Form<Permission>
                        key={selectedPermission.id}
                        form={selectedPermission}
                        title={selectedPermission.name}
                        saving={updateMutation.isPending}
                        onUpdate={setFormState}
                        onSave={handleSave}
                    >
                        <FormGroup
                            title="Details"
                            className={cn(
                                styles.permissionList,
                                styles.permissionCards
                            )}
                        >
                            <TextField label="Name" field="name" />
                            {/* # TODO: use the real field once the API adds permission descriptions. */}
                            <TextField<Permission>
                                label="Description"
                                getter={() => 'No description yet'}
                                readonlyClassName={styles.secondaryValue}
                                readonly
                            />
                            <div className={styles.cardBreak} />
                            <TextField<Permission>
                                label="ID"
                                getter={(permission) => String(permission.id)}
                                readonlyClassName={styles.secondaryValue}
                                readonly
                            />
                        </FormGroup>
                        <FormGroup
                            title="Positions"
                            className={styles.permissionList}
                        >
                            {positionHierarchy.isPending ? (
                                <div>
                                    <span className={styles.secondaryValue}>
                                        Loading positions...
                                    </span>
                                </div>
                            ) : positionHierarchy.error ? (
                                <div role="alert">
                                    <span className={styles.secondaryValue}>
                                        Error:{' '}
                                        {parseErrorMessage(
                                            positionHierarchy.error
                                        )}
                                    </span>
                                </div>
                            ) : assignedPositions.length === 0 ? (
                                <div>
                                    <span className={styles.secondaryValue}>
                                        No positions grant this permission
                                    </span>
                                </div>
                            ) : (
                                assignedPositions.map((position) => (
                                    <div
                                        key={position.id}
                                        className={styles.linkRow}
                                    >
                                        <Link
                                            href={`/volunteer_dashboard/panels/positions?positionId=${position.id}`}
                                            className={styles.rowLink}
                                        >
                                            <span>{position.name}</span>
                                            <FiChevronRight
                                                aria-hidden="true"
                                                className={
                                                    styles.secondaryValue
                                                }
                                            />
                                        </Link>
                                    </div>
                                ))
                            )}
                        </FormGroup>
                    </Form>
                )}
            </div>
        </Panel>
    )
}
