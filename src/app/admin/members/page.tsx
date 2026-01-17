'use client'

import styles from './page.module.css'
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
import { IRole, IUser, zRole, zUser } from '@/contracts/data'
import { IPaginatedResponse } from '@/contracts/responses'
import { dateService } from '@/services'
import { useCurrentUser, useFetch } from '@/util/hooks'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'
import { PulseLoader } from 'react-spinners'
import z from 'zod'

export default function Page() {
    const eventTarget = useRef(new EventTarget())

    // We save the original value we got from the API so that we can easily
    // discard changes without saving
    const [originalUser, setOriginalUser] = useState<IUser | null>(null)
    // This is the mutable copy we actually update when the user interacts with
    // the form
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
    const [users, setUsers] = useState<IUser[]>([])
    const { onGet } = useFetch()

    const loggedInUser = useCurrentUser()

    const getRolesQuery = useQuery({
        queryKey: ['/roles'],
        async queryFn({ signal }) {
            const limit = 50

            const { data: roles, count } = await onGet<
                IPaginatedResponse<IRole>
            >('/roles', z.array(zRole), {
                query: { limit: limit.toString() },
                signal,
            })

            const pages = Math.ceil(count / limit)

            const queries: Promise<IRole[]>[] = []
            for (let page = 1; page < pages; page++) {
                const query = async (page: number) => {
                    const thisLimit = Math.min(limit, count - page * limit)

                    const response = await onGet<IPaginatedResponse<IRole>>(
                        '/roles',
                        z.array(zRole),
                        {
                            query: {
                                limit: thisLimit.toString(),
                                page: page.toString(),
                            },
                            signal,
                        }
                    )

                    return response.data
                }

                queries.push(query(page))
            }

            roles.push(
                ...(await Promise.all(queries)).flatMap((perms) => perms)
            )

            return roles
        },
        placeholderData: keepPreviousData,
    })
    const roles = getRolesQuery.data ?? []

    const selectedUserQuery = useQuery({
        queryKey: [`/users/${selectedUser?.id}`],
        async queryFn({ signal }) {
            return await onGet<IUser>(`/users/${selectedUser?.id}`, zUser, {
                query: { includeDiscordUsers: true, includeHistory: true },
                signal,
            })
        },
        placeholderData: keepPreviousData,
    })

    const handleSelectItem = (value: IUser) => {
        if (value.id === selectedUser?.id) return

        if (!deepEqual(selectedUser, originalUser)) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setOriginalUser({ ...value })
        setSelectedUser({ ...value })
    }

    const userAge = dateService.getAge(selectedUser?.birthdate ?? new Date())
    const fCreatedDate = selectedUser?.createdAtUtc
        ? dateService.formatDate(selectedUser.createdAtUtc)
        : ''
    const makeItem = (user: IUser) => ({
        id: user.id.toString(),
        value: user,
    })

    return (
        <>
            <PaginatedList<IUser>
                zodSchema={zUser}
                eventTarget={eventTarget.current}
                endpoint="/users"
                filters={[
                    {
                        name: 'Role',
                        query_key: 'roles',
                        display_key: 'name',
                        value_key: 'name',
                        options: (roles ?? []).map((role) => ({
                            name: role.name,
                        })),
                    },
                ]}
                searchFields={[
                    { id: 'name', name: 'Name' },
                    { id: 'email', name: 'Email' },
                    { id: 'firstName', name: 'First Name' },
                    { id: 'lastName', name: 'Last Name' },
                    { id: 'preferredName', name: 'Preferred Name' },
                    { id: 'state', name: 'State' },
                    { id: 'createdAt', name: 'Date Created' },
                    { id: 'completedIntake', name: 'Date Intake Done' },
                    { id: 'joinedServer', name: 'Date Joined Server' },
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
                                useFallback={!value.discordUsers?.[0].image}
                                src={`https://cdn.discordapp.com/avatars/${value.discordUsers?.[0].id}/${value.discordUsers?.[0].image ?? ''}`} // need to figure out alternative for this
                                alt="user profile picture"
                            />
                            <div className={styles.userMeta}>
                                <span className={styles.userName}>
                                    {(value.firstName
                                        ? `${value.firstName} ${value.lastName}`
                                        : value.preferredName) ?? value.email}
                                </span>
                                <span className={styles.userUsername}>
                                    {value.discordUsers?.[0].username}
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
                            <div className={styles.loading}>
                                <PulseLoader size={8} color="#bbb" />
                            </div>
                        </>
                    )
                }
            />

            <div className={styles.detailsPane}>
                {selectedUser && originalUser ? (
                    <Form<IUser>
                        zodSchema={zUser}
                        initialValue={originalUser}
                        setInitialValue={setOriginalUser}
                        currentValue={selectedUser}
                        setCurrentValue={setSelectedUser}
                        computeTitle={(user) => {
                            if (user.firstName && user.lastName)
                                return `${user.firstName} ${user.lastName}`
                            if (user.preferredName) return user.preferredName
                            if (user.discordUsers?.[0].username)
                                return user.discordUsers[0].username // need alternative here
                            return ''
                        }}
                        patchEndpoint={`/users/${selectedUser.id}`}
                        onChangesSaved={() => {
                            eventTarget.current.dispatchEvent(
                                new Event('refetch')
                            )
                            if (selectedUser.id === loggedInUser.data?.id)
                                void loggedInUser.onRefetch()
                        }}
                        updateHistory={selectedUserQuery.data?.history}
                    >
                        <FormGroup title="Account Information">
                            <TextField
                                name="Username"
                                field="username"
                                required
                            />
                            <TextField
                                name="Discord Id"
                                field="discordUsersId"
                            />
                            <TextField name="Email" field="email" required />
                            <TextField
                                name="Phone Number"
                                field="phone"
                                required
                            />
                            <TextField
                                name="Preferred Name"
                                field="preferredName"
                                deprecated
                            />
                            <TextField name="First Name" field="firstName" />
                            <TextField name="Last Name" field="lastName" />
                            <DateField name="Date of Birth" field="birthdate" />
                            <TextField
                                name="Age"
                                field="age"
                                readonly
                                dynamic={{ value: userAge }}
                            />
                            <TextField
                                name="Date Created"
                                field="createdAtUtc"
                                readonly
                                dynamic={{ value: fCreatedDate }}
                            />
                        </FormGroup>

                        <FormGroup title="Address">
                            <TextField name="City" field="city" />
                            <TextField name="County" field="county" />
                            <TextField name="State" field="state" />
                            <TextField name="Zip Code" field="zip" />
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
                                field="completedIntakeUtc"
                                readonly
                            />
                            <TextField
                                name="Date Server Joined"
                                field="joinedServerUtc"
                                readonly
                            />
                        </FormGroup>

                        <FormGroup title="Permissions">
                            <SelectManyField
                                name="Roles"
                                field="roles"
                                nameKey="name"
                                valueKey="id"
                                options={roles ?? ['loading']}
                            />
                        </FormGroup>
                    </Form>
                ) : (
                    <div className={styles.emptyState}>No user selected</div>
                )}
            </div>
        </>
    )
}
