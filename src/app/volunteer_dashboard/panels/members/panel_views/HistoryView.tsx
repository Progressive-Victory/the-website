'use client'

import styles from './HistoryView.module.css'
import { MemberView } from './MemberView'
import { CollapsibleSection } from '@/components/common'
import { cn, DOT_SEPARATOR } from '@/util'
import { useFetch } from '@/util/hooks'
import { useQueries } from '@tanstack/react-query'
import {
    ActBlueDonor,
    Position,
    Role,
    UpdateHistory,
    UpdateHistoryType,
    User,
    zDiscordUser,
} from 'pv-contracts/data'
import { ReactNode, useState } from 'react'
import z from 'zod'

export interface HistoryViewProps {
    user: User
    isRefetching: boolean
    roles: Role[]
    positions: Position[]
    makeTitle: (user: User) => string
}

interface HistoryEvent {
    key: string
    when: Date
    whoId: number | null
    source: string | null
    changes: string[]
    account?: UpdateHistory<User>
    donor?: UpdateHistory<ActBlueDonor>
}

interface HistoryEntry extends Omit<HistoryEvent, 'changes'> {
    latest: Date
    changes: Set<string>
}

const DAY_MS = 24 * 60 * 60 * 1000

// One save fans out into several API writes a few requests apart
const SAME_CHANGE_WINDOW_MS = 5000

const HISTORY_META_KEYS = new Set([
    'historyId',
    'historyType',
    'historyDataSource',
    'historyWhoUpdatedId',
    'historyWhenUpdatedUtc',
])

const isSystem = (whoId: number | null) => !whoId

function snapshotOf(value: object, ignoredKeys: string[] = []) {
    return JSON.stringify(
        Object.entries(value).filter(
            ([key]) => !HISTORY_META_KEYS.has(key) && !ignoredKeys.includes(key)
        )
    )
}

function byTime<T extends { historyWhenUpdatedUtc: Date }>(updates: T[]) {
    return updates.toSorted(
        (a, b) =>
            a.historyWhenUpdatedUtc.getTime() -
            b.historyWhenUpdatedUtc.getTime()
    )
}

function accountEvents(history: UpdateHistory<User>[]) {
    let previous: string | undefined

    return byTime(history).flatMap<HistoryEvent>((account) => {
        const snapshot = snapshotOf(account)
        if (snapshot === previous) return []
        previous = snapshot

        const created = account.historyType === UpdateHistoryType.Inserted
        return {
            key: `account-${account.historyId}`,
            when: account.historyWhenUpdatedUtc,
            whoId: account.historyWhoUpdatedId,
            source: account.historyDataSource,
            changes: [created ? 'created Account' : 'updated Account'],
            account,
        }
    })
}

function describeDonorChange(
    donor: UpdateHistory<ActBlueDonor>,
    previous: UpdateHistory<ActBlueDonor> | undefined,
    userId: number
) {
    const wasLinked = previous?.userId === userId
    const isLinked = donor.userId === userId
    const changes: string[] = []

    if (isLinked && !wasLinked) changes.push('linked Donor')
    if (wasLinked && !isLinked) changes.push('unlinked Donor')
    if (!previous) return changes

    const donorFields = ['membershipData', 'userId']
    if (snapshotOf(donor, donorFields) !== snapshotOf(previous, donorFields))
        changes.push('updated Donor')

    const membershipChanged =
        JSON.stringify(donor.membershipData ?? null) !==
        JSON.stringify(previous.membershipData ?? null)
    if (membershipChanged) changes.push('updated Membership')

    return changes
}

function donorEvents(history: UpdateHistory<ActBlueDonor>[], userId: number) {
    const previousByEmail = new Map<string, UpdateHistory<ActBlueDonor>>()

    return byTime(history).flatMap<HistoryEvent>((donor) => {
        const previous = previousByEmail.get(donor.email)
        previousByEmail.set(donor.email, donor)

        const changes = describeDonorChange(donor, previous, userId)
        if (!changes.length) return []

        // The API stamps membership writes onto a donor row without updating its source
        const sourceIsReal =
            previous &&
            changes.some((change) => change !== 'updated Membership')

        return {
            key: `donor-${donor.historyId}`,
            when: donor.historyWhenUpdatedUtc,
            whoId: donor.historyWhoUpdatedId,
            source: sourceIsReal ? donor.historyDataSource : null,
            changes,
            donor,
        }
    })
}

function canShareEntry(entry: HistoryEntry, event: HistoryEvent) {
    const withinWindow =
        event.when.getTime() - entry.latest.getTime() <= SAME_CHANGE_WINDOW_MS
    const conflictingActors =
        entry.whoId !== event.whoId &&
        !isSystem(entry.whoId) &&
        !isSystem(event.whoId)

    return withinWindow && !conflictingActors
}

function buildHistoryEntries(user: User) {
    const events = [
        ...accountEvents(user.history ?? []),
        ...donorEvents(user.donorHistory ?? [], user.id),
    ].sort((a, b) => a.when.getTime() - b.when.getTime())

    const entries: HistoryEntry[] = []

    for (const event of events) {
        const last = entries.at(-1)

        if (last && canShareEntry(last, event)) {
            if (isSystem(last.whoId) && !isSystem(event.whoId)) {
                last.whoId = event.whoId
                last.source = event.source
            }
            if (!isSystem(event.whoId)) last.source ??= event.source

            event.changes.forEach((change) => last.changes.add(change))
            last.latest = event.when
            last.account = event.account ?? last.account
            last.donor = event.donor ?? last.donor
            continue
        }

        entries.push({
            ...event,
            latest: event.when,
            changes: new Set(event.changes),
        })
    }

    return entries.reverse()
}

function normalizeMeridiem(time: string) {
    return time.replace(/\s*([AP])M\b/g, (_, period: string) => {
        return `${period.toLowerCase()}m`
    })
}

function formatHistoryTimestamp(value: Date, now = new Date()) {
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const target = new Date(value)
    target.setHours(0, 0, 0, 0)

    const diffMs = today.getTime() - target.getTime()
    const diffDays = Math.floor(diffMs / DAY_MS)

    const time = normalizeMeridiem(
        value.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
        })
    )

    if (diffDays === 0) {
        return `${time} ${DOT_SEPARATOR} Today`
    }

    if (diffDays < 0) {
        return time
    }

    if (diffDays <= 6) {
        const weekday = value.toLocaleString([], { weekday: 'long' })
        return `${time} ${DOT_SEPARATOR} ${weekday}`
    }

    const month = value
        .toLocaleString([], { month: 'short' })
        .replace(/\.$/, '')
    const day = value.getDate()
    const year = value.getFullYear()

    return `${time} ${DOT_SEPARATOR} ${month}. ${day}, ${year}`
}

function formatFullHistoryTimestamp(value: Date) {
    return normalizeMeridiem(
        value.toLocaleString([], {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
    )
}

function HistoryMessage({ children }: { children: ReactNode }) {
    return (
        <div className={styles.section}>
            <div className={styles.historyContainer}>
                <div className={cn(styles.historyEntry, styles.historyEntryUi)}>
                    {children}
                </div>
            </div>
        </div>
    )
}

export function HistoryView({
    user,
    isRefetching,
    roles,
    positions,
    makeTitle,
}: HistoryViewProps) {
    const { ready, onGet } = useFetch()
    const [selectedKey, setSelectedKey] = useState<string | null>(null)

    const entries = buildHistoryEntries(user)
    const selected = entries.find((entry) => entry.key === selectedKey)

    const updaterIds = Array.from(
        new Set(entries.flatMap((entry) => (entry.whoId ? [entry.whoId] : [])))
    )

    const updaterDiscordQueries = useQueries({
        queries: updaterIds.map((id) => ({
            queryKey: [`/discordUsers/${id}`],
            queryFn: ({ signal }) =>
                onGet('/discordUsers/:discordUserId', z.array(zDiscordUser), {
                    params: { discordUserId: id },
                    signal,
                }),
            enabled: ready,
        })),
    })

    const updaterUsernameById = new Map<number, string>()
    updaterDiscordQueries.forEach((query, index) => {
        const id = updaterIds[index]
        const username = query.data?.[0]?.username

        if (id != null && username) updaterUsernameById.set(id, username)
    })

    const updateLabel = (historyWhoUpdatedId: number | null) => {
        if (!historyWhoUpdatedId) return 'System'

        const username = updaterUsernameById.get(historyWhoUpdatedId)
        if (username) return `@${username}`

        return `User #${historyWhoUpdatedId}`
    }

    const describeEntry = ({ whoId, source, changes }: HistoryEntry) => (
        <>
            <span className={styles.historyEntryActor}>
                {updateLabel(whoId)}
            </span>
            <span className={styles.historyEntryPrefix}>
                {` ${[...changes].join(', ')}`}
                {source && ` via ${source}`}
            </span>
        </>
    )

    if (isRefetching) return <HistoryMessage>Refreshing…</HistoryMessage>
    if (!entries.length)
        return <HistoryMessage>No history found</HistoryMessage>

    return (
        <div className={styles.section}>
            <CollapsibleSection title="History" initialOpenState>
                <div className={styles.historyContainer}>
                    {entries.map((entry) => (
                        <button
                            key={entry.key}
                            type="button"
                            onClick={() =>
                                setSelectedKey(
                                    entry.key === selectedKey ? null : entry.key
                                )
                            }
                            className={cn(
                                styles.historyEntry,
                                entry.key === selectedKey &&
                                    styles.historyEntrySelected
                            )}
                        >
                            <span className={styles.historyEntryMain}>
                                {describeEntry(entry)}
                            </span>

                            <span
                                className={styles.historyEntryDateTag}
                                data-full-date={formatFullHistoryTimestamp(
                                    entry.when
                                )}
                            >
                                {formatHistoryTimestamp(entry.when)}
                            </span>
                        </button>
                    ))}
                </div>
            </CollapsibleSection>

            {selected?.account && (
                <div className={styles.snapshotWrap}>
                    <MemberView
                        selectedId={user.id}
                        user={user}
                        selectedHistory={selected.account}
                        saving={false}
                        editing={false}
                        isInvalid={false}
                        roles={roles}
                        positions={positions}
                        makeFormTitle={(u) =>
                            `${makeTitle(u)} @ ${formatFullHistoryTimestamp(selected.when)}`
                        }
                    />
                </div>
            )}

            {selected?.donor && (
                <div className={styles.snapshotWrap}>
                    <span>
                        Donor:{' '}
                        {`${selected.donor.firstname} ${selected.donor.lastname}`}
                    </span>
                    <br />
                    <span>{selected.donor.userId ? 'Linked' : 'Unlinked'}</span>
                </div>
            )}
        </div>
    )
}
