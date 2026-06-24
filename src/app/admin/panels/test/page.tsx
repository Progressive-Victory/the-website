'use client'

import styles from './page.module.css'
import { MultiSelectOption } from '@/components/common'
import {
    Form,
    FormGroup,
    FormState,
    TextField,
} from '@/components/common/forms'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import Panel from '@/components/common/panel/Panel'
import { Permission, zPermission } from '@/contracts/data'
import { UpdatePermissionRequest } from '@/contracts/requests'
import { PaginatedResponse } from '@/contracts/responses'
import { FetchError } from '@/models'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export default function Page() {
    const queryClient = useQueryClient()
    const { onPatch } = useFetch()

    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null)
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

    const [, setFormState] = useState<FormState<Permission> | null>(null)

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch<Permission>('/permissions', zPermission)

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
            onPatch<Permission>(`/permissions/${id}`, request, zPermission),
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
            queryClient.invalidateQueries({
                queryKey: ['/permissions', search],
            }),
    })

    const handleSave = (permission: Permission) => {
        updateMutation.mutate({
            id: permission.id,
            permission,
            request: { name: permission.name },
        })
    }

    const permissions = searchQuery.data?.data ?? []
    const resultCount = searchQuery.data?.count

    return (
        <Panel
            includeSidebar
            largeTitle
            includeHeader
            sidebarWidth="24rem"
            sidebarClassName={styles.sidebarBg}
            sidebarMobileVisible={isDesktop || sidebarMobileVisible}
            label="Test"
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
                filters: {
                    search,
                    onSearch,
                    options: FILTER_OPTIONS,
                    searchFieldOptions: FIELD_OPTIONS,
                    sortFieldOptions: FIELD_OPTIONS,
                },
            }}
            sidebarBody={
                <>
                    {permissions.map((permission) => (
                        <NavigationButton
                            key={permission.id}
                            active={selectedPermission?.id === permission.id}
                            href={`/admin/panels/test?permissionId=${permission.id}`}
                            label={permission.name}
                            onClick={(event) => {
                                event.preventDefault()
                                setSelectedPermission(permission)
                                if (!isDesktop) {
                                    setSidebarMobileVisible(false)
                                }
                            }}
                            showIndicator={false}
                            className={styles.permissionNavigationButton}
                        />
                    ))}
                </>
            }
        >
            <div className={styles.detailPane}>
                {!isDesktop && !sidebarMobileVisible ? (
                    <button
                        className={styles.mobileBackButton}
                        onClick={() => setSidebarMobileVisible(true)}
                        type="button"
                    >
                        Permissions
                    </button>
                ) : null}
                {selectedPermission ? (
                    <Form<Permission>
                        key={selectedPermission.id}
                        form={selectedPermission}
                        title={selectedPermission.name}
                        saving={updateMutation.isPending}
                        onUpdate={setFormState}
                        onSave={handleSave}
                    >
                        <FormGroup title="Details">
                            <TextField label="Name" field="name" required />
                        </FormGroup>
                    </Form>
                ) : (
                    <div className={styles.emptyState}>
                        No permission selected
                    </div>
                )}
            </div>
        </Panel>
    )
}

interface FilterOption {
    value: string
    label: string
    options: MultiSelectOption[]
}

interface FieldOption {
    value: string
    label: string
}

const FIELD_OPTIONS: FieldOption[] = [
    { value: 'id', label: 'ID' },
    { value: 'name', label: 'Name' },
]

const FILTER_OPTIONS: FilterOption[] = [
    {
        value: 'category',
        label: 'Category',
        options: [
            { value: 'read', label: 'Read' },
            { value: 'write', label: 'Write' },
            { value: 'admin', label: 'Admin' },
        ],
    },
    {
        value: 'scope',
        label: 'Scope',
        options: [
            { value: 'global', label: 'Global' },
            { value: 'team', label: 'Team' },
            { value: 'personal', label: 'Personal' },
        ],
    },
]
