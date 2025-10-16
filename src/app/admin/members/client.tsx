'use client'

import PaginatedList from '@/components/admin/PaginatedList'
import {
    CheckboxField,
    Form,
    FormGroup,
    SelectManyField,
    TextField,
} from '@/components/form'
import { DateField, parseTimezonelessDate } from '@/components/form/DateField'
import { IRole } from '@/models/Role'
import { IUser } from '@/models/User'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'

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

    const userAge = user?.dateOfBirth
        ? new Date(
              Date.now().valueOf() -
                  parseTimezonelessDate(user.dateOfBirth).valueOf()
          ).getUTCFullYear() - 1970
        : undefined

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
                    >
                        <FormGroup title="Account Information">
                            <TextField name="Username" field="name" required />
                            <TextField name="Email" field="email" required />
                            <TextField
                                name="Discord ID"
                                field="discordId"
                                readonly
                            />
                            <TextField
                                name="Phone Number"
                                field="phoneNumber"
                                required
                            />
                            <TextField
                                name="Preferred Name"
                                field="preferredName"
                                deprecated
                            />
                            <TextField name="First Name" field="firstName" />
                            <TextField name="Last Name" field="lastName" />
                            <DateField
                                name="Date of Birth"
                                field="dateOfBirth"
                            />
                            <TextField
                                name="Age"
                                field="age"
                                readonly
                                dynamic={{ value: userAge }}
                            />
                        </FormGroup>
                        <FormGroup title="Address">
                            <TextField name="City" field="city" />
                            <TextField name="County" field="county" />
                            <TextField name="State" field="state" />
                            <TextField name="Zip Code" field="zipCode" />
                        </FormGroup>
                        <FormGroup title="Account Status" defaultCollapsed>
                            <CheckboxField
                                name="Accepted Alerts"
                                field="acceptedAlerts"
                                readonly
                            />
                            <CheckboxField name="Verified" field="verified" />
                            <TextField
                                name="Onboarding Stage"
                                field="onboardingStage"
                                readonly
                            />
                        </FormGroup>
                        <FormGroup title="Permissions">
                            <SelectManyField
                                name="Roles"
                                field="roles"
                                nameKey="name"
                                valueKey="_id"
                                options={roles}
                            />
                        </FormGroup>
                    </Form>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        No user selected
                    </div>
                )}
            </div>
        </>
    )
}
