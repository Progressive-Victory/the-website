'use client'

import {
    buildPendingUpdates,
    isValidAddressDraft,
    isValidPhone,
    mapPacketToMember,
} from './membership.helpers'
import {
    DescribeChange,
    EditController,
    HistoryEntry,
    Member,
    MemberEdits,
    MembershipTableMode,
    PendingUpdate,
} from './membership.types'
import { User, zUser } from '@/contracts/data'
import {
    zMembershipsResponsePacket,
    zPaginatedResponse,
} from '@/contracts/responses'
import { useCurrentUser, useFetch, useInfiniteScroll } from '@/util/hooks'
import {
    skipToken,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import {
    useCallback,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react'

const HISTORY_STALE_TIME = 5 * 60 * 1000
const HISTORY_LIMIT = 5
const PAGE_SIZE = 25
const EMPTY_DRAFT: MemberEdits = {}
const noopUnsubscribe = () => undefined

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

// Edits live outside React state so typing only re-renders the affected cells
// instead of rebuilding every column and row of the table.
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
    collapseFulfillment: boolean
}

const defaultTableOptions: MembershipTableOptions = {
    showRowNumber: false,
    showStatus: false,
    showConfirmed: false,
    showFulfilled: true,
    collapseFulfillment: false,
}

function useMembershipsQuery() {
    const { ready, onGet } = useFetch()

    const query = useInfiniteQuery({
        queryKey: ['/actblue/memberships', { limit: PAGE_SIZE }],
        queryFn: ({ pageParam, signal }) =>
            onGet(
                '/actblue/memberships',
                zPaginatedResponse(zMembershipsResponsePacket),
                { query: { page: pageParam, limit: PAGE_SIZE }, signal }
            ),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
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

    return { query, members, totalEntries: query.data?.pages[0]?.count }
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
    const [options, setOptions] =
        useState<MembershipTableOptions>(defaultTableOptions)
    const [tableMode, setTableMode] = useState<MembershipTableMode>('view')
    const { editController, clearEdits } = useMemberEdits()
    const { query, members, totalEntries } = useMembershipsQuery()

    const { fetchNextPage, hasNextPage, isFetchingNextPage } = query
    const { sentinelRef } = useInfiniteScroll<HTMLDivElement>({
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    })

    const setOption = useCallback(
        <K extends keyof MembershipTableOptions>(
            key: K,
            value: MembershipTableOptions[K]
        ) => setOptions((current) => ({ ...current, [key]: value })),
        []
    )

    const stopEditing = useCallback(() => {
        clearEdits()
        setTableMode('view')
    }, [clearEdits])

    const saveMutation = useSaveMemberships(stopEditing)

    return {
        members,
        totalEntries,
        options,
        setOption,
        tableMode,
        setTableMode,
        editController,
        saveMutation,
        discardEdits: stopEditing,
        hasNextPage,
        isFetchingNextPage,
        sentinelRef,
    }
}
