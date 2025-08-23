'use client'

import { Form, IFormGroup } from '@/components/admin/Form'

import PaginatedList from '@/components/admin/PaginatedList'
import { IRole } from '@/models/Role'
import { IUser } from '@/models/User'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'

const FORM_GROUPS: IFormGroup[] = [
    {
        title: 'Account Information',
        fields: [
            {
                type: 'text',
                name: 'Username',
                key: 'name',
                required: true,
            },
            {
                type: 'text',
                name: 'Email',
                key: 'email',
                required: true,
            },
            {
                type: 'text',
                name: 'Discord ID',
                key: 'discordId',
                readonly: true,
            },
            {
                type: 'text',
                name: 'Phone Number',
                key: 'phoneNumber',
                required: true,
            },
            {
                type: 'text',
                name: 'Preferred Name',
                key: 'preferredName',
                required: false,
                deprecated: true,
            },
            {
                type: 'text',
                name: 'First Name',
                key: 'firstName',
                required: false,
            },
            {
                type: 'text',
                name: 'Last Name',
                key: 'lastName',
                required: false,
            },
        ],
    },
    {
        title: 'Address',
        fields: [
            {
                type: 'text',
                name: 'City',
                key: 'city',
                required: false,
            },
            {
                type: 'text',
                name: 'County',
                key: 'county',
                required: false,
            },
            {
                type: 'text',
                name: 'State',
                key: 'state',
                required: false,
            },
            {
                type: 'text',
                name: 'Zip Code',
                key: 'zipCode',
                required: false,
            },
        ],
    },
    {
        title: 'Account Status',
        fields: [
            {
                type: 'checkbox',
                name: 'Accepted Alerts',
                key: 'acceptedAlerts',
                readonly: true,
            },
            {
                type: 'checkbox',
                name: 'Verified',
                key: 'verified',
                readonly: false,
            },
            {
                type: 'text',
                name: 'Onboarding Stage',
                key: 'onboardingStage',
                readonly: true,
            },
        ],
    },
]

export interface PageProps {
    roles: IRole[]
}

export default function ClientPage({ roles }: PageProps) {
    const event_target = useRef(new EventTarget())

    // We save the original value we got from the API so that we can easily
    // discard changes without saving
    const [originalUser, setOriginalUser] = useState<IUser | null>(null)
    // This is the mutable copy we actually update when the user interacts with
    // the form
    const [user, setUser] = useState<IUser | null>(null)

    const beforeElementSelected = () => {
        if (!deepEqual(user, originalUser)) {
            return confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
        }

        return true
    }

    const onElementSelected = (value: IUser) => {
        setUser({ ...value } as IUser)
        // We need to copy to make sure that the value in the list is not
        // modified until we save
        setOriginalUser({ ...value } as IUser)
    }

    return (
        <>
            <PaginatedList<IUser>
                event_target={event_target.current}
                api_endpoint="/api/admin/users"
                before_element_selection={beforeElementSelected}
                on_element_selected={onElementSelected}
                id_key="_id"
                display_key={(u) =>
                    (u.firstName
                        ? `${u.firstName} ${u.lastName}`
                        : u.preferredName) ?? u.email
                }
                alternate_display_key="name"
                image={{ key: 'image', alt: 'user profile picture' }}
                filters={[
                    {
                        name: 'Role',
                        query_key: 'roles',
                        display_key: 'name',
                        value_key: 'name',
                        // @ts-expect-error shut up
                        options: roles,
                    },
                ]}
                search_fields={[
                    {
                        id: 'name',
                        name: 'Name',
                    },
                    {
                        id: 'email',
                        name: 'Email',
                    },
                    {
                        id: 'firstName',
                        name: 'First Name',
                    },
                    {
                        id: 'lastName',
                        name: 'Last Name',
                    },
                    {
                        id: 'preferredName',
                        name: 'Preferred Name',
                    },
                ]}
            />
            <div className="h-[calc(100vh-100px)] flex-1 overflow-y-auto">
                {user && originalUser ? (
                    // @ts-expect-error shut up
                    <Form<IUser>
                        groups={[
                            ...FORM_GROUPS,
                            {
                                title: 'Permissions',
                                fields: [
                                    {
                                        type: 'select_many',
                                        name: 'Roles',
                                        key: 'roles',
                                        display_key: 'name',
                                        value_key: '_id',
                                        options: roles,
                                    },
                                ],
                            },
                        ]}
                        initialValue={originalUser}
                        setInitialValue={setOriginalUser}
                        currentValue={user}
                        setCurrentValue={setUser}
                        computeTitle={(user) => {
                            if (user.firstName && user.lastName)
                                return `${user.firstName} ${user.lastName}`
                            if (user.preferredName) return user.preferredName
                            if (user.name) return user.name
                            return ''
                        }}
                        patchEndpoint="/api/admin/users"
                        onChangesSaved={() => {
                            event_target.current.dispatchEvent(
                                new Event('refetch')
                            )
                        }}
                        updateHistory
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        No user selected
                    </div>
                )}
            </div>
        </>
    )
}
