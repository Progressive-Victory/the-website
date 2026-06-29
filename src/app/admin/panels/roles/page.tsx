'use client'

import styles from './page.module.css'
import { ListElement, List } from '@/app/admin/layout/List'
import {
    Form,
    FormGroup,
    FormState,
    SelectManyField,
    TextField,
} from '@/components/common/forms'
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
import { useMemo, useState } from 'react'

export default function Page() {
    const queryClient = useQueryClient()
    const { ready, onGet, onPatch } = useFetch()

    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [formState, setFormState] = useState<FormState<Role> | null>(null)

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

    return (
        <>
            <List
                search={search}
                count={searchQuery.data?.count}
                isPending={searchQuery.isPending}
                error={searchQuery.error}
                filters={[
                    {
                        value: 'permissionIds',
                        label: 'Permissions',
                        options: permissions.map((permission) => ({
                            value: permission.id,
                            label: permission.name,
                        })),
                    },
                ]}
                onSearch={onSearch}
            >
                {searchQuery.data?.data?.map((item) => (
                    <ListElement
                        key={item.id}
                        selected={selectedId == item.id}
                        onClick={() => handleSelectItem(item)}
                    >
                        <span className={styles.roleListItemName}>
                            {item.name}
                        </span>
                    </ListElement>
                ))}
            </List>

            <div className={styles.rightPane}>
                {selectedId == null && (
                    <div className={styles.emptyState}>No role selected</div>
                )}
                {selectedId != null && roleQuery.data && (
                    <Form<Role>
                        key={selectedId}
                        form={roleQuery.data}
                        title={roleQuery.data.name}
                        saving={updateMutation.isPending}
                        onUpdate={setFormState}
                        onSave={handleSave}
                    >
                        <FormGroup title="Details">
                            <TextField label="Name" field="name" required />
                            <SelectManyField<Role>
                                label="Permissions"
                                options={permissionOptions}
                                getter={(form) =>
                                    (form.permissions ?? []).map(
                                        (permission) => permission.id
                                    )
                                }
                                setter={(form, field) => ({
                                    ...form,
                                    permissions:
                                        field != null
                                            ? permissions.filter((permission) =>
                                                  field.includes(permission.id)
                                              )
                                            : form.permissions,
                                })}
                            />
                        </FormGroup>
                    </Form>
                )}
            </div>
        </>
    )
}
