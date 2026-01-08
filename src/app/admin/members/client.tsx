'use client'

import PaginatedList from '@/components/admin/PaginatedList'
import { ImageWithFallback } from '@/components/common'
import {
    CheckboxField,
    Form,
    FormGroup,
    SelectManyField,
    TextField,
} from '@/components/form'
import { DateField } from '@/components/form/DateField'
import { IRole } from '@/models/Role'
import { IUser } from '@/models/User'
import { dateService } from '@/services'
import { useUser } from '@/util/hooks'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'
import { PulseLoader } from 'react-spinners'

export interface PageProps {
    roles: IRole[]
}

export default function ClientPage({ roles }: PageProps) {
    const eventTarget = useRef(new EventTarget())

    // We save the original value we got from the API so that we can easily
    // discard changes without saving
    const [originalUser, setOriginalUser] = useState<IUser | null>(null)
    // This is the mutable copy we actually update when the user interacts with
    // the form
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
    const [users, setUsers] = useState<IUser[]>([])

    const loggedInUser = useUser()

    const handleSelectItem = (value: IUser) => {
        if (value._id === selectedUser?._id) return

        if (!deepEqual(selectedUser, originalUser)) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        // We need to copy to make sure that the value in the list is not
        // modified until we save
        setSelectedUser({ ...value } as IUser)
        setOriginalUser({ ...value } as IUser)
    }

    const userAge = dateService.getAge(selectedUser?.dateOfBirth ?? '')
    const fCreatedDate = selectedUser?.createdAt
        ? dateService.formatDate(selectedUser.createdAt)
        : ''
    const makeItem = (user: IUser) => ({ id: user._id as string, value: user })

    return (
        <>
            <PaginatedList<IUser>
                eventTarget={eventTarget.current}
                endpoint="/api/admin/users"
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
                searchFields={[
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
                    {
                        id: 'createdAt',
                        name: 'Date Created',
                    },
                    {
                        id: 'completedIntake',
                        name: 'Date Intake Done',
                    },
                    {
                        id: 'joinedServer',
                        name: 'Date Joined Server',
                    },
                ]}
                items={users.map(makeItem)}
                pinnedItem={
                    loggedInUser.data
                        ? makeItem(loggedInUser.data)
                        : { id: '', value: {} as IUser }
                }
                selectedItem={selectedUser ? makeItem(selectedUser) : null}
                onSelectItem={({ value }) => handleSelectItem(value)}
                setItems={setUsers}
                renderItem={({ id, value }) =>
                    id ? (
                        <>
                            <ImageWithFallback
                                src={value.image}
                                alt="user profile picture"
                            />
                            <div className="flex flex-col">
                                <span className="font-medium text-black">
                                    {(value.firstName
                                        ? `${value.firstName} ${value.lastName}`
                                        : value.preferredName) ?? value.email}
                                </span>
                                <span className="text-gray-500">
                                    {value.name}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <ImageWithFallback
                                src=""
                                alt="user profile picture"
                                useFallback
                            />
                            <PulseLoader size={8} color="#bbb" />
                        </>
                    )
                }
            />

            <div className="h-[calc(100dvh-100px)] flex-1 overflow-y-auto">
                {selectedUser && originalUser ? (
                    <Form<IUser>
                        initialValue={originalUser}
                        setInitialValue={setOriginalUser}
                        currentValue={selectedUser}
                        setCurrentValue={setSelectedUser}
                        computeTitle={(user) => {
                            if (user.firstName && user.lastName)
                                return `${user.firstName} ${user.lastName}`
                            if (user.preferredName) return user.preferredName
                            if (user.name) return user.name
                            return ''
                        }}
                        patchEndpoint="/api/admin/users"
                        onChangesSaved={() => {
                            eventTarget.current.dispatchEvent(
                                new Event('refetch')
                            )
                            if (selectedUser._id === loggedInUser.data?._id)
                                loggedInUser.reload()
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
                            <TextField
                                name="Date Created"
                                field="createdAt"
                                readonly
                                dynamic={{ value: fCreatedDate }}
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
                            <TextField
                                name="Date Intake Done"
                                field="completedIntake"
                                readonly
                            />
                            <TextField
                                name="Date Server Joined"
                                field="joinedServer"
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
