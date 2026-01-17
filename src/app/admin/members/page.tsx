'use client'

import styles from './page.module.css'
import PaginatedList from '@/components/admin/PaginatedList'
import { ImageWithFallback } from '@/components/common'
import {
    CheckboxField,
    DateField,
    Form,
    FormGroup,
    FormState,
    SelectManyField,
    TextField,
} from '@/components/form'
import { Role, User, zRole, zUser } from '@/contracts/data'
import { UpdateUserRequest } from '@/contracts/requests'
import { PaginatedResponse, zPaginatedResponse } from '@/contracts/responses'
import { dateService } from '@/services'
import { useCurrentUser, useFetch } from '@/util/hooks'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PulseLoader } from 'react-spinners'

export default function Page() {
    const eventTarget = useRef(new EventTarget())
    const queryClient = useQueryClient()
    const { ready, onGet, onPatch } = useFetch()

    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [formState, setFormState] = useState<FormState<User> | null>(null)

    const loggedInUser = useCurrentUser()

    const getRoles = async () => {
        const limit = 50

        const getPage = async (page: number, limit: number) =>
            await onGet<PaginatedResponse<Role>>(
                '/roles',
                zPaginatedResponse(zRole),
                { query: { page, limit } }
            )

        try {
            const result = await getPage(0, limit)
            const page0 = result?.data ?? []
            const count = result?.count ?? 0
            const pageCount = Math.ceil(count / limit)

            const pageQueries: Promise<Role[]>[] = []
            for (let page = 1; page < pageCount; page++) {
                const query = async (page: number) => {
                    const currLimit = Math.min(limit, count - page * limit)
                    const result = await getPage(page, currLimit)
                    return result?.data ?? []
                }

                pageQueries.push(query(page))
            }

            const pages = await Promise.all(pageQueries)

            return [page0, ...pages].flatMap((perms) => perms)
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    const getRolesQuery = useQuery({
        queryKey: ['/roles'],
        queryFn: ready ? getRoles : skipToken,
        placeholderData: keepPreviousData,
    })

    const roles = getRolesQuery.data ?? []
    const roleOptions = useMemo(
        () =>
            (getRolesQuery.data ?? []).map((role) => ({
                value: role.id,
                label: role.name,
            })),
        [getRolesQuery.data]
    )

    useQuery({
        queryKey: [`/users/${selectedUser?.id}`],
        queryFn: selectedUser
            ? async () => {
                  const user = await onGet<User>(
                      `/users/${selectedUser?.id}`,
                      zUser,
                      {
                          query: {
                              includeDiscordUsers: true,
                              includeHistory: true,
                          },
                      }
                  )
                  setSelectedUser(user)
              }
            : skipToken,
        placeholderData: keepPreviousData,
    })

    const updateMutation = useMutation({
        async mutationFn({
            id,
            request,
        }: {
            id: number
            request: UpdateUserRequest
        }) {
            await onPatch(`/users/${id}`, request, null)
        },
    })

    const handleSelectItem = (value: User) => {
        if (value.id === selectedUser?.id) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedUser(value)
    }

    const handleSave = (user: User) => {
        eventTarget.current.dispatchEvent(new Event('refetch'))
        setSelectedUser(user)
        updateMutation.mutate({
            id: user.id,
            request: {
                email: user.email ?? undefined,
                phone: user.phone ?? undefined,
                preferredName: user.preferredName ?? undefined,
                firstName: user.firstName ?? undefined,
                lastName: user.lastName ?? undefined,
                birthdate: user.birthdate ?? undefined,
                zipCode: user.location?.zip,
                roles: user.roles?.map((role) => role.id),
            },
        })
    }

    const makeItem = (user: User) => ({
        id: user.id.toString(),
        value: user,
    })

    const makeTitle = (user: User) => {
        if (user.firstName && user.lastName)
            return `${user.firstName} ${user.lastName}`
        if (user.firstName) return user.firstName
        if (user.preferredName) return user.preferredName
        return user.email ?? ''
    }

    useEffect(() => {
        return () => {
            void queryClient.cancelQueries({
                queryKey: [`/roles`],
            })
            void queryClient.cancelQueries({
                queryKey: [`/users/${selectedUser?.id}`],
            })
        }
    })

    return (
        <>
            <PaginatedList<User>
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
                        : { id: '', value: {} as User }
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
                                    {makeTitle(value)}
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
                {selectedUser ? (
                    <Form<User>
                        form={selectedUser}
                        title={makeTitle(selectedUser)}
                        saving={updateMutation.isPending}
                        onUpdate={setFormState}
                        onSave={handleSave}
                    >
                        <FormGroup title="Account Information">
                            <TextField<User>
                                label="Username"
                                getter={(form) =>
                                    form.discordUsers?.[0]?.username
                                }
                                readonly
                            />
                            <TextField<User>
                                label="Discord Id"
                                getter={(form) => form.discordUsers?.[0]?.id}
                                readonly
                            />
                            <TextField label="Email" field="email" required />
                            <TextField
                                label="Phone Number"
                                field="phone"
                                required
                            />
                            <TextField
                                label="Preferred Name"
                                field="preferredName"
                                deprecated
                            />
                            <TextField label="First Name" field="firstName" />
                            <TextField label="Last Name" field="lastName" />
                            <DateField<User>
                                label="Date of Birth"
                                getter={(form) =>
                                    new Date(
                                        dateService.toISODateString(
                                            form.birthdate
                                        ) ?? ''
                                    )
                                }
                                field="birthdate"
                                format={{
                                    timeZone: 'UTC',
                                    dateStyle: 'medium',
                                }}
                            />
                            <TextField<User>
                                label="Age"
                                readonly
                                getter={(form) =>
                                    dateService.isValid(form.birthdate)
                                        ? dateService
                                              .getAge(form.birthdate!)
                                              ?.toString()
                                        : null
                                }
                            />
                            <DateField
                                label="Date Created"
                                field="createdAtUtc"
                                readonly
                            />
                            <SelectManyField<User>
                                label="Aliases"
                                field="aliases"
                                options={(selectedUser.aliases ?? []).map(
                                    (alias) => ({
                                        value: alias,
                                        label: alias,
                                    })
                                )}
                                readonly
                            />
                        </FormGroup>

                        <FormGroup title="Address">
                            <TextField<User>
                                label="Zip Code"
                                getter={(form) =>
                                    form.location?.zip?.toString()
                                }
                                setter={(form, field) => ({
                                    ...form,
                                    location:
                                        field != null
                                            ? {
                                                  ...(form.location ?? {
                                                      city: '',
                                                      county: '',
                                                      state: '',
                                                  }),
                                                  zip: +field,
                                              }
                                            : null,
                                })}
                            />
                            <TextField<User>
                                label="City"
                                getter={(form) => form.location?.city}
                                readonly
                            />
                            <TextField<User>
                                label="County"
                                getter={(form) => form.location?.county}
                                readonly
                            />
                            <TextField<User>
                                label="State"
                                getter={(form) => form.location?.state}
                                readonly
                            />
                        </FormGroup>

                        <FormGroup title="Account Status" defaultCollapsed>
                            <CheckboxField
                                label="Accepted Alerts"
                                field="acceptedAlerts"
                                readonly
                            />
                            <CheckboxField
                                label="Verified"
                                field="verified"
                                readonly
                            />
                            <TextField
                                label="Onboarding Stage"
                                field="onboardingStage"
                                readonly
                            />
                            <DateField
                                label="Date Intake Done"
                                field="completedIntakeUtc"
                                readonly
                            />
                            <DateField
                                label="Date Server Joined"
                                field="joinedAtUtc"
                                readonly
                            />
                        </FormGroup>

                        <FormGroup title="Roles">
                            <SelectManyField<User>
                                label="Roles"
                                options={roleOptions}
                                getter={(form) =>
                                    (form.roles ?? []).map((role) => role.id)
                                }
                                setter={(form, field) => ({
                                    ...form,
                                    roles:
                                        field != null
                                            ? roles.filter((role) =>
                                                  field.includes(role.id)
                                              )
                                            : form.roles,
                                })}
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
