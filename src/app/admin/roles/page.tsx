'use client'

import styles from './page.module.css'
import PaginatedList from '@/components/admin/PaginatedList'
import {
    Form,
    FormGroup,
    FormState,
    SelectManyField,
    TextField,
} from '@/components/form2'
import { IPermission, IRole, zPermission, zRole } from '@/contracts/data'
import { IUpdateRoleRequest } from '@/contracts/requests'
import { IPaginatedResponse, zPaginatedResponse } from '@/contracts/responses'
import { useFetch } from '@/util/hooks'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'
import z from 'zod'

export default function Page() {
    const eventTarget = useRef(new EventTarget())
    const { onGet, onPatch } = useFetch()

    const [roles, setRoles] = useState<IRole[]>([])
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null)

    const [formState, setFormState] = useState<FormState<IRole> | null>(null)

    const getPermissionsQuery = useQuery({
        queryKey: ['/permissions'],
        async queryFn({ signal }) {
            const limit = 50

            try {
                const { data: permissions, count } = await onGet<
                    IPaginatedResponse<IPermission>
                >('/permissions', zPaginatedResponse(zPermission), {
                    query: { limit: limit.toString() },
                    signal,
                })
                const pages = Math.ceil(count / limit)

                const queries: Promise<IPermission[]>[] = []
                for (let page = 1; page < pages; page++) {
                    const query = async (page: number) => {
                        const thisLimit = Math.min(limit, count - page * limit)
                        const response = await onGet<
                            IPaginatedResponse<IPermission>
                        >('/permissions', z.array(zPermission), {
                            query: {
                                limit: thisLimit.toString(),
                                page: page.toString(),
                            },
                            signal,
                        })
                        return response.data
                    }

                    queries.push(query(page))
                }
                const queries_1 = await Promise.all([
                    Promise.resolve(permissions),
                    ...queries,
                ])
                return queries_1.flatMap((perms) => perms)
            } catch (e) {
                console.log(e)
                throw e
            }
        },
        placeholderData: keepPreviousData,
    })

    const permissions = getPermissionsQuery.data ?? []
    console.log(permissions)
    const permissionOptions = useMemo(
        () =>
            (getPermissionsQuery.data ?? []).map((permission) => ({
                value: permission.id,
                label: permission.name,
            })),
        [getPermissionsQuery.data]
    )

    const updateMutation = useMutation({
        async mutationFn({
            id,
            request,
        }: {
            id: number
            request: IUpdateRoleRequest
        }) {
            await onPatch(`/roles/${id}`, request, null)
            eventTarget.current.dispatchEvent(new Event('refetch'))
        },
    })

    const handleSelectItem = (value: IRole) => {
        if (value.id === selectedRole?.id) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedRole(value)
    }

    const handleSave = (role: IRole) => {
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

    const makeItem = (role: IRole) => ({
        id: role.id.toString(),
        value: role,
    })

    return (
        <>
            <PaginatedList<IRole>
                zodSchema={zRole}
                eventTarget={eventTarget.current}
                endpoint="/roles"
                filters={[
                    {
                        name: 'Permission',
                        query_key: 'permissions',
                        display_key: 'name',
                        value_key: 'name',
                        options: (permissions ?? []).map((permission) => ({
                            name: permission.name,
                        })),
                    },
                ]}
                searchFields={[
                    {
                        id: 'name',
                        name: 'Name',
                    },
                ]}
                items={roles.map(makeItem)}
                selectedItem={selectedRole ? makeItem(selectedRole) : null}
                onSelectItem={({ value }) => handleSelectItem(value)}
                setItems={setRoles}
                renderItem={({ value }) => (
                    <span className={styles.roleListItemName}>
                        {value.name}
                    </span>
                )}
            />

            <div className={styles.rightPane}>
                {selectedRole ? (
                    <Form<IRole>
                        key={selectedRole.id}
                        form={selectedRole}
                        title={selectedRole.name}
                        saving={updateMutation.isPending}
                        onUpdate={setFormState}
                        onSave={handleSave}
                    >
                        <FormGroup title="Details">
                            <TextField label="Name" field="name" required />
                            <SelectManyField<IRole>
                                label="Permissions"
                                getter={(form) =>
                                    (form.permissions ?? []).map(
                                        (permission) => permission.id
                                    )
                                }
                                setter={(form, field) => ({
                                    ...form,
                                    permissions: permissions.filter(
                                        (permission) =>
                                            field.includes(permission.id)
                                    ),
                                })}
                                options={permissionOptions}
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
