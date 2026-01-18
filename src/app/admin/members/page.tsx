'use client'

import styles from './page.module.css'
import { ListElement, PaginatedList } from '@/components/admin/PaginatedList2'
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
import { Role, User, UserProfile, zRole, zUser, zUserProfile } from '@/contracts/data'
import { UpdateUserRequest } from '@/contracts/requests'
import { PaginatedResponse } from '@/contracts/responses'
import { dateService } from '@/services'
import {
    FetchError,
    // useCurrentUser,
    useFetch,
    usePaginatedSearch,
} from '@/util/hooks'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useMemo, useState } from 'react'

// import { PulseLoader } from 'react-spinners'

export default function Page() {
    const queryClient = useQueryClient()
    const { ready, onGet, onPatch } = useFetch()

    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [formState, setFormState] = useState<FormState<User> | null>(null)

    // const loggedInUser = useCurrentUser()

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch<UserProfile>('/users', zUserProfile)

    const { query: rolesQuery } = usePaginatedSearch<Role>('/roles', zRole, {
        search: { limit: 50 },
        all: true,
    })

    const roles = rolesQuery.data?.data ?? []
    const roleOptions = useMemo(
        () =>
            (rolesQuery.data?.data ?? []).map((role) => ({
                value: role.id,
                label: role.name,
            })),
        [rolesQuery.data]
    )

    const userQuery = useQuery({
        queryKey: [`/users/${selectedId}`],
        queryFn:
            ready && selectedId != null
                ? () =>
                      onGet<User>(`/users/${selectedId}`, zUser, {
                          query: {
                              includeDiscordUsers: true,
                              includeHistory: true,
                          },
                      })
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const updateMutation = useMutation<
        User,
        FetchError,
        { id: number; user: User; request: UpdateUserRequest },
        User
    >({
        mutationFn: ({ id, request }) => onPatch(`/users/${id}`, request, null),
        // When the mutation begins, optimistically update the cache to use the new state
        onMutate: ({ id, user }) => {
            const prev: User | undefined = queryClient.getQueryData([
                `/users/${id}`,
            ])
            queryClient.setQueryData([`/users/${id}`], user)
            queryClient.setQueryData(
                ['/users', search],
                (res: PaginatedResponse<Role>) => ({
                    ...res,
                    data: res.data.map((prev) =>
                        prev.id == user.id ? user : prev
                    ),
                })
            )
            return prev
        },
        // If an error occurs, rollback to the previous state
        onError: (error, { id }, prev) => {
            console.error(error)
            queryClient.setQueryData([`/users/${id}`], prev)
            queryClient.setQueryData(
                [`/users`, search],
                (res: PaginatedResponse<Role>) => ({
                    ...res,
                    data: res.data.map((user) =>
                        user.id == prev?.id ? prev : user
                    ),
                })
            )
        },
        // On success, update the cache to the returned value in case there are any discrepancies
        onSuccess: (data, { id }) => {
            queryClient.setQueryData([`/users/${id}`], data)
            queryClient.setQueryData(
                [`/users`, search],
                (res: PaginatedResponse<Role>) => ({
                    ...res,
                    data: res.data.map((user) =>
                        user.id == data.id ? data : user
                    ),
                })
            )
        },
        // After either success or failure, invalidate the caches to refresh from the server
        onSettled: (_data, _error, { id }) =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['/users', search] }),
                queryClient.invalidateQueries({
                    queryKey: [`/users/${id}`],
                }),
            ]),
    })

    const handleSelectItem = (value: UserProfile) => {
        if (value.id === selectedId) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedId(value.id)
    }

    const handleSave = (user: User) => {
        updateMutation.mutate({
            id: user.id,
            user,
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

    const makeTitle = (user: User | UserProfile) => {
        if (user.firstName && user.lastName)
            return `${user.firstName} ${user.lastName}`
        if (user.firstName) return user.firstName
        if (user.preferredName) return user.preferredName
        return user.email ?? ''
    }

    return (
        <>
            <PaginatedList
                search={search}
                count={searchQuery.data?.count}
                isPending={searchQuery.isPending}
                error={searchQuery.error}
                fields={[
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone Number' },
                    { value: 'zip', label: 'Zip Code' },
                    { value: 'county', label: 'County' },
                    { value: 'city', label: 'City' },
                    { value: 'state', label: 'State' },
                    { value: 'preferred_name', label: 'Preferred Name' },
                    { value: 'first_name', label: 'First Name' },
                    { value: 'last_name', label: 'Last Name' },
                    { value: 'birthdate', label: 'Birthdate' },
                    {
                        value: 'accepted_alerts',
                        label: 'Accepted Notifications',
                    },
                    { value: 'onboarding_stage', label: 'Onboarding Stage' },
                    { value: 'created_at_utc', label: 'Date Created' },
                    { value: 'joined_at_utc', label: 'Date Joined Server' },
                    {
                        value: 'completed_intake_utc',
                        label: 'Date Intake Done',
                    },
                    { value: 'aliases', label: 'Aliases' },
                    { value: 'discord_usernames', label: 'Discord Usernames' },
                ]}
                filters={[
                    {
                        label: 'Role',
                        value: 'roleIds',
                        options: roles.map((role) => ({
                            label: role.name,
                            value: role.id,
                        })),
                    },
                ]}
                onSearch={onSearch}
            >
                {searchQuery.data?.data?.map((item) => (
                    <ListElement
                        key={item.id}
                        selected={selectedId == item.id}
                        onClick={() => handleSelectItem(item)}
                    >
                        <ImageWithFallback
                            useFallback={!item.discordUsers?.[0].image}
                            src={`https://cdn.discordapp.com/avatars/${item.discordUsers?.[0].id}/${item.discordUsers?.[0].image ?? ''}`} // need to figure out alternative for this
                            alt="user profile picture"
                        />
                        <div className={styles.userMeta}>
                            <span className={styles.userName}>
                                {makeTitle(item)}
                            </span>
                            <span className={styles.userUsername}>
                                {item.discordUsers?.[0].username}
                            </span>
                        </div>
                        {/* <ImageWithFallback
                                    src=""
                                    alt="user profile picture"
                                    useFallback
                                />
                                <div className={styles.loading}>
                                    <PulseLoader size={8} color="#bbb" />
                                </div> */}
                    </ListElement>
                ))}
            </PaginatedList>

            <div className={styles.detailsPane}>
                {selectedId == null && (
                    <div className={styles.emptyState}>No user selected</div>
                )}
                {selectedId && userQuery.data && (
                    <Form<User>
                        key={selectedId}
                        form={userQuery.data}
                        title={makeTitle(userQuery.data)}
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
                                options={(userQuery.data.aliases ?? []).map(
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
                )}
            </div>
        </>
    )
}
