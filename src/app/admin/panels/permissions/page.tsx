'use client'

import styles from './page.module.css'
import {
    Form,
    FormGroup,
    FormState,
    TextField,
} from '@/components/common/forms'
import { Nav } from '@/components/common/nav'
import {
    Detail,
    List,
    Sidebar,
    SplitView,
} from '@/components/common/split_view'
import card from '@/components/common/split_view/panelCard.module.css'
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
        <div className={card.card}>
            <SplitView selected={isDesktop || !sidebarMobileVisible}>
                <SplitView.Sidebar>
                    <Sidebar
                        variant="prominent"
                        largeTitle
                        className={styles.sidebarBg}
                    >
                        <Sidebar.Header>
                            <Sidebar.Title large>Permissions</Sidebar.Title>
                            <Sidebar.Search>
                                <List.Search
                                    search={search}
                                    onSearch={onSearch}
                                />
                            </Sidebar.Search>
                            <Sidebar.Actions slot="right">
                                <Sidebar.FilterButton>
                                    <List.Filters
                                        search={search}
                                        onSearch={onSearch}
                                        showSort
                                        showLimit
                                    />
                                </Sidebar.FilterButton>
                            </Sidebar.Actions>
                        </Sidebar.Header>

                        <Sidebar.List>
                            {searchQuery.isPending ? (
                                <div className={styles.sidebarState}>
                                    Loading...
                                </div>
                            ) : searchQuery.error ? (
                                <div
                                    className={styles.sidebarState}
                                    style={{ color: '#ef4444' }}
                                >
                                    Error loading permissions
                                </div>
                            ) : permissions.length === 0 ? (
                                <div className={styles.sidebarState}>
                                    No items found
                                </div>
                            ) : (
                                permissions.map((permission) => (
                                    <Nav.Item
                                        key={permission.id}
                                        active={
                                            selectedPermission?.id ===
                                            permission.id
                                        }
                                        href={`/admin/panels/permissions?permissionId=${permission.id}`}
                                        label={permission.name}
                                        showIndicator={false}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            setSelectedPermission(permission)
                                            if (!isDesktop) {
                                                setSidebarMobileVisible(false)
                                            }
                                        }}
                                    />
                                ))
                            )}
                        </Sidebar.List>

                        <Sidebar.Footer>
                            <List.Footer
                                page={search.page ?? 0}
                                pageSize={search.limit ?? 25}
                                count={resultCount}
                                isPending={searchQuery.isPending}
                                onPageChange={(nextPage) =>
                                    onSearch({ ...search, page: nextPage })
                                }
                            />
                        </Sidebar.Footer>
                    </Sidebar>
                </SplitView.Sidebar>

                <SplitView.Detail>
                    <Detail>
                        <Detail.Body>
                            <div className={styles.detailPane}>
                                {!isDesktop && !sidebarMobileVisible ? (
                                    <button
                                        className={styles.mobileBackButton}
                                        onClick={() =>
                                            setSidebarMobileVisible(true)
                                        }
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
                                            <TextField
                                                label="Name"
                                                field="name"
                                                required
                                            />
                                        </FormGroup>
                                    </Form>
                                ) : (
                                    <div className={styles.emptyState}>
                                        No permission selected
                                    </div>
                                )}
                            </div>
                        </Detail.Body>
                    </Detail>
                </SplitView.Detail>
            </SplitView>
        </div>
    )
}
