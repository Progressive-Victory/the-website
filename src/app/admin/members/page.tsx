'use client'

import styles from './page.module.css'
import { ListElement, PaginatedList } from '@/components/admin/PaginatedList'
import { CollapsibleSection, ImageWithFallback } from '@/components/common'
import {
    CheckboxField,
    DateField,
    Form,
    FormGroup,
    FormGroupProps,
    FormState,
    SelectManyField,
    TextField,
} from '@/components/form'
import {
    Location,
    Role,
    UpdateHistory,
    User,
    UserProfile,
    zLocation,
    zRole,
    zUser,
    zUserProfile,
} from '@/contracts/data'
import { UpdateUserRequest } from '@/contracts/requests'
import { PaginatedResponse } from '@/contracts/responses'
import { FetchError } from '@/models'
import { dateService } from '@/services'
import { useCurrentUser, useFetch, usePaginatedSearch } from '@/util/hooks'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import cx from 'classnames'
import { useMemo, useState } from 'react'
import { PulseLoader } from 'react-spinners'

export default function Page() {
    const queryClient = useQueryClient()
    const { ready, onGet, onPatch } = useFetch()

    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [selectedHistory, setSelectedHistory] =
        useState<UpdateHistory<User> | null>(null)
    const [formState, setFormState] = useState<FormState<User> | null>(null)

    const loggedInUser = useCurrentUser()

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

    const formZip = formState?.editing
        ? formState?.form?.location?.zip
        : userQuery.data?.location?.zip
    const locationQuery = useQuery({
        queryKey: [`/locations/${formZip}`],
        queryFn:
            ready && formZip != null
                ? async () => {
                      try {
                          return await onGet<Location>(
                              `/locations/${formZip}`,
                              zLocation
                          )
                      } catch {
                          return null
                      }
                  }
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const updateMutation = useMutation<
        User,
        FetchError,
        { id: number; user: User; request: UpdateUserRequest },
        User | undefined
    >({
        mutationFn: async ({ id, user, request }) => {
            const result = await onPatch<User>(`/users/${id}`, request, zUser)
            return { ...user, ...result }
        },
        // When the mutation begins, optimistically update the cache to use the new state
        onMutate: ({ id, user }) => {
            const prev: User | undefined = queryClient.getQueryData([
                `/users/${id}`,
            ])
            queryClient.setQueryData([`/users/${id}`], user)
            if (id == loggedInUser.data?.id)
                queryClient.setQueryData(['/users/current'], user)
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
            if (id == loggedInUser.data?.id)
                queryClient.setQueryData(['/users/current'], prev)
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
            if (id == loggedInUser.data?.id)
                queryClient.setQueryData(['/users/current'], data)
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
                queryClient.invalidateQueries({ queryKey: ['/users/current'] }),
                queryClient.invalidateQueries({
                    queryKey: [`/users/${id}`],
                }),
            ]),
    })

    const handleSelectItem = (value: UserProfile | User) => {
        if (value?.id === selectedId) return

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
                email: user.email,
                phone: user.phone,
                preferredName: user.preferredName,
                firstName: user.firstName,
                lastName: user.lastName,
                birthdate: user.birthdate,
                zipCode: user.location?.zip ?? null,
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

    const makeFormTitle = (user: User | UserProfile) => {
        const name = makeTitle(user)
        if (!selectedHistory) return name
        return `${name} @ ${selectedHistory.historyWhenUpdatedUtc.toLocaleString()}`
    }

    const renderItem = (item: User | UserProfile) => {
        return (
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
                    <span className={styles.userName}>{makeTitle(item)}</span>
                    <span className={styles.userUsername}>
                        {item.discordUsers?.[0].username}
                    </span>
                </div>
            </ListElement>
        )
    }

    const getLocation = (form: User) => {
        if (!formState?.editing) return form.location
        if (form.location?.zip) return locationQuery.data ?? null
        return null
    }

    const handleSelectHistory = (history: UpdateHistory<User> | null) => {
        if (history)
            setSelectedHistory({ ...(userQuery.data ?? {}), ...history })
        else setSelectedHistory(null)
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
                pinnedContent={
                    loggedInUser.data ? (
                        renderItem(loggedInUser.data)
                    ) : (
                        <ul>
                            <ListElement>
                                <ImageWithFallback
                                    src=""
                                    alt="user profile picture"
                                    useFallback
                                />
                                <div className={styles.loading}>
                                    <PulseLoader size={8} color="#bbb" />
                                </div>
                            </ListElement>
                        </ul>
                    )
                }
                onSearch={onSearch}
            >
                {searchQuery.data?.data?.map((item) => renderItem(item))}
            </PaginatedList>

            <div className={styles.detailsPane}>
                {selectedId == null && (
                    <div className={styles.emptyState}>No user selected</div>
                )}
                {selectedId && userQuery.data && (
                    <Form<User>
                        key={selectedId}
                        form={selectedHistory ?? userQuery.data}
                        title={makeFormTitle(userQuery.data)}
                        readonly={selectedHistory != null}
                        saving={updateMutation.isPending}
                        isInvalid={
                            !!formState?.form?.location?.zip &&
                            locationQuery.data == null
                        }
                        onUpdate={setFormState}
                        onSave={handleSave}
                    >
                        <FormGroup title="Account Information">
                            <TextField<User>
                                label="Discord Username"
                                getter={(form) =>
                                    (form.discordUsers ?? [])
                                        ?.map(({ username }) => `@${username}`)
                                        .join(', ')
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
                                    dateService.isValid(form.birthdate)
                                        ? new Date(
                                              dateService.toISODateString(
                                                  form.birthdate
                                              )!
                                          )
                                        : null
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
                                    form.location?.zip
                                        ? form.location?.zip
                                              .toString()
                                              .padStart(5, '0')
                                              .slice(-5)
                                        : null
                                }
                                setter={(form, field) => ({
                                    ...form,
                                    location: field
                                        ? {
                                              ...(userQuery.data.location ?? {
                                                  city: '',
                                                  county: '',
                                                  state: '',
                                              }),
                                              zip: +field
                                                  .replace(/[^\d]/, '')
                                                  .padStart(5, '0')
                                                  .slice(-5),
                                          }
                                        : null,
                                })}
                            />
                            <TextField<User>
                                label="City"
                                getter={(form) => getLocation(form)?.city}
                                readonly
                            />
                            <TextField<User>
                                label="County"
                                getter={(form) => getLocation(form)?.county}
                                readonly
                            />
                            <TextField<User>
                                label="State"
                                getter={(form) => getLocation(form)?.state}
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

                        {!formState?.editing &&
                            !!userQuery.data?.history?.length && (
                                <AccountHistoryField
                                    title="Account History"
                                    history={userQuery.data?.history}
                                    selected={selectedHistory}
                                    onSelect={handleSelectHistory}
                                    defaultCollapsed
                                />
                            )}
                    </Form>
                )}
            </div>
        </>
    )
}

interface AccountHistoryFieldProps extends FormGroupProps<User> {
    history?: UpdateHistory<User>[]
    selected: UpdateHistory<User> | null
    onSelect: (update: UpdateHistory<User> | null) => void
}

function AccountHistoryField({
    title,
    defaultCollapsed,
    history,
    selected,
    onSelect,
}: AccountHistoryFieldProps) {
    const value = (history ?? []).sort(
        (a, b) =>
            b.historyWhenUpdatedUtc.getTime() -
            a.historyWhenUpdatedUtc.getTime()
    )

    return (
        <CollapsibleSection title={title} initialOpenState={!defaultCollapsed}>
            <div className={styles.historyContainer}>
                {value.map((update, i) => (
                    <div key={i}>
                        <button
                            onClick={() => onSelect(i ? update : null)}
                            className={cx(
                                styles.historyEntry,
                                (selected?.historyId == update.historyId ||
                                    (!i && !selected)) &&
                                    styles.selected
                            )}
                        >
                            <span color="#4b5563">{`${update.historyType == 'I' ? 'Created' : 'Updated'} at `}</span>
                            <span className={styles.historyEntryDate}>
                                {update.historyWhenUpdatedUtc.toLocaleString()}
                            </span>
                            <span color="#4b5563">{' by '}</span>
                            <code>
                                {update.email ?? 'deleted user'}#
                                {update.id.toString()}
                            </code>
                        </button>
                    </div>
                ))}
            </div>
        </CollapsibleSection>
    )
}
