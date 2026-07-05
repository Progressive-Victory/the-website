'use client'

import styles from './page.module.css'
import { ListElement, List } from '@/app/admin/layout/List'
import {
    Form,
    FormGroup,
    FormState,
    TextField,
} from '@/components/common/forms'
import { Permission, zPermission } from '@/contracts/data'
import { UpdatePermissionRequest } from '@/contracts/requests'
import { PaginatedResponse } from '@/contracts/responses'
import { FetchError } from '@/models'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export default function Page() {
    const queryClient = useQueryClient()
    const { onPatch } = useFetch()

    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null)

    const [formState, setFormState] = useState<FormState<Permission> | null>(
        null
    )

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch('/permissions', zPermission)

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
            queryClient.invalidateQueries({ queryKey: ['/roles', search] }),
    })

    const handleSelectItem = (value: Permission) => {
        if (value.id === selectedPermission?.id) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedPermission(value)
    }

    const handleSave = (permission: Permission) => {
        updateMutation.mutate({
            id: permission.id,
            permission,
            request: { name: permission.name },
        })
    }

    return (
        <>
            <List
                search={search}
                count={searchQuery.data?.count}
                isPending={searchQuery.isPending}
                error={searchQuery.error}
                onSearch={onSearch}
            >
                {searchQuery.data?.data?.map((item) => (
                    <ListElement
                        key={item.id}
                        selected={selectedPermission?.id == item.id}
                        onClick={() => handleSelectItem(item)}
                    >
                        <span className={styles.listItemText}>{item.name}</span>
                    </ListElement>
                ))}
            </List>

            <div className={styles.detailPane}>
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
        </>
    )
}
