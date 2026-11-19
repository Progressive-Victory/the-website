'use client'

import styles from './HistoryView.module.css'
import { List, ListRow, NavigationRow } from '@/components/common'
import { BackButton } from '@/components/common/buttons'
import { DOT_SEPARATOR } from '@/util'
import { useFetch } from '@/util/hooks'
import { useQueries } from '@tanstack/react-query'
import {
    ActBlueDonor,
    UpdateHistory,
    UpdateHistoryType,
    User,
    zDiscordUser,
} from 'pv-contracts/data'
import { useState } from 'react'
import z from 'zod'

export interface HistoryViewProps {
    user: User
    isRefetching: boolean
}

interface HistoryEvent {
    key: string
    when: Date
    whoId: number | null
    source: string | null
    changes: string[]
    account?: UpdateHistory<User>
    previousAccount?: UpdateHistory<User>
    donor?: UpdateHistory<ActBlueDonor>
    previousDonor?: UpdateHistory<ActBlueDonor>
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
    let previous: UpdateHistory<User> | undefined

    return byTime(history).flatMap<HistoryEvent>((account) => {
        const previousAccount = previous
        previous = account
        if (
            previousAccount &&
            snapshotOf(account) === snapshotOf(previousAccount)
        )
            return []

        const created = account.historyType === UpdateHistoryType.Inserted
        return {
            key: `account-${account.historyId}`,
            when: account.historyWhenUpdatedUtc,
            whoId: account.historyWhoUpdatedId,
            source: account.historyDataSource,
            changes: [created ? 'created Account' : 'updated Account'],
            account,
            previousAccount,
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
            previousDonor: previous,
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
            if (event.account && !last.account)
                last.previousAccount = event.previousAccount
            if (event.donor && !last.donor)
                last.previousDonor = event.previousDonor
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

// Internal ids, derived fields, and SMS verification codes
const HIDDEN_FIELDS = new Set([
    'id',
    'userId',
    'location',
    'contributions',
    'membershipData',
    'lastSmsCode',
    'lastSmsCodeSendTimeUtc',
])

interface FieldChange {
    path: string
    label: string
    before?: string
    after: string
}

function flattenFields(value: object, prefix = ''): [string, unknown][] {
    const fields: [string, unknown][] = Object.entries(value)

    return fields.flatMap<[string, unknown]>(([key, field]) => {
        if (HISTORY_META_KEYS.has(key) || HIDDEN_FIELDS.has(key)) return []

        const path = prefix ? `${prefix}.${key}` : key
        const nested =
            typeof field === 'object' &&
            field != null &&
            !(field instanceof Date) &&
            !Array.isArray(field)

        return nested ? flattenFields(field, path) : [[path, field]]
    })
}

function fieldLabel(path: string) {
    const words = (path.split('.').at(-1) ?? path).replace(
        /([a-z])([A-Z0-9])/g,
        '$1 $2'
    )
    return words.charAt(0).toUpperCase() + words.slice(1)
}

function formatListItem(item: unknown) {
    const named =
        typeof item === 'object' &&
        item != null &&
        'name' in item &&
        typeof item.name === 'string'
    return named ? item.name : formatValue(item)
}

function formatValue(value: unknown): string {
    if (value == null || value === '') return 'None'
    if (value instanceof Date) return value.toLocaleDateString()
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'string' || typeof value === 'number')
        return String(value)

    if (Array.isArray(value)) {
        const items = (value as unknown[]).map(formatListItem)
        return items.length ? items.join(', ') : 'None'
    }

    return JSON.stringify(value)
}

function diffFields(after: object, before?: object) {
    const beforeFields = before && new Map(flattenFields(before))

    return flattenFields(after).flatMap<FieldChange>(([path, value]) => {
        const next = formatValue(value)
        const previous = beforeFields && formatValue(beforeFields.get(path))
        if (previous === next) return []
        if (!beforeFields && next === 'None') return []

        return { path, label: fieldLabel(path), before: previous, after: next }
    })
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

function HistoryMessage({ message }: { message: string }) {
    return (
        <div className={styles.section}>
            <List title="History">
                <ListRow
                    label={<span className={styles.message}>{message}</span>}
                />
            </List>
        </div>
    )
}

function ChangeRows({ changes }: { changes: FieldChange[] }) {
    return changes.map(({ path, label, before, after }) => (
        <ListRow
            key={path}
            label={label}
            value={
                <>
                    {before !== undefined && (
                        <>
                            <span className={styles.before}>{before}</span>
                            {' → '}
                        </>
                    )}
                    {after}
                </>
            }
        />
    ))
}

interface HistoryDetailProps {
    entry: HistoryEntry
    userId: number
    actor: string
    onBack: () => void
}

function HistoryDetail({ entry, userId, actor, onBack }: HistoryDetailProps) {
    const { account, previousAccount, donor, previousDonor } = entry
    const matchChanged =
        donor != null &&
        (previousDonor?.userId === userId) !== (donor.userId === userId)

    const accountChanges = account ? diffFields(account, previousAccount) : []
    const donorChanges =
        donor && previousDonor ? diffFields(donor, previousDonor) : []
    const membershipChanges = donor?.membershipData
        ? diffFields(
              donor.membershipData,
              previousDonor && (previousDonor.membershipData ?? {})
          )
        : []

    return (
        <div className={styles.section}>
            <BackButton
                label="History"
                onClick={onBack}
                className={styles.backButton}
            />

            <List title="Change">
                <ListRow label="By" value={actor} />
                <ListRow
                    label="When"
                    value={formatFullHistoryTimestamp(entry.when)}
                />
                <ListRow
                    label="Source"
                    value={entry.source}
                    emptyLabel="Unknown"
                />
            </List>

            {accountChanges.length > 0 && (
                <List title="Account Changes">
                    <ChangeRows changes={accountChanges} />
                </List>
            )}

            {donor && (matchChanged || donorChanges.length > 0) && (
                <List title="Donor Changes">
                    <ListRow
                        label="Donor"
                        value={`${donor.firstname} ${donor.lastname}`}
                    />
                    {matchChanged && (
                        <ListRow
                            label="Match"
                            value={
                                donor.userId === userId ? 'Linked' : 'Unlinked'
                            }
                        />
                    )}
                    <ChangeRows changes={donorChanges} />
                </List>
            )}

            {membershipChanges.length > 0 && (
                <List title="Membership Changes">
                    <ChangeRows changes={membershipChanges} />
                </List>
            )}
        </div>
    )
}

export function HistoryView({ user, isRefetching }: HistoryViewProps) {
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
            <span className={styles.actor}>{updateLabel(whoId)}</span>
            <span className={styles.description}>
                {` ${[...changes].join(', ')}`}
                {source && ` via ${source}`}
            </span>
        </>
    )

    if (isRefetching) return <HistoryMessage message="Refreshing…" />
    if (!entries.length) return <HistoryMessage message="No history found" />

    if (selected)
        return (
            <HistoryDetail
                entry={selected}
                userId={user.id}
                actor={updateLabel(selected.whoId)}
                onBack={() => setSelectedKey(null)}
            />
        )

    return (
        <div className={styles.section}>
            <List title="History">
                {entries.map((entry) => (
                    <NavigationRow
                        key={entry.key}
                        label={describeEntry(entry)}
                        value={
                            <span
                                className={styles.dateTag}
                                data-full-date={formatFullHistoryTimestamp(
                                    entry.when
                                )}
                            >
                                {formatHistoryTimestamp(entry.when)}
                            </span>
                        }
                        onClick={() => setSelectedKey(entry.key)}
                    />
                ))}
            </List>
        </div>
    )
}
