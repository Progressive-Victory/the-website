'use client'

import styles from './page.module.css'
import { ListElement, PaginatedList } from '@/components/admin/PaginatedList2'
import {
    Form,
    FormGroup,
    FormState,
    SelectManyField,
    TextField,
} from '@/components/form'
import { Permission, Role, zPermission, zRole } from '@/contracts/data'
import { UpdateRoleRequest } from '@/contracts/requests'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

export default function Page() {
    const eventTarget = useRef(new EventTarget())
    const { onPatch } = useFetch()

    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [formState, setFormState] = useState<FormState<Role> | null>(null)

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch<Permission>('/roles', zRole)

    const { query: permissionsQuery } = usePaginatedSearch<Permission>(
        '/permissions',
        zPermission,
        { search: { limit: 50 }, all: true }
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

    const updateMutation = useMutation({
        async mutationFn({
            id,
            request,
        }: {
            id: number
            request: UpdateRoleRequest
        }) {
            await onPatch(`/roles/${id}`, request, null)
            eventTarget.current.dispatchEvent(new Event('refetch'))
        },
    })

    const handleSelectItem = (value: Role) => {
        if (value.id === selectedRole?.id) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedRole(value)
    }

    const handleSave = (role: Role) => {
        setSelectedRole(role)
        updateMutation.mutate({
            id: role.id,
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
            <PaginatedList
                search={search}
                count={searchQuery.data?.count ?? null}
                isPending={searchQuery.isPending}
                error={searchQuery.error}
                onSearch={onSearch}
                // filters={[
                //     {
                //         name: 'Permission',
                //         query_key: 'permissions',
                //         display_key: 'name',
                //         value_key: 'name',
                //         options: (permissions ?? []).map((permission) => ({
                //             name: permission.name,
                //         })),
                //     },
                // ]}
            >
                {searchQuery.data?.data?.map((item) => (
                    <ListElement
                        key={item.id}
                        selected={selectedRole?.id == item.id}
                        onClick={() => handleSelectItem(item)}
                    >
                        <span className={styles.roleListItemName}>
                            {item.name}
                        </span>
                    </ListElement>
                ))}
            </PaginatedList>

            <div className={styles.rightPane}>
                {selectedRole ? (
                    <Form<Role>
                        key={selectedRole.id}
                        form={selectedRole}
                        title={selectedRole.name}
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
                ) : (
                    <div className={styles.emptyState}>No role selected</div>
                )}
            </div>
        </>
    )
}
