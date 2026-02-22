'use client'

import styles from './page.module.css'
import { DonorView } from './panel_views/DonorView'
import { MemberView } from './panel_views/MemberView'
import { ListElement, List } from '@/app/admin/layout/List'
import { DiscordAvatar } from '@/components/common'
import { FormState } from '@/components/common/forms'
import { Tab } from '@/components/common/tab_bar/Tab'
import { TabBar } from '@/components/common/tab_bar/TabBar'
import {
    ActBlueDonor,
    Location,
    Role,
    UpdateHistory,
    User,
    UserProfile,
    zActBlueDonor,
    zLocation,
    zRole,
    zUser,
    zUserProfile,
} from '@/contracts/data'
import { UpdateUserRequest } from '@/contracts/requests'
import { PaginatedResponse } from '@/contracts/responses'
import { FetchError } from '@/models'
import { useCurrentUser, useFetch, usePaginatedSearch } from '@/util/hooks'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryResult,
} from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { PulseLoader } from 'react-spinners'

export default function Page() {
    const queryClient = useQueryClient()
    const { ready, onGet, onPatch, onPost } = useFetch()

    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [selectedHistory, setSelectedHistory] =
        useState<UpdateHistory<User> | null>(null)
    const [formState, setFormState] = useState<FormState<User> | null>(null)
    const [pickingDonor, setPickingDonor] = useState<boolean>(false)

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

    const {
        query: donorSearchQuery,
        search: donorSearch,
        onSearch: onDonorSearch,
    } = usePaginatedSearch<ActBlueDonor>('/actblue/donors', zActBlueDonor) as {
        query: UseQueryResult<PaginatedResponse<ActBlueDonor>, FetchError>
        search: ReturnType<typeof usePaginatedSearch<ActBlueDonor>>['search']
        onSearch: ReturnType<
            typeof usePaginatedSearch<ActBlueDonor>
        >['onSearch']
    }

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
                              includeDonors: true,
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

    const handleSelectDonorItem = useCallback(
        async (value: ActBlueDonor, userId: number) => {
            setPickingDonor(false)
            await onPost<void>(
                `/actblue/donors/${value.email}/link`,
                { userId },
                null
            )
            await queryClient.invalidateQueries({
                queryKey: [`/users/${userId}`],
            })
        },
        [onPost, queryClient]
    )

    const handleDeleteDonorItem = useCallback(
        (value: ActBlueDonor, userId) => {
            void onPost<void>(
                `/actblue/donors/${value.email}/link`,
                { userId: null },
                null
            ).then(() =>
                queryClient.invalidateQueries({
                    queryKey: [`/users/${userId}`],
                })
            )
        },
        [onPost, queryClient]
    )

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

    const renderDonorItem = useCallback(
        (item: ActBlueDonor, userId: number) => {
            return (
                <ListElement
                    key={item.email}
                    selected={false}
                    onClick={() => void handleSelectDonorItem(item, userId)}
                >
                    <div>
                        <span>{`${item.firstname} ${item.lastname}`}</span>
                    </div>
                </ListElement>
            )
        },
        [handleSelectDonorItem]
    )

    const renderItem = (item: User | UserProfile) => {
        return (
            <ListElement
                key={item.id}
                selected={selectedId == item.id}
                onClick={() => handleSelectItem(item)}
            >
                <DiscordAvatar
                    discordUserId={item.discordUsers?.[0]?.id}
                    imageId={item.discordUsers?.[0]?.image}
                    size={48}
                />
                <div className={styles.userMeta}>
                    <span className={styles.userName}>{makeTitle(item)}</span>
                    <span className={styles.userUsername}>
                        {item.discordUsers?.[0]?.username ?? 'NOT FOUND'}
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
            <List
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
                                <DiscordAvatar
                                    discordUserId={undefined}
                                    imageId={undefined}
                                    size={48}
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
            </List>

            <div className={styles.detailsPane}>
                {selectedId == null && (
                    <div className={styles.emptyState}>No user selected</div>
                )}

                {selectedId && userQuery.data && (
                    <TabBar>
                        <Tab key="overview" label="Overview">
                            <MemberView
                                selectedId={selectedId}
                                user={userQuery.data}
                                selectedHistory={selectedHistory}
                                onSelectHistory={handleSelectHistory}
                                formState={formState}
                                setFormState={setFormState}
                                saving={updateMutation.isPending}
                                isInvalid={
                                    !!formState?.form?.location?.zip &&
                                    locationQuery.data == null
                                }
                                roles={roles}
                                roleOptions={roleOptions}
                                makeFormTitle={() =>
                                    makeFormTitle(userQuery.data)
                                }
                                handleSave={handleSave}
                                getLocation={getLocation}
                            />
                        </Tab>

                        <Tab key="donorMatching" label="Donations">
                            <DonorView
                                selectedId={selectedId}
                                user={userQuery.data}
                                pickingDonor={pickingDonor}
                                setPickingDonor={setPickingDonor}
                                isRefetching={userQuery.isRefetching}
                                donorSearch={donorSearch}
                                donorSearchQuery={donorSearchQuery}
                                onDonorSearch={onDonorSearch}
                                renderDonorItem={renderDonorItem}
                                handleDeleteDonorItem={handleDeleteDonorItem}
                            />
                        </Tab>
                    </TabBar>
                )}
            </div>
        </>
    )
}
