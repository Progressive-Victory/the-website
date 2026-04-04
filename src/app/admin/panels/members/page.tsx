'use client'

import styles from './page.module.css'
import { DonorView } from './panel_views/DonorView'
import { HistoryView } from './panel_views/HistoryView'
import { MemberView } from './panel_views/MemberView'
import { ListElement, List } from '@/app/admin/layout/List'
import { DiscordAvatar } from '@/components/common'
import { FormState } from '@/components/common/forms'
import { TabBar, TabSpec } from '@/components/common/tab_bar/TabBar'
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
import {
    ActBlueDonorLinkRequest,
    SortDirection,
    UpdateUserRequest,
    zUpdateUserRequest,
} from '@/contracts/requests'
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
import { useCallback, useMemo, useState, useEffect } from 'react'
import { PulseLoader } from 'react-spinners'
import z from 'zod'

type MemberTabKey = 'overview' | 'donorMatching' | 'history'

export default function Page() {
    const queryClient = useQueryClient()
    const { ready, onGet, onPatch, onPost } = useFetch()

    const [selectedId, setSelectedId] = useState<number | null>(null)

    const [selectedHistory, setSelectedHistory] =
        useState<UpdateHistory<User> | null>(null)
    const [selectedDonorHistory, setSelectedDonorHistory] =
        useState<UpdateHistory<ActBlueDonor> | null>(null)

    const [formState, setFormState] = useState<FormState<User> | null>(null)
    const [pickingDonor, setPickingDonor] = useState<boolean>(false)
    const [selectedTab, setSelectedTab] = useState<MemberTabKey>('overview')

    const loggedInUser = useCurrentUser()

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch<UserProfile>('/users', zUserProfile)

    const { query: rolesQuery } = usePaginatedSearch<Role>('/roles', zRole, {
        search: { limit: 50, sort: SortDirection.DESC },
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

    const roles = useMemo(() => rolesQuery.data?.data ?? [], [rolesQuery.data])
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
                {
                    userId,
                    metaData: {
                        dataSource: 'Member Panel',
                        userWhoUpdatedId: loggedInUser.data?.id,
                    },
                } satisfies ActBlueDonorLinkRequest,
                null
            )

            await queryClient.invalidateQueries({
                queryKey: [`/users/${userId}`],
            })
        },
        [onPost, queryClient, loggedInUser.data]
    )

    const handleDeleteDonorItem = useCallback(
        (value: ActBlueDonor, userId: number) => {
            void onPost<void>(
                `/actblue/donors/${value.email}/link`,
                {
                    userId: null,
                    metaData: {
                        dataSource: 'Member Panel',
                        userWhoUpdatedId: loggedInUser.data?.id,
                    },
                },
                null
            ).then(() =>
                queryClient.invalidateQueries({
                    queryKey: [`/users/${userId}`],
                })
            )
        },
        [onPost, queryClient, loggedInUser.data?.id]
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

        setSelectedHistory(null)
        setSelectedDonorHistory(null)
        setSelectedTab('overview')
    }

    const locationQuery = useQuery({
        queryKey: [`/locations/${formState?.form?.address?.zip}`],
        queryFn:
            ready && formState?.editing && formState.form.address?.zip
                ? async () => {
                      try {
                          return await onGet<Location>(
                              `/locations/${formState.form.address?.zip}`,
                              zLocation
                          )
                      } catch {
                          return null
                      }
                  }
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const handleSave = useCallback(
        (user: User) => {
            const orNull = (value: string | null | undefined) =>
                value?.length ? value : null

            const address = {
                addressLine1: orNull(user.address.addressLine1?.trim()),
                addressLine2: orNull(user.address.addressLine2?.trim()),
                city:
                    orNull(user.address.city?.trim()) ??
                    locationQuery.data?.city,
                county:
                    orNull(user.address.county?.trim()) ??
                    locationQuery.data?.county,
                state:
                    orNull(user.address.state?.trim()) ??
                    locationQuery.data?.state,
                zip:
                    orNull(user.address.zip?.trim()) ??
                    locationQuery.data?.zip?.toString().padStart(5, '0'),
            }

            const oldAddress = userQuery.data?.address ?? null
            const addressIsDirty =
                address.addressLine1 != oldAddress?.addressLine1 ||
                address.addressLine2 != oldAddress?.addressLine2 ||
                address.city != oldAddress?.city ||
                address.county != oldAddress?.county ||
                address.state != oldAddress?.state ||
                address.zip != oldAddress?.zip

            const request: UpdateUserRequest = z.parse(zUpdateUserRequest, {
                email: user.email,
                phone: user.phone,
                preferredName: user.preferredName,
                firstName: user.firstName,
                lastName: user.lastName,
                birthdate: user.birthdate,
                membershipCardStatus: +user.membershipCardStatus,
                membershipMerchStatus: +user.membershipMerchStatus,
                shirtSize: user.shirtSize,
                duesPayingMember: user.duesPayingMember,
                membershipFulfillmentStatus: user.membershipFulfillmentStatus
                    ? +user.membershipFulfillmentStatus
                    : null,
                nameConfirmed: user.nameConfirmed,
                addressConfirmed: user.addressConfirmed,
                roles: user.roles?.map((role) => role.id),
            } satisfies UpdateUserRequest)
            if (addressIsDirty) request.address = address

            updateMutation.mutate({ id: user.id, user, request })
        },
        [locationQuery.data, updateMutation, userQuery.data?.address]
    )

    const makeTitle = useCallback((user: User | UserProfile) => {
        if (user.firstName && user.lastName)
            return `${user.firstName} ${user.lastName}`
        if (user.firstName) return user.firstName
        if (user.preferredName) return user.preferredName
        return user.email ?? ''
    }, [])

    const normalizeMeridiem = useCallback((value: string) => {
        return value.replace(/\s*([AP])M\b/g, (_, period: string) => {
            return `${period.toLowerCase()}m`
        })
    }, [])

    const makeHistoryFormTitle = useCallback(
        (user: User | UserProfile) => {
            const name = makeTitle(user)
            if (!selectedHistory) return name
            return `${name} @ ${normalizeMeridiem(selectedHistory.historyWhenUpdatedUtc.toLocaleString())}`
        },
        [makeTitle, normalizeMeridiem, selectedHistory]
    )

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

    const tabs: TabSpec[] = useMemo(
        () => [
            { key: 'overview', label: 'Overview' },
            { key: 'donorMatching', label: 'Donations' },
            { key: 'history', label: 'History' },
        ],
        []
    )

    const pane = useMemo(() => {
        if (!selectedId || !userQuery.data) return null

        switch (selectedTab) {
            case 'overview':
                return (
                    <MemberView
                        selectedId={selectedId}
                        user={userQuery.data}
                        selectedHistory={null}
                        setFormState={setFormState}
                        saving={updateMutation.isPending}
                        isInvalid={
                            (formState?.form?.address?.zip != null &&
                                locationQuery.data == null) ||
                            locationQuery.isPending
                        }
                        roles={roles}
                        roleOptions={roleOptions}
                        makeFormTitle={() => makeTitle(userQuery.data)}
                        handleSave={handleSave}
                    />
                )

            case 'donorMatching':
                return (
                    <DonorView
                        key={userQuery.data.id}
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
                )

            case 'history':
                return (
                    <HistoryView
                        selectedId={selectedId}
                        user={userQuery.data}
                        selectedHistory={selectedHistory}
                        onSelectHistory={setSelectedHistory}
                        selectedDonorHistory={selectedDonorHistory}
                        onSelectDonorHistory={setSelectedDonorHistory}
                        isRefetching={userQuery.isRefetching}
                        roles={roles}
                        roleOptions={roleOptions}
                        makeFormTitle={(u) => makeHistoryFormTitle(u)}
                    />
                )

            default:
                return null
        }
    }, [
        selectedId,
        userQuery.data,
        userQuery.isRefetching,
        selectedTab,
        formState,
        updateMutation.isPending,
        locationQuery.data,
        locationQuery.isPending,
        roles,
        roleOptions,
        pickingDonor,
        donorSearch,
        donorSearchQuery,
        onDonorSearch,
        renderDonorItem,
        handleDeleteDonorItem,
        selectedHistory,
        selectedDonorHistory,
        handleSave,
        makeTitle,
        makeHistoryFormTitle,
    ])

    return (
        <>
            <List
                search={search}
                count={searchQuery.data?.count}
                isPending={searchQuery.isPending}
                error={searchQuery.error}
                searchFields={[
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
                sortFields={[
                    { value: 'email', label: 'Email' },
                    { value: 'first_name', label: 'First Name' },
                    { value: 'last_name', label: 'Last Name' },
                    { value: 'created_at_utc', label: 'Created At' },
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
                    <>
                        <div className={styles.detailsHeader}>
                            <div className={styles.bannerCover} />
                            <div className={styles.headerTop}>
                                <div className={styles.cardStyle}>
                                    <div className={styles.cardAvatar}>
                                        <DiscordAvatar
                                            discordUserId={
                                                userQuery.data.discordUsers?.[0]
                                                    ?.id
                                            }
                                            imageId={
                                                userQuery.data.discordUsers?.[0]
                                                    ?.image
                                            }
                                            size={64}
                                        />
                                    </div>
                                    <div className={styles.userInfo}>
                                        <h1 className={styles.headerUserName}>
                                            {makeTitle(userQuery.data)}
                                        </h1>
                                        <h2
                                            className={
                                                styles.headerUserUsername
                                            }
                                        >
                                            {userQuery.data.discordUsers?.[0]
                                                ?.username
                                                ? `@${userQuery.data.discordUsers[0].username}`
                                                : 'NOT FOUND'}
                                        </h2>
                                    </div>
                                </div>
                                <div className={styles.roleList}>
                                    {userQuery.data.roles?.length ? (
                                        userQuery.data.roles.map((role) => (
                                            <span
                                                key={role.id}
                                                className={styles.rolePill}
                                            >
                                                {role.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className={styles.roleEmpty}>
                                            No roles assigned
                                        </span>
                                    )}
                                </div>
                                <TabBar
                                    tabs={tabs}
                                    value={selectedTab}
                                    onChange={(key) =>
                                        setSelectedTab(key as MemberTabKey)
                                    }
                                />
                            </div>
                        </div>
                        <div className={styles.detailsContent}>{pane}</div>
                    </>
                )}
            </div>
        </>
    )
}
