'use client'

import {
    Form,
    FormGroup,
    SelectManyField,
    TextField,
} from '@/components/admin/Form'

import PaginatedList from '@/components/admin/PaginatedList'
import { IPermission } from '@/models/Permission'
import { IRole } from '@/models/Role'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'

export interface PageProps {
    permissions: IPermission[]
}

function constructFormGroups(permissions: IPermission[]) {
    return [
        FormGroup('Details', [
            TextField('Name', 'name', { required: true }),
            SelectManyField(
                'Permissions',
                'permissions',
                'name',
                '_id',
                permissions
            ),
        ]),
    ]
}

export default function ClientPage({ permissions }: PageProps) {
    const event_target = useRef(new EventTarget())

    // We save the original value we got from the API so that we can easily
    // discard changes without saving
    const [originalRole, setOriginalRole] = useState<IRole | null>(null)
    // This is the mutable copy we actually update when the user interacts with
    // the form
    const [role, setRole] = useState<IRole | null>(null)

    const beforeElementSelected = () => {
        if (!deepEqual(role, originalRole)) {
            return confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
        }

        return true
    }

    const onElementSelected = (value: IRole) => {
        setRole({ ...value } as IRole)
        // We need to copy to make sure that the value in the list is not
        // modified until we save
        setOriginalRole({ ...value } as IRole)
    }

    return (
        <>
            <PaginatedList<IRole>
                event_target={event_target.current}
                api_endpoint="/api/admin/roles"
                before_element_selection={beforeElementSelected}
                on_element_selected={onElementSelected}
                id_key="_id"
                display_key={'name'}
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
                search_fields={[
                    {
                        id: 'name',
                        name: 'Name',
                    },
                ]}
            />
            <div className="h-[calc(100vh-100px)] flex-1 overflow-y-auto">
                {role && originalRole ? (
                    <Form<IRole>
                        groups={constructFormGroups(permissions)}
                        initialValue={originalRole}
                        setInitialValue={setOriginalRole}
                        currentValue={role}
                        setCurrentValue={setRole}
                        computeTitle={(role) => role.name ?? ''}
                        patchEndpoint="/api/admin/roles"
                        onChangesSaved={() => {
                            event_target.current.dispatchEvent(
                                new Event('refetch')
                            )
                        }}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        No role selected
                    </div>
                )}
            </div>
        </>
    )
}
