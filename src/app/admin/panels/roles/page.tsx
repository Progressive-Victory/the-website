'use client'

import styles from './page.module.css'
import { MultiSelectOption } from '@/components/common'
import {
    Form,
    FormGroup,
    FormState,
    SelectManyField,
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
import { Permission, Role, zPermission, zRole } from '@/contracts/data'
import { SortDirection, UpdateRoleRequest } from '@/contracts/requests'
import { PaginatedResponse } from '@/contracts/responses'
import { FetchError } from '@/models'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export default function Page() {
    const queryClient = useQueryClient()
    const { ready, onGet, onPatch } = useFetch()

    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [formState, setFormState] = useState<FormState<Role> | null>(null)
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch<Role>('/roles', zRole)

    const { query: permissionsQuery } = usePaginatedSearch<Permission>(
        '/permissions',
        zPermission,
        { search: { limit: 50, sort: SortDirection.DESC }, all: true }
    )

    const permissions = permissionsQuery.data?.data ?? []
    const permissionOptions = useMemo(
        () =>
            (permissionsQuery.data?.data ?? []).map((permission) => ({
                value: permission.id,
                label: permission.name,
            })),
        [permissionsQuery.data]
    )

    const roleQuery = useQuery({
        queryKey: [`/roles/${selectedId}`],
        queryFn:
            ready && selectedId != null
                ? () => onGet<Role>(`/roles/${selectedId}`, zRole)
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const updateMutation = useMutation<
        Role,
        FetchError,
        { id: number; role: Role; request: UpdateRoleRequest },
        Role | undefined
    >({
        mutationFn: ({ id, request }) =>
            onPatch<Role>(`/roles/${id}`, request, zRole),
        // When the mutation begins, optimistically update the cache to use the new state
        onMutate: ({ id, role }) => {
            const prev: Role | undefined = queryClient.getQueryData([
                `/roles/${id}`,
            ])
            queryClient.setQueryData([`/roles/${id}`], role)
            queryClient.setQueryData(
                ['/roles', search],
                (res: PaginatedResponse<Role>) => ({
                    ...res,
                    data: res.data.map((prev) =>
                        prev.id == role.id ? role : prev
                    ),
                })
            )
            return prev
        },
        // If an error occurs, rollback to the previous state
        onError: (error, { id }, prev) => {
            console.error(error)
            queryClient.setQueryData([`/roles/${id}`], prev)
            queryClient.setQueryData(
                [`/roles`, search],
                (res: PaginatedResponse<Role>) => ({
                    ...res,
                    data: res.data.map((role) =>
                        role.id == prev?.id ? prev : role
                    ),
                })
            )
        },
        // On success, update the cache to the returned value in case there are any discrepancies
        onSuccess: (data, { id }) => {
            queryClient.setQueryData([`/roles/${id}`], data)
            queryClient.setQueryData(
                [`/roles`, search],
                (res: PaginatedResponse<Role>) => ({
                    ...res,
                    data: res.data.map((role) =>
                        role.id == data.id ? data : role
                    ),
                })
            )
        },
        // After either success or failure, invalidate the caches to refresh from the server
        onSettled: (_data, _error, { id }) =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['/roles', search] }),
                queryClient.invalidateQueries({
                    queryKey: [`/roles/${id}`],
                }),
            ]),
    })

    const handleSelectItem = (value: Role) => {
        if (value.id === selectedId) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedId(value.id)
    }

    const handleSave = (role: Role) => {
        updateMutation.mutate({
            id: role.id,
            role,
            request: {
                name: role.name,
                permissionIds: role.permissions?.map(
                    (permission) => permission.id
                ),
            },
        })
    }

    const roles = searchQuery.data?.data ?? []
    const resultCount = searchQuery.data?.count

    const filterOptions = useMemo<FilterOption[]>(
        () => [
            {
                value: 'permissionIds',
                label: 'Permissions',
                options: permissionOptions,
            },
        ],
        [permissionOptions]
    )

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
                            <Sidebar.Title large>Roles</Sidebar.Title>
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
                                        options={filterOptions}
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
                                    Error: {searchQuery.error.message}
                                </div>
                            ) : roles.length === 0 ? (
                                <div className={styles.sidebarState}>
                                    No items found
                                </div>
                            ) : (
                                roles.map((role) => (
                                    <Nav.Item
                                        key={role.id}
                                        active={selectedId === role.id}
                                        href={`/admin/panels/roles?roleId=${role.id}`}
                                        label={role.name}
                                        showIndicator={false}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            handleSelectItem(role)
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
                                        Roles
                                    </button>
                                ) : null}
                                {selectedId == null && (
                                    <div className={styles.emptyState}>
                                        No role selected
                                    </div>
                                )}
                                {selectedId != null && roleQuery.isPending && (
                                    <div className={styles.emptyState}>
                                        Loading role details...
                                    </div>
                                )}
                                {selectedId != null && roleQuery.error && (
                                    <div
                                        className={styles.emptyState}
                                        style={{ color: '#ef4444' }}
                                    >
                                        Error: {roleQuery.error.message}
                                    </div>
                                )}
                                {selectedId != null && roleQuery.data ? (
                                    <Form<Role>
                                        key={selectedId}
                                        form={roleQuery.data}
                                        title={roleQuery.data.name}
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
                                            <SelectManyField<Role>
                                                label="Permissions"
                                                options={permissionOptions}
                                                getter={(form) =>
                                                    (
                                                        form.permissions ?? []
                                                    ).map(
                                                        (permission) =>
                                                            permission.id
                                                    )
                                                }
                                                setter={(form, field) => ({
                                                    ...form,
                                                    permissions:
                                                        field != null
                                                            ? permissions.filter(
                                                                  (
                                                                      permission
                                                                  ) =>
                                                                      field.includes(
                                                                          permission.id
                                                                      )
                                                              )
                                                            : form.permissions,
                                                })}
                                            />
                                        </FormGroup>
                                    </Form>
                                ) : (
                                    <div className={styles.emptyState}>
                                        No role selected
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

interface FilterOption {
    value: string
    label: string
    options: MultiSelectOption[]
}
