'use client'

import styles from './HistoryView.module.css'
import { MemberView } from './MemberView'
import { CollapsibleSection } from '@/components/common'
import { cn, DOT_SEPARATOR } from '@/util'
import { useFetch } from '@/util/hooks'
import { useQueries } from '@tanstack/react-query'
import {
    ActBlueDonor,
    Role,
    UpdateHistory,
    User,
    zDiscordUser,
} from 'pv-contracts/data'
import { ReactNode, useState } from 'react'
import z from 'zod'

export interface HistoryViewProps {
    user: User
    isRefetching: boolean
    roles: Role[]
    roleOptions: { value: number; label: string }[]
    makeTitle: (user: User) => string
}

interface HistoryEntry {
    key: string
    when: Date
    whoId: number | null
    account?: UpdateHistory<User>
    donor?: UpdateHistory<ActBlueDonor>
}

const DAY_MS = 24 * 60 * 60 * 1000

// One save can write account and donor history separately, a few requests apart
const SAME_CHANGE_WINDOW_MS = 5000

function buildHistoryEntries(user: User) {
    const updates = [
        ...(user.history ?? []).map((account) => ({
            update: account,
            account,
            donor: undefined,
        })),
        ...(user.donorHistory ?? []).map((donor) => ({
            update: donor,
            account: undefined,
            donor,
        })),
    ].sort(
        (a, b) =>
            a.update.historyWhenUpdatedUtc.getTime() -
            b.update.historyWhenUpdatedUtc.getTime()
    )

    const entries: HistoryEntry[] = []

    for (const { update, account, donor } of updates) {
        const last = entries.at(-1)
        const when = update.historyWhenUpdatedUtc

        if (
            last?.whoId === update.historyWhoUpdatedId &&
            when.getTime() - last.when.getTime() <= SAME_CHANGE_WINDOW_MS &&
            !(account && last.account) &&
            !(donor && last.donor)
        ) {
            last.account ??= account
            last.donor ??= donor
            continue
        }

        entries.push({
            key: `${account ? 'account' : 'donor'}-${update.historyId}`,
            when,
            whoId: update.historyWhoUpdatedId,
            account,
            donor,
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
    roleOptions,
    makeTitle,
}: HistoryViewProps) {
    const { ready, onGet } = useFetch()
    const [selectedKey, setSelectedKey] = useState<string | null>(null)

    const entries = buildHistoryEntries(user)
    const selected = entries.find((entry) => entry.key === selectedKey)

    const updaterIds = Array.from(
        new Set(entries.flatMap((entry) => entry.whoId ?? []))
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
        if (historyWhoUpdatedId == null) return 'Unknown'

        const username = updaterUsernameById.get(historyWhoUpdatedId)
        if (username) return `@${username}`

        return `User #${historyWhoUpdatedId}`
    }

    const describeEntry = ({ whoId, account, donor }: HistoryEntry) => {
        const targets = [account && 'Account', donor && 'Donor']
            .filter(Boolean)
            .join(' & ')
        const source =
            account?.historyDataSource ?? donor?.historyDataSource ?? null

        return (
            <>
                <span className={styles.historyEntryActor}>
                    {updateLabel(whoId)}
                </span>
                <span className={styles.historyEntryPrefix}>
                    {` updated ${targets}`}
                    {source && ` via ${source}`}
                </span>
            </>
        )
    }

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
                        roleOptions={roleOptions}
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
