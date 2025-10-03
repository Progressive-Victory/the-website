'use client'

import PaginatedList from '@/components/admin/PaginatedList'
import {
    Form,
    MakeCheckboxField,
    MakeFormGroup,
    MakeSelectManyField,
    MakeTextField,
} from '@/components/form'
import { IRole } from '@/models/Role'
import { IUser } from '@/models/User'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'

const STATIC_FORM_GROUPS = [
    MakeFormGroup('Account Information', [
        MakeTextField('Username', 'name', { required: true }),
        MakeTextField('Email', 'email', { required: true }),
        MakeTextField('Discord ID', 'discordId', { readonly: true }),
        MakeTextField('Phone Number', 'phoneNumber', { required: true }),
        MakeTextField('Preferred Name', 'preferredName', { deprecated: true }),
        MakeTextField('First Name', 'firstName'),
        MakeTextField('Last Name', 'lastName'),
        MakeTextField('Date of Birth', 'dateOfBirth'),
        MakeTextField('Age', 'age', { readonly: true }),
    ]),
    MakeFormGroup('Address', [
        MakeTextField('City', 'city'),
        MakeTextField('County', 'county'),
        MakeTextField('State', 'state'),
        MakeTextField('Zip Code', 'zipCode'),
    ]),
    MakeFormGroup(
        'Account Status',
        [
            MakeCheckboxField('Accepted Alerts', 'acceptedAlerts', {
                readonly: true,
            }),
            MakeCheckboxField('Verified', 'verified'),
            MakeTextField('Onboarding Stage', 'onboardingState', {
                readonly: true,
            }),
        ],
        { defaultCollapsed: true }
    ),
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

    const constructFormGroups = (roles: IRole[]) => [
        ...STATIC_FORM_GROUPS,
        MakeFormGroup('Permissions', [
            MakeSelectManyField('Roles', 'roles', 'name', '_id', roles),
        ]),
    ]

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
                    {
                        id: 'state',
                        name: 'State',
                    },
                ]}
            />
            <div className="h-[calc(100vh-100px)] flex-1 overflow-y-auto">
                {user && originalUser ? (
                    <Form<IUser>
                        groups={constructFormGroups(roles)}
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
