'use client'

import { MemberBanner } from './MemberBanner'
import styles from './page.module.css'
import { DonorView } from './panel_views/DonorView'
import { HistoryView } from './panel_views/HistoryView'
import { MemberView } from './panel_views/MemberView'
import { FilterTags, FilterTag } from '@/app/admin/layout/FilterTags'
import { ListElement, List } from '@/app/admin/layout/List'
import { DiscordAvatar } from '@/components/common'
import { FormState } from '@/components/common/forms'
import { TabSpec } from '@/components/common/tab_bar/TabBar'
import {
    ActBlueDonor,
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
import { usePositionQueries } from '@/queries'
import { useCurrentUser, useFetch, usePaginatedSearch } from '@/util/hooks'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { FaUsers, FaUserTag } from 'react-icons/fa'
import { FaClipboardUser, FaDollarSign, FaAddressCard } from 'react-icons/fa6'
import { PulseLoader } from 'react-spinners'
import z from 'zod'

type MemberTabKey = 'overview' | 'donorMatching' | 'history'

const tabs: TabSpec[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'donorMatching', label: 'Donations' },
    { key: 'history', label: 'History' },
]

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
    const [activeFilterTag, setActiveFilterTag] = useState<string>('all')

    const memberFilterTags: FilterTag[] = [
        {
            key: 'members',
            label: 'Members',
            icon: <FaUserTag />,
            color: '#5997E0',
            width: '11.65rem',
            activeRedirect: 'all',
            scrollLeft: 'members',
            scrollRight: 'all',
        },
        {
            key: 'server',
            label: 'Server Members',
            icon: <FaClipboardUser />,
            color: '#62A46C',
            width: '11.65rem',
            activeRedirect: 'all',
            scrollLeft: 'members',
            scrollRight: 'all',
        },
        {
            key: 'donors',
            label: 'Donors',
            icon: <FaDollarSign />,
            color: '#7674B3',
            width: '11.65rem',
            activeRedirect: 'all',
            scrollLeft: 'members',
            scrollRight: 'all',
        },
        {
            key: 'dues',
            label: 'Membership',
            icon: <FaAddressCard />,
            color: '#C65882',
            width: '11.65rem',
            activeRedirect: 'all',
            scrollLeft: 'members',
            scrollRight: 'all',
        },
        {
            key: 'all',
            label: 'All Users',
            icon: <FaUsers />,
            color: '#3A3A3C',
            width: '8.4rem',
            activeRedirect: 'members',
            scrollLeft: 'members',
            scrollRight: 'all',
        },
    ]

    const handleFilterTagChange = (key: string) => {
        setActiveFilterTag(key)
        //others blank on purpose waiting for API side logic to be implemented.
        const rest = Object.fromEntries(
            Object.entries(search).filter(
                ([k]) =>
                    ![
                        'isMember',
                        'isDonor',
                        'isDuesPaying',
                        'isServerMember',
                    ].includes(k)
            )
        )
        const tagFilters: Record<string, (string | number | boolean)[]> = {}
        tagFilters.isDonor = [key === 'donors']
        tagFilters.isDuesPaying = [key === 'dues']
        onSearch({ ...rest, page: 0, ...tagFilters })
    }

    const loggedInUser = useCurrentUser()
    const positionQueries = usePositionQueries()

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch('/users', zUserProfile, {
        search: { sort: SortDirection.DESC, sortField: 'created_at_utc' },
    })

    const { query: rolesQuery } = usePaginatedSearch('/roles', zRole, {
        search: { limit: 50 },
        all: true,
    })

    const {
        query: donorSearchQuery,
        search: donorSearch,
        onSearch: onDonorSearch,
    } = usePaginatedSearch('/actblue/donors', zActBlueDonor)

    const positionHierarchy = useQuery({
        queryKey: ['positionHierarchy'],
        queryFn: positionQueries.getPositionHierarchy,
        enabled: positionQueries.ready,
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
                ? ({ signal }) =>
                      onGet('/users/:userId', zUser, {
                          params: { userId: selectedId },
                          query: {
                              includeDiscordUsers: true,
                              includeHistory: true,
                              includeDonors: true,
                          },
                          signal,
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
            const result = await onPatch('/users/:userId', request, zUser, {
                params: { userId: id },
            })
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

            await onPost(
                '/actblue/donors/:donorEmail/link',
                {
                    userId,
                    metaData: {
                        dataSource: 'Member Panel',
                        userWhoUpdatedId: loggedInUser.data?.id,
                    },
                } satisfies ActBlueDonorLinkRequest,
                null,
                { params: { donorEmail: value.email } }
            )

            await queryClient.invalidateQueries({
                queryKey: [`/users/${userId}`],
            })
        },
        [onPost, queryClient, loggedInUser.data]
    )

    const handleDeleteDonorItem = useCallback(
        async (value: ActBlueDonor, userId: number) => {
            await onPost(
                '/actblue/donors/:donorEmail/link',
                {
                    userId: null,
                    metaData: {
                        dataSource: 'Member Panel',
                        userWhoUpdatedId: loggedInUser.data?.id,
                    },
                },
                null,
                { params: { donorEmail: value.email } }
            )

            await queryClient.invalidateQueries({
                queryKey: [`/users/${userId}`],
            })
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
            ready && formState?.mode === 'edit' && formState.form.address?.zip
                ? async ({ signal }) => {
                      try {
                          return await onGet('/locations/:zip', zLocation, {
                              params: { zip: formState.form.address.zip! },
                              signal,
                          })
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
                    onClick={() => void handleSelectDonorItem(item, userId)}
                >
                    <span>{`${item.firstname} ${item.lastname}`}</span>
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

    const renderPage = () => {
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
                        editing={formState?.mode === 'edit'}
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
                        handleDeleteDonorItem={(value, userId) =>
                            void handleDeleteDonorItem(value, userId)
                        }
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
    }

    return (
        <>
            <div className={styles.listWidth}>
                <List
                    search={search}
                    count={searchQuery.data?.count}
                    isPending={searchQuery.isPending}
                    error={searchQuery.error}
                    listLabel={
                        activeFilterTag === 'members'
                            ? 'Members'
                            : activeFilterTag === 'server'
                              ? 'Server Members'
                              : activeFilterTag === 'donors'
                                ? 'Donors'
                                : activeFilterTag === 'dues'
                                  ? 'Dues Paying Members'
                                  : 'Users'
                    }
                    headerContent={
                        <div className={styles.filterTagsWrapper}>
                            <FilterTags
                                tags={memberFilterTags}
                                activeTag={activeFilterTag}
                                onChange={handleFilterTagChange}
                            />
                        </div>
                    }
                    searchFields={[
                        { value: 'first_name', label: 'First Name' },
                        { value: 'last_name', label: 'Last Name' },
                        {
                            value: 'discord_usernames',
                            label: 'Discord Username',
                        },
                        { value: 'email', label: 'Email' },
                        { value: 'phone', label: 'Phone Number' },
                        { value: 'zip', label: 'Zip Code' },
                        { value: 'birthdate', label: 'Birthdate' },
                        { value: 'created_at_utc', label: 'Join Date' },
                        // { value: 'county', label: 'County' },
                        // { value: 'city', label: 'City' },
                        // { value: 'state', label: 'State' },
                        // { value: 'preferred_name', label: 'Preferred Name' },

                        // {
                        //     value: 'accepted_alerts',
                        //     label: 'Accepted Notifications',
                        // },
                        // { value: 'onboarding_stage', label: 'Onboarding Stage' },
                        // { value: 'joined_at_utc', label: 'Date Joined Server' },
                        // {
                        //     value: 'completed_intake_utc',
                        //     label: 'Date Intake Done',
                        // },
                        // { value: 'aliases', label: 'Aliases' },
                    ]}
                    sortFields={[
                        { value: 'email', label: 'Email' },
                        { value: 'first_name', label: 'First Name' },
                        { value: 'last_name', label: 'Last Name' },
                        { value: 'created_at_utc', label: 'Created At' },
                        { value: 'updated_at_utc', label: 'Date Modified' },
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
            </div>

            <div className={styles.detailsPane}>
                {selectedId == null && (
                    <div className={styles.emptyState}>No user selected</div>
                )}
                {selectedId && userQuery.data && (
                    <>
                        <div className={styles.detailsHeader}>
                            <div className={styles.bannerCover} />
                            <MemberBanner
                                user={userQuery.data}
                                makeTitle={makeTitle}
                                selectedTab={selectedTab}
                                tabs={tabs}
                                onTabChange={(key) =>
                                    setSelectedTab(key as MemberTabKey)
                                }
                                positions={positionHierarchy.data?.positions}
                            />
                        </div>
                        <div className={styles.detailsContent}>
                            {renderPage()}
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
