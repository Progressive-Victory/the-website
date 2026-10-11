'use client'

import {
    buildPendingUpdates,
    isValidAddressDraft,
    isValidPhone,
    mapPacketToMember,
    discordKey,
    nameKey,
    normalizeEmail,
    phoneKey,
} from './membership.helpers'
import {
    DescribeChange,
    EditController,
    HistoryEntry,
    Member,
    MemberEdits,
    PendingUpdate,
} from './membership.types'
import {
    useCurrentUser,
    useFetch,
    useInfiniteScroll,
    usePaginatedSearch,
} from '@/util/hooks'
import {
    skipToken,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { User, UserProfile, zUser, zUserProfile } from 'pv-contracts/data'
import {
    ActBlueDonorLinkRequest,
    UpdateMembershipRequest,
} from 'pv-contracts/requests'
import type { MembershipSearchRequest } from 'pv-contracts/requests'
import {
    zMembershipsResponsePacket,
    zPaginatedResponse,
} from 'pv-contracts/responses'
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react'

const HISTORY_STALE_TIME = 5 * 60 * 1000
const HISTORY_LIMIT = 5
const USER_MATCH_LIMIT = 10
const PAGE_SIZE = 250
// # TODO Make these part of API settings
const COLUMN_ORDER_STORAGE_KEY = 'membership.columnOrder'
const TABLE_OPTIONS_STORAGE_KEY = 'membership.tableOptions'
const EMPTY_DRAFT: MemberEdits = {}
const noopUnsubscribe = () => undefined

export function useColumnOrder() {
    const [columnOrder, setColumnOrder] = useState<string[]>([])

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(COLUMN_ORDER_STORAGE_KEY)
            if (raw == null) return

            const parsed: unknown = JSON.parse(raw)
            if (
                Array.isArray(parsed) &&
                parsed.every((id) => typeof id === 'string')
            )
                setColumnOrder(parsed)
        } catch {
            console.error('Failed to parse column order from localStorage')
        }
    }, [])

    const onColumnOrderChange = useCallback((order: string[]) => {
        setColumnOrder(order)
        try {
            window.localStorage.setItem(
                COLUMN_ORDER_STORAGE_KEY,
                JSON.stringify(order)
            )
        } catch {
            console.error('Failed to save column order to localStorage')
        }
    }, [])

    const resetColumnOrder = useCallback(() => {
        setColumnOrder([])
        try {
            window.localStorage.removeItem(COLUMN_ORDER_STORAGE_KEY)
        } catch {
            console.error('Failed to reset column order in localStorage')
        }
    }, [])

    return { columnOrder, onColumnOrderChange, resetColumnOrder }
}

export function useFieldHistory<T extends HistoryEntry>({
    userId,
    selectHistory,
    describeChange,
}: {
    userId?: number
    selectHistory: (user: User) => T[]
    describeChange: DescribeChange<T>
}) {
    const { ready, onGet } = useFetch()

    const userQuery = useQuery({
        queryKey: ['/users/:userId', userId, { includeHistory: true }],
        queryFn:
            ready && userId != null
                ? ({ signal }: { signal: AbortSignal }) =>
                      onGet('/users/:userId', zUser, {
                          params: { userId },
                          query: { includeHistory: true },
                          signal,
                      })
                : skipToken,
        staleTime: HISTORY_STALE_TIME,
    })

    const history = useMemo(() => {
        const user = userQuery.data
        const ascending = (user ? selectHistory(user) : [])
            .slice()
            .sort(
                (a, b) =>
                    a.historyWhenUpdatedUtc.getTime() -
                    b.historyWhenUpdatedUtc.getTime()
            )

        const entries: {
            update: T
            label: string
            value: string
        }[] = []
        let previous: T | undefined

        for (const update of ascending) {
            const change = describeChange(update, previous)
            if (!change) continue
            entries.push({ update, ...change })
            previous = update
        }

        return entries.reverse().slice(0, HISTORY_LIMIT)
    }, [userQuery.data, selectHistory, describeChange])

    return {
        history,
        isPending: userQuery.isPending,
        isError: userQuery.isError,
    }
}

export function useMemberEdits() {
    const editsRef = useRef<Record<string, MemberEdits>>({})
    const memberListeners = useRef(new Map<string, Set<() => void>>())
    const allListeners = useRef(new Set<() => void>())

    const editController = useMemo<EditController>(() => {
        const subscribeTo = (set: Set<() => void>, listener: () => void) => {
            set.add(listener)
            return () => {
                set.delete(listener)
            }
        }

        return {
            draftOf: (member: Member) =>
                (member.donorEmail != null
                    ? editsRef.current[member.donorEmail]
                    : undefined) ?? EMPTY_DRAFT,
            update: (member: Member, patch: MemberEdits) => {
                const donorEmail = member.donorEmail
                if (donorEmail == null) return
                editsRef.current = {
                    ...editsRef.current,
                    [donorEmail]: {
                        ...editsRef.current[donorEmail],
                        ...patch,
                    },
                }
                memberListeners.current
                    .get(donorEmail)
                    ?.forEach((listener) => listener())
                allListeners.current.forEach((listener) => listener())
            },
            subscribeMember: (donorEmail: string, listener: () => void) => {
                let listeners = memberListeners.current.get(donorEmail)
                if (!listeners) {
                    listeners = new Set()
                    memberListeners.current.set(donorEmail, listeners)
                }
                return subscribeTo(listeners, listener)
            },
            subscribeAll: (listener: () => void) =>
                subscribeTo(allListeners.current, listener),
            getEdits: () => editsRef.current,
        }
    }, [])

    const clearEdits = useCallback(() => {
        editsRef.current = {}
        memberListeners.current.forEach((listeners) =>
            listeners.forEach((listener) => listener())
        )
        allListeners.current.forEach((listener) => listener())
    }, [])

    return { editController, clearEdits }
}

export function useMemberDraft(edit: EditController, member: Member) {
    const donorEmail = member.donorEmail

    const subscribe = useCallback(
        (listener: () => void) =>
            donorEmail != null
                ? edit.subscribeMember(donorEmail, listener)
                : noopUnsubscribe,
        [edit, donorEmail]
    )

    const getDraft = useCallback(() => edit.draftOf(member), [edit, member])

    return useSyncExternalStore(subscribe, getDraft, getDraft)
}

function useUserSearch(query?: string, searchField?: string) {
    const { ready, onGet } = useFetch()

    return useQuery({
        queryKey: ['/users', { query, searchField, limit: USER_MATCH_LIMIT }],
        queryFn:
            ready && query
                ? ({ signal }: { signal: AbortSignal }) =>
                      onGet('/users', zPaginatedResponse(zUserProfile), {
                          query: {
                              query,
                              searchField,
                              limit: USER_MATCH_LIMIT,
                          },
                          signal,
                      })
                : skipToken,
        staleTime: HISTORY_STALE_TIME,
    })
}

export function useUserByEmail(email?: string) {
    const normalized = email ? normalizeEmail(email) : undefined
    const query = useUserSearch(normalized)

    const match = query.data?.data.find(
        (user) =>
            user.email != null && normalizeEmail(user.email) === normalized
    )

    return { match, isLoading: query.isLoading, isError: query.isError }
}

export function useUserByPhone(phone?: string) {
    const { ready, onGet } = useFetch()
    const digits = phone ? phoneKey(phone) : undefined
    const search = useUserSearch(digits, 'phone')
    const candidate = search.data?.data[0]

    const candidateQuery = useQuery({
        queryKey: ['/users/:userId', candidate?.id],
        queryFn:
            ready && candidate != null
                ? ({ signal }: { signal: AbortSignal }) =>
                      onGet('/users/:userId', zUser, {
                          params: { userId: candidate.id },
                          signal,
                      })
                : skipToken,
        staleTime: HISTORY_STALE_TIME,
    })

    const candidatePhone = candidateQuery.data?.phone ?? undefined
    const matched =
        candidatePhone != null && phoneKey(candidatePhone) === digits

    return {
        match: matched ? candidate : undefined,
        matchedPhone: matched ? candidatePhone : undefined,
        isLoading: search.isLoading || candidateQuery.isLoading,
        isError: search.isError || candidateQuery.isError,
    }
}

export function useUserByDiscord(handle?: string) {
    const normalized = handle ? discordKey(handle) : undefined
    const query = useUserSearch(normalized, 'discord_usernames')

    const matchedHandle = query.data?.data
        .flatMap((user) =>
            user.discordUsers.map((discord) => ({ user, discord }))
        )
        .find(({ discord }) => discordKey(discord.username) === normalized)

    return {
        match: matchedHandle?.user,
        matchedHandle: matchedHandle?.discord.username,
        isLoading: query.isLoading,
        isError: query.isError,
    }
}

const userNameKeys = (user: UserProfile) =>
    [
        user.preferredName,
        [user.firstName, user.lastName].filter(Boolean).join(' '),
        ...user.aliases,
    ].flatMap((name) => (name ? [nameKey(name)] : []))

export function useUserByName(name?: string) {
    const normalized = name ? nameKey(name) : undefined
    const query = useUserSearch(normalized)

    const matches =
        query.data?.data.filter((user) =>
            userNameKeys(user).includes(normalized ?? '')
        ) ?? []

    return {
        match: matches.length === 1 ? matches[0] : undefined,
        ambiguous: matches.length > 1,
        isLoading: query.isLoading,
        isError: query.isError,
    }
}

export function useLinkDonorToUser() {
    const { onPost, onPatch } = useFetch()
    const loggedInUser = useCurrentUser()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            donorEmail,
            userId,
        }: {
            donorEmail: string
            userId: number
        }) => {
            const metaData = {
                dataSource: 'Membership Panel',
                userWhoUpdatedId: loggedInUser.data?.id,
            }

            await onPost(
                '/actblue/donors/:donorEmail/link',
                { userId, metaData } satisfies ActBlueDonorLinkRequest,
                null,
                { params: { donorEmail } }
            )

            await onPatch(
                '/actblue/donors/:donorEmail/membership',
                {
                    discordConfirmed: true,
                    metaData,
                } satisfies UpdateMembershipRequest,
                null,
                { params: { donorEmail } }
            )
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['/actblue/memberships'],
            })
        },
        onError: (error) => console.error(error),
    })
}

export function useSaveMemberships(onSaved: () => void) {
    const { onPatch } = useFetch()
    const loggedInUser = useCurrentUser()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (updates: PendingUpdate[]) => {
            const metaData = {
                dataSource: 'Membership Panel',
                userWhoUpdatedId: loggedInUser.data?.id,
            }

            for (const { donorEmail, userId, user, membership } of updates) {
                if (user && userId != null) {
                    await onPatch(
                        '/users/:userId',
                        { ...user, metaData },
                        zUser,
                        { params: { userId } }
                    )
                }

                if (membership) {
                    await onPatch(
                        '/actblue/donors/:donorEmail/membership',
                        { ...membership, metaData },
                        null,
                        { params: { donorEmail } }
                    )
                }
            }
        },
        onSuccess: async () => {
            onSaved()
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['/actblue/memberships'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['/users/:userId'],
                }),
            ])
        },
        onError: (error) => console.error(error),
    })
}

export interface MembershipTableOptions {
    showRowNumber: boolean
    showStatus: boolean
    showConfirmed: boolean
    showFulfilled: boolean
    showZebra: boolean
    collapseFulfillment: boolean
}

const defaultTableOptions: MembershipTableOptions = {
    showRowNumber: true,
    showStatus: false,
    showConfirmed: false,
    showFulfilled: true,
    showZebra: false,
    collapseFulfillment: false,
}

function useTableOptions() {
    const [options, setOptions] =
        useState<MembershipTableOptions>(defaultTableOptions)
    const hydrated = useRef(false)

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(TABLE_OPTIONS_STORAGE_KEY)
            if (raw == null) return

            const parsed: unknown = JSON.parse(raw)
            if (parsed == null || typeof parsed !== 'object') return

            const stored = parsed as Record<string, unknown>
            setOptions((current) => {
                const next = { ...current }
                for (const key of Object.keys(
                    current
                ) as (keyof MembershipTableOptions)[])
                    if (typeof stored[key] === 'boolean')
                        next[key] = stored[key]
                return next
            })
        } catch {
            console.error('Failed to parse table options from localStorage')
        }
    }, [])

    useEffect(() => {
        if (!hydrated.current) {
            hydrated.current = true
            return
        }
        try {
            window.localStorage.setItem(
                TABLE_OPTIONS_STORAGE_KEY,
                JSON.stringify(options)
            )
        } catch {
            console.error('Failed to save table options to localStorage')
        }
    }, [options])

    const setOption = useCallback(
        <K extends keyof MembershipTableOptions>(
            key: K,
            value: MembershipTableOptions[K]
        ) => setOptions((current) => ({ ...current, [key]: value })),
        []
    )

    const resetOptions = useCallback(() => {
        setOptions(defaultTableOptions)
        try {
            window.localStorage.removeItem(TABLE_OPTIONS_STORAGE_KEY)
        } catch {
            console.error('Failed to remove table options from localStorage')
        }
    }, [])

    return { options, setOption, resetOptions }
}

const eligibleCountSearch: MembershipSearchRequest = {
    limit: 1,
    isMember: true,
    isBenefitEligible: true,
}

function useMembershipsQuery() {
    const { ready, onGet } = useFetch()

    const eligibleCountQuery = usePaginatedSearch(
        '/actblue/memberships',
        zMembershipsResponsePacket,
        { search: eligibleCountSearch }
    ).query

    const query = useInfiniteQuery({
        queryKey: ['/actblue/memberships', { limit: PAGE_SIZE }],
        queryFn: ({ pageParam, signal }) =>
            onGet(
                '/actblue/memberships',
                zPaginatedResponse(zMembershipsResponsePacket),
                {
                    query: {
                        page: pageParam,
                        limit: PAGE_SIZE,
                        isMember: true,
                    },
                    signal,
                }
            ),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.data.length < PAGE_SIZE) return undefined
            const loadedCount = pages.reduce(
                (total, page) => total + page.data.length,
                0
            )
            return loadedCount < lastPage.count ? pages.length : undefined
        },
        enabled: ready,
    })

    const members = useMemo(
        () =>
            (query.data?.pages ?? [])
                .flatMap((page) => page.data)
                .map(mapPacketToMember),
        [query.data]
    )

    const totalEntries =
        query.data != null && !query.hasNextPage
            ? members.length
            : query.data?.pages[0]?.count

    const eligibleMemberCount = eligibleCountQuery.data?.count

    return { query, members, totalEntries, eligibleMemberCount }
}

export function usePendingUpdates(edit: EditController, members: Member[]) {
    const edits = useSyncExternalStore(
        edit.subscribeAll,
        edit.getEdits,
        edit.getEdits
    )

    const membersByEmail = useMemo(() => {
        const map = new Map<string, Member>()
        for (const member of members) {
            if (member.donorEmail != null) map.set(member.donorEmail, member)
        }
        return map
    }, [members])

    const pendingUpdates = useMemo(
        () => buildPendingUpdates(membersByEmail, edits),
        [membersByEmail, edits]
    )

    const hasInvalidEdits = useMemo(
        () =>
            Object.values(edits).some(
                (draft) =>
                    (draft.userPhone != null &&
                        !isValidPhone(draft.userPhone)) ||
                    (draft.address != null &&
                        !isValidAddressDraft(draft.address))
            ),
        [edits]
    )

    return { pendingUpdates, hasInvalidEdits }
}

export function useMembershipPanel() {
    const { options, setOption, resetOptions } = useTableOptions()
    const [isEditing, setIsEditing] = useState(false)
    const { editController, clearEdits } = useMemberEdits()
    const { query, members, totalEntries, eligibleMemberCount } =
        useMembershipsQuery()

    const { fetchNextPage, hasNextPage, isFetchingNextPage } = query
    const isPending: boolean = query.isPending
    const error: Error | null = query.error
    const refetchQuery = query.refetch
    const refetch = useCallback(() => void refetchQuery(), [refetchQuery])
    const { sentinelRef } = useInfiniteScroll<HTMLDivElement>({
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    })

    const stopEditing = useCallback(() => {
        clearEdits()
        setIsEditing(false)
    }, [clearEdits])

    const saveMutation = useSaveMemberships(stopEditing)

    return {
        members,
        totalEntries,
        eligibleMemberCount,
        options,
        setOption,
        resetOptions,
        isEditing,
        setIsEditing,
        editController,
        saveMutation,
        discardEdits: stopEditing,
        hasNextPage,
        isFetchingNextPage,
        sentinelRef,
        isPending,
        error,
        refetch,
    }
}
