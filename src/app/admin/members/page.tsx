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
} from '@/components/form2'
import { IRole, IUser, zRole, zUser } from '@/contracts/data'
import { IUpdateUserRequest } from '@/contracts/requests'
import { IPaginatedResponse, zPaginatedResponse } from '@/contracts/responses'
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

    const [users, setUsers] = useState<IUser[]>([])
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
    const [formState, setFormState] = useState<FormState<IUser> | null>(null)

    const loggedInUser = useCurrentUser()

    const getRolesQuery = useQuery({
        queryKey: ['/roles'],
        queryFn: ready
            ? async () => {
                  const limit = 50

                  const getPage = async (page: number, limit: number) =>
                      await onGet<IPaginatedResponse<IRole>>(
                          '/roles',
                          zPaginatedResponse(zRole),
                          { query: { page, limit } }
                      )

                  try {
                      const result = await getPage(0, limit)
                      const page0 = result?.data ?? []
                      const count = result?.count ?? 0
                      const pageCount = Math.ceil(count / limit)

                      const pageQueries: Promise<IRole[]>[] = []
                      for (let page = 1; page < pageCount; page++) {
                          const query = async (page: number) => {
                              const currLimit = Math.min(
                                  limit,
                                  count - page * limit
                              )
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
            : skipToken,
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
                  const user = await onGet<IUser>(
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
            request: IUpdateUserRequest
        }) {
            await onPatch(`/users/${id}`, request, null)
            eventTarget.current.dispatchEvent(new Event('refetch'))
        },
    })

    const handleSelectItem = (value: IUser) => {
        if (value.id === selectedUser?.id) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedUser(value)
    }

    const handleSave = (user: IUser) => {
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

    const makeItem = (user: IUser) => ({
        id: user.id.toString(),
        value: user,
    })

    const makeTitle = (user: IUser) => {
        if (user.firstName && user.lastName)
            return `${user.firstName} ${user.lastName}`
        if (user.preferredName) return user.preferredName
        if (user.discordUsers?.[0].username)
            return user.discordUsers[0].username
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
                {selectedUser ? (
                    <Form<IUser>
                        form={selectedUser}
                        title={makeTitle(selectedUser)}
                        saving={updateMutation.isPending}
                        onUpdate={setFormState}
                        onSave={handleSave}
                    >
                        <FormGroup title="Account Information">
                            <TextField<IUser>
                                label="Username"
                                getter={(form) =>
                                    form.discordUsers?.[0]?.username
                                }
                                readonly
                            />
                            <TextField<IUser>
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
                            <DateField
                                label="Date of Birth"
                                field="birthdate"
                            />
                            <TextField<IUser>
                                label="Age"
                                readonly
                                getter={(form) =>
                                    form.birthdate
                                        ? dateService
                                              .getAge(form.birthdate)
                                              ?.toString()
                                        : null
                                }
                            />
                            <DateField
                                label="Date Created"
                                field="createdAtUtc"
                                readonly
                            />
                            <SelectManyField<IUser>
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
                            <TextField<IUser>
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
                            <TextField<IUser>
                                label="City"
                                getter={(form) => form.location?.city}
                                readonly
                            />
                            <TextField<IUser>
                                label="County"
                                getter={(form) => form.location?.county}
                                readonly
                            />
                            <TextField<IUser>
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
                            <SelectManyField<IUser>
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
