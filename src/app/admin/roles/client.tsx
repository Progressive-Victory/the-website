'use client'

import styles from './roles.module.css'
import PaginatedList from '@/components/admin/PaginatedList'
import { Form, FormGroup, SelectManyField, TextField } from '@/components/form'
import { IMongoPermission } from '@/models/MongoPermission'
import { IMongoRole } from '@/models/MongoRole'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'

export interface PageProps {
    permissions: IMongoPermission[]
}

export default function ClientPage({ permissions }: PageProps) {
    const eventTarget = useRef(new EventTarget())

    // We save the original value we got from the API so that we can easily
    // discard changes without saving
    const [originalRole, setOriginalRole] = useState<IMongoRole | null>(null)
    // This is the mutable copy we actually update when the user interacts with
    // the form
    const [selectedRole, setSelectedRole] = useState<IMongoRole | null>(null)
    const [roles, setRoles] = useState<IMongoRole[]>([])

    const handleSelectItem = (value: IMongoRole) => {
        if (value._id === selectedRole?._id) return

        if (!deepEqual(selectedRole, originalRole)) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        // We need to copy to make sure that the value in the list is not
        // modified until we save
        setSelectedRole({ ...value } as IMongoRole)
        setOriginalRole({ ...value } as IMongoRole)
    }

    const makeItem = (role: IMongoRole) => ({
        id: role._id as string,
        value: role,
    })

    return (
        <>
            <PaginatedList<IMongoRole>
                eventTarget={eventTarget.current}
                endpoint="/api/admin/roles"
                filters={[
                    {
                        name: 'Permission',
                        query_key: 'permissions',
                        display_key: 'name',
                        value_key: 'name',
                        // @ts-expect-error shut up
                        options: permissions,
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
                {selectedRole && originalRole ? (
                    <Form<IMongoRole>
                        initialValue={originalRole}
                        setInitialValue={setOriginalRole}
                        currentValue={selectedRole}
                        setCurrentValue={setSelectedRole}
                        computeTitle={(role) => role.name ?? ''}
                        patchEndpoint="/api/admin/roles"
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
                                valueKey="_id"
                                options={permissions}
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
