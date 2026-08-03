'use client'

import styles from './HistoryView.module.css'
import { MemberView } from './MemberView'
import { CollapsibleSection } from '@/components/common'
import {
    ActBlueDonor,
    Role,
    UpdateHistory,
    User,
    zDiscordUser,
} from '@/contracts/data'
import { useFetch } from '@/util/hooks'
import { useQueries } from '@tanstack/react-query'
import cx from 'classnames'
import { ReactNode, useMemo } from 'react'
import z from 'zod'

export interface HistoryViewProps {
    selectedId: number
    user: User

    selectedHistory: UpdateHistory<User> | null
    onSelectHistory: (update: UpdateHistory<User> | null) => void

    selectedDonorHistory: UpdateHistory<ActBlueDonor> | null
    onSelectDonorHistory: (update: UpdateHistory<ActBlueDonor> | null) => void

    isRefetching: boolean

    roles: Role[]
    roleOptions: { value: number; label: string }[]
    makeFormTitle: (user: User) => string
}

type UnifiedHistoryItem =
    | { kind: 'account'; update: UpdateHistory<User> }
    | { kind: 'donor'; update: UpdateHistory<ActBlueDonor> }

const DAY_MS = 24 * 60 * 60 * 1000

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
        return `${time} · Today`
    }

    if (diffDays < 0) {
        return time
    }

    if (diffDays <= 6) {
        const weekday = value.toLocaleString([], { weekday: 'long' })
        return `${time} · ${weekday}`
    }

    const month = value
        .toLocaleString([], { month: 'short' })
        .replace(/\.$/, '')
    const day = value.getDate()
    const year = value.getFullYear()

    return `${time} · ${month}. ${day}, ${year}`
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

export function HistoryView({
    selectedId,
    user,
    selectedHistory,
    onSelectHistory,
    selectedDonorHistory,
    onSelectDonorHistory,
    isRefetching,
    roles,
    roleOptions,
    makeFormTitle,
}: HistoryViewProps) {
    const { ready, onGet } = useFetch()

    const sortedHistory = useMemo(() => {
        return (user?.history ?? []).slice().sort((a, b) => {
            return (
                b.historyWhenUpdatedUtc.getTime() -
                a.historyWhenUpdatedUtc.getTime()
            )
        })
    }, [user?.history])

    const sortedDonorHistory = useMemo(() => {
        return (user?.donorHistory ?? []).slice().sort((a, b) => {
            return (
                b.historyWhenUpdatedUtc.getTime() -
                a.historyWhenUpdatedUtc.getTime()
            )
        })
    }, [user?.donorHistory])

    const mergedHistory = useMemo(() => {
        return [
            ...sortedHistory.map((update) => ({
                kind: 'account' as const,
                update,
            })),
            ...sortedDonorHistory.map((update) => ({
                kind: 'donor' as const,
                update,
            })),
        ].sort(
            (a, b) =>
                b.update.historyWhenUpdatedUtc.getTime() -
                a.update.historyWhenUpdatedUtc.getTime()
        )
    }, [sortedHistory, sortedDonorHistory])

    const updaterIds = useMemo(() => {
        return Array.from(
            new Set(
                mergedHistory
                    .map((item) => item.update.historyWhoUpdatedId)
                    .filter((id): id is number => id != null)
            )
        )
    }, [mergedHistory])

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

    const updaterUsernameById = useMemo(() => {
        const map = new Map<number, string>()

        updaterDiscordQueries.forEach((query, index) => {
            const id = updaterIds[index]
            const username = query.data?.[0]?.username

            if (id != null && username) map.set(id, username)
        })

        return map
    }, [updaterDiscordQueries, updaterIds])

    const updateLabel = (historyWhoUpdatedId: number | null) => {
        if (historyWhoUpdatedId == null) return 'Unknown'

        const username = updaterUsernameById.get(historyWhoUpdatedId)
        if (username) return `@${username}`

        return `User #${historyWhoUpdatedId}`
    }

    const makeHistoryMessage = (
        who: string,
        place: 'Account' | 'Donor',
        source: string
    ) => {
        return (
            <>
                <span className={styles.historyEntryActor}>{who}</span>
                <span
                    className={styles.historyEntryPrefix}
                >{` updated ${place} via ${source}`}</span>
            </>
        )
    }

    const handleMakeHistoryLabel = (update: UpdateHistory<User>) => {
        const who = updateLabel(update.historyWhoUpdatedId)
        const source = update.historyDataSource ?? 'Unknown'
        return makeHistoryMessage(who, 'Account', source)
    }

    const handleMakeDonorHistoryLabel = (
        update: UpdateHistory<ActBlueDonor>
    ) => {
        const who = updateLabel(update.historyWhoUpdatedId)
        const source = update.historyDataSource ?? 'Unknown'
        return makeHistoryMessage(who, 'Donor', source)
    }

    if (selectedId == null) return null

    if (isRefetching) {
        return (
            <div className={styles.section}>
                <div className={styles.historyContainer}>
                    <div
                        className={cx(
                            styles.historyEntry,
                            styles.historyEntryUi
                        )}
                    >
                        Refreshing…
                    </div>
                </div>
            </div>
        )
    }

    if (!mergedHistory.length) {
        return (
            <div className={styles.section}>
                <div className={styles.historyContainer}>
                    <div
                        className={cx(
                            styles.historyEntry,
                            styles.historyEntryUi
                        )}
                    >
                        No history found
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.section}>
            <UnifiedHistoryField
                title="History"
                history={mergedHistory}
                selectedAccountHistory={selectedHistory}
                selectedDonorHistory={selectedDonorHistory}
                onSelectAccountHistory={onSelectHistory}
                onSelectDonorHistory={onSelectDonorHistory}
                makeAccountLabel={handleMakeHistoryLabel}
                makeDonorLabel={handleMakeDonorHistoryLabel}
            />

            {selectedHistory ? (
                <div className={styles.snapshotWrap}>
                    <MemberView
                        selectedId={selectedId}
                        user={user}
                        selectedHistory={selectedHistory}
                        saving={false}
                        editing={false}
                        isInvalid={false}
                        roles={roles}
                        roleOptions={roleOptions}
                        makeFormTitle={(u) => makeFormTitle(u)}
                    />
                </div>
            ) : null}

            {!selectedHistory && selectedDonorHistory ? (
                <div className={styles.snapshotWrap}>
                    <span>
                        Donor:{' '}
                        {`${selectedDonorHistory.firstname} ${selectedDonorHistory.lastname}`}
                    </span>
                    <br />
                    <span>
                        {selectedDonorHistory.userId ? 'Linked' : 'Unlinked'}
                    </span>
                </div>
            ) : null}
        </div>
    )
}

interface UnifiedHistoryFieldProps {
    title: string
    defaultCollapsed?: boolean
    history: UnifiedHistoryItem[]
    selectedAccountHistory: UpdateHistory<User> | null
    selectedDonorHistory: UpdateHistory<ActBlueDonor> | null
    onSelectAccountHistory: (update: UpdateHistory<User> | null) => void
    onSelectDonorHistory: (update: UpdateHistory<ActBlueDonor> | null) => void
    makeAccountLabel: (update: UpdateHistory<User>) => ReactNode
    makeDonorLabel: (update: UpdateHistory<ActBlueDonor>) => ReactNode
}

function UnifiedHistoryField({
    title,
    defaultCollapsed,
    history,
    selectedAccountHistory,
    selectedDonorHistory,
    onSelectAccountHistory,
    onSelectDonorHistory,
    makeAccountLabel,
    makeDonorLabel,
}: UnifiedHistoryFieldProps) {
    return (
        <CollapsibleSection title={title} initialOpenState={!defaultCollapsed}>
            <div className={styles.historyContainer}>
                {history.map((item, i) => {
                    const isSelected =
                        item.kind == 'account'
                            ? selectedAccountHistory?.historyId ===
                              item.update.historyId
                            : selectedDonorHistory?.historyId ===
                              item.update.historyId

                    const handleSelect = () => {
                        if (item.kind == 'account') {
                            if (isSelected) {
                                onSelectAccountHistory(null)
                                return
                            }

                            onSelectAccountHistory(item.update)
                            onSelectDonorHistory(null)
                            return
                        }

                        if (isSelected) {
                            onSelectDonorHistory(null)
                            return
                        }

                        onSelectDonorHistory(item.update)
                        onSelectAccountHistory(null)
                    }

                    return (
                        <div key={`${item.kind}-${item.update.historyId ?? i}`}>
                            <button
                                type="button"
                                onClick={handleSelect}
                                className={cx(
                                    styles.historyEntry,
                                    isSelected && styles.historyEntrySelected
                                )}
                            >
                                <span className={styles.historyEntryMain}>
                                    {item.kind == 'account'
                                        ? makeAccountLabel(item.update)
                                        : makeDonorLabel(item.update)}
                                </span>

                                <span
                                    className={styles.historyEntryDateTag}
                                    data-full-date={formatFullHistoryTimestamp(
                                        item.update.historyWhenUpdatedUtc
                                    )}
                                >
                                    {formatHistoryTimestamp(
                                        item.update.historyWhenUpdatedUtc
                                    )}
                                </span>
                            </button>
                        </div>
                    )
                })}
            </div>
        </CollapsibleSection>
    )
}
