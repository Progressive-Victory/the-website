'use client'

import PaginatedList from '@/components/admin/PaginatedList'
import { Form, FormGroup, SelectManyField, TextField } from '@/components/form'
import { IPermission, IRole, zPermission, zRole } from '@/contracts/data'
import { useFetch } from '@/util/hooks'
import deepEqual from 'deep-equal'
import { useEffect, useRef, useState } from 'react'
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
    const [permissions, setPermissions] = useState<IPermission[]>([])
    const { onGet } = useFetch()

    useEffect(() => {
        const fetchPermList = async (): Promise<IPermission[]> => {
            return onGet<IPermission[]>(
                '/permissions/all',
                z.array(zPermission)
            )
        }

        fetchPermList()
            .then((res) => {
                setPermissions(res)
            })
            .catch((err) => {
                console.error(err)
            })
    }, [onGet])

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
            <div className="h-[calc(100vh-100px)] flex-1 overflow-y-auto">
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
