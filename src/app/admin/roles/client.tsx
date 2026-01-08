'use client'

import PaginatedList from '@/components/admin/PaginatedList'
import { Form, FormGroup, SelectManyField, TextField } from '@/components/form'
import { IPermission, IRole, zPermission, zRole } from '@/contracts/data'
import { IPaginatedResponse } from '@/contracts/responses'
import { useFetch } from '@/util/hooks'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'
import z from 'zod'

export default function ClientPage() {
    const eventTarget = useRef(new EventTarget())

    // We save the original value we got from the API so that we can easily
    // discard changes without saving
    const [originalRole, setOriginalRole] = useState<IRole | null>(null)
    // This is the mutable copy we actually update when the user interacts with
    // the form
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null)
    const [roles, setRoles] = useState<IRole[]>([])
    const { onGet } = useFetch()

    const getPermissionsQuery = useQuery({
        queryKey: ['/permissions'],
        async queryFn({ signal }) {
            const limit = 50

            const { data: permissions, count } = await onGet<
                IPaginatedResponse<IPermission>
            >('/permissions', z.array(zPermission), {
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

            permissions.push(
                ...(await Promise.all(queries)).flatMap((perms) => perms)
            )

            return permissions
        },
        placeholderData: keepPreviousData,
    })
    const permissions = getPermissionsQuery.data ?? []

    const handleSelectItem = (value: IRole) => {
        if (value.id === selectedRole?.id) return

        if (!deepEqual(selectedRole, originalRole)) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        // We need to copy to make sure that the value in the list is not
        // modified until we save
        setSelectedRole({ ...value } as IRole)
        setOriginalRole({ ...value } as IRole)
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
                    <span className="font-medium text-black">{value.name}</span>
                )}
            />
            <div className="h-[calc(100dvh-100px)] flex-1 overflow-y-auto">
                {selectedRole && originalRole ? (
                    <Form<IRole>
                        zodSchema={zRole}
                        initialValue={originalRole}
                        setInitialValue={setOriginalRole}
                        currentValue={selectedRole}
                        setCurrentValue={setSelectedRole}
                        computeTitle={(role) => role.name ?? ''}
                        patchEndpoint={`/roles/${selectedRole.id}`}
                        onChangesSaved={() => {
                            eventTarget.current.dispatchEvent(
                                new Event('refetch')
                            )
                        }}
                    >
                        <FormGroup title="Details">
                            <TextField name="Name" field="name" required />
                            <SelectManyField
                                name="Permissions"
                                field="permissions"
                                nameKey="name"
                                valueKey="id"
                                options={permissions}
                            />
                        </FormGroup>
                    </Form>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        No role selected
                    </div>
                )}
            </div>
        </>
    )
}
