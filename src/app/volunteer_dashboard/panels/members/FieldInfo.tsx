'use client'

import styles from './FieldInfo.module.css'
import { UpdaterAvatar } from './UpdaterAvatar'
import { normalizeMeridiem } from './panel_views/HistoryView'
import { joinName } from '@/app/volunteer_dashboard/panels/membership/membership.helpers'
import type {
    DescribeChange,
    UserHistoryEntry,
} from '@/app/volunteer_dashboard/panels/membership/membership.types'
import { List, ListBreak, ListRow, NavigationRow } from '@/components/common'
import { BackButton } from '@/components/common/buttons'
import { cn, DOT_SEPARATOR } from '@/util'
import { useFetch } from '@/util/hooks'
import { skipToken, useQuery } from '@tanstack/react-query'
import { zUser, type User } from 'pv-contracts/data'
import { useState } from 'react'
import { FaArrowRight, FaCheck } from 'react-icons/fa'

const HISTORY_LIMIT = 5

const formatHistoryDate = (value: Date) =>
    value.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

const formatHistoryTime = (value: Date) =>
    normalizeMeridiem(
        value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    )

const formatRecentChange = (value: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const day = new Date(value)
    day.setHours(0, 0, 0, 0)
    const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000)

    if (diffDays <= 0) return formatHistoryTime(value)
    if (diffDays <= 6) return value.toLocaleString([], { weekday: 'long' })

    const month = value
        .toLocaleString([], { month: 'short' })
        .replace(/\.$/, '')
    return `${month}. ${value.getDate()}, ${value.getFullYear()}`
}

interface HistoryEntry {
    update: UserHistoryEntry
    previous?: UserHistoryEntry
    label: string
    value: string
}

const buildHistory = (user: User, describeChange: DescribeChange) => {
    const entries: HistoryEntry[] = []
    let previous: UserHistoryEntry | undefined

    const ascending = (user.history ?? [])
        .slice()
        .sort(
            (a, b) =>
                a.historyWhenUpdatedUtc.getTime() -
                b.historyWhenUpdatedUtc.getTime()
        )

    for (const update of ascending) {
        const change = describeChange(update, previous)
        if (!change) continue
        entries.push({ update, previous, ...change })
        previous = update
    }

    return entries.reverse().slice(0, HISTORY_LIMIT)
}

export interface FieldSource {
    key: string
    label: string
    value?: string
}

function SourceRow({
    source,
    selected,
    identical,
    editing,
    onSelect,
}: {
    source: FieldSource
    selected: boolean
    identical: boolean
    editing: boolean
    onSelect: () => void
}) {
    return (
        <button
            type="button"
            className={styles.row}
            disabled={!editing || !source.value}
            data-empty={!source.value}
            aria-pressed={selected}
            onClick={onSelect}
        >
            <span className={styles.rowLabel}>{source.label}</span>
            <span className={styles.rowValue}>
                {identical
                    ? 'Identical'
                    : (source.value ?? `No ${source.label} Info`)}
            </span>
            <FaCheck className={styles.check} data-visible={selected} />
        </button>
    )
}

function HistoryDetail({
    entry,
    label,
    previousValue,
    onBack,
}: {
    entry: HistoryEntry
    label: string
    previousValue: (entry: UserHistoryEntry) => string | undefined
    onBack: () => void
}) {
    const { update, previous, value } = entry
    const before = previous && previousValue(previous)
    const whoId = update.historyWhoUpdatedId
    const { ready, onGet } = useFetch()
    const updaterQuery = useQuery({
        queryKey: ['/users/:userId', whoId],
        queryFn:
            ready && whoId
                ? ({ signal }) =>
                      onGet('/users/:userId', zUser, {
                          params: { userId: whoId },
                          signal,
                      })
                : skipToken,
    })
    const name = joinName(
        updaterQuery.data?.firstName,
        updaterQuery.data?.lastName
    )
    const updatedBy = name ?? (whoId ? `User #${whoId}` : 'System')

    return (
        <>
            <div className={styles.header}>
                <BackButton
                    label={label}
                    onClick={onBack}
                    className={styles.backButton}
                />
            </div>

            <div className={styles.section}>
                <List
                    title={entry.label}
                    collapsible={false}
                    editing={false}
                    className={styles.list}
                >
                    <div className={styles.compare}>
                        <span
                            className={styles.compareValue}
                            data-empty={!before}
                        >
                            {before ?? 'None'}
                        </span>
                        <FaArrowRight className={styles.compareArrow} />
                        <span className={styles.compareValue} data-current>
                            {value}
                        </span>
                    </div>
                </List>
            </div>

            <div className={styles.section}>
                <List
                    title="Details"
                    collapsible={false}
                    editing={false}
                    className={styles.list}
                >
                    <ListRow label="Changed By" value={updatedBy} />
                    <ListRow
                        label="Source"
                        value={update.historyDataSource}
                        emptyLabel="Unknown"
                    />
                    <ListBreak />
                    <ListRow
                        label="Date"
                        value={
                            <span className={styles.dateTag}>
                                {formatHistoryDate(
                                    update.historyWhenUpdatedUtc
                                )}
                                {` ${DOT_SEPARATOR} `}
                                {formatHistoryTime(
                                    update.historyWhenUpdatedUtc
                                )}
                            </span>
                        }
                    />
                </List>
            </div>
        </>
    )
}

export interface FieldInfoProps {
    user: User
    label: string
    sources?: FieldSource[]
    describeChange?: DescribeChange
    previousValue: (entry: UserHistoryEntry) => string | undefined
    disclaimer: string
    onSave?: () => void
}

export function FieldInfo({
    user,
    label,
    sources = [],
    describeChange,
    previousValue,
    disclaimer,
    onSave,
}: FieldInfoProps) {
    const [selectedKey, setSelectedKey] = useState(
        sources.find((source) => source.value)?.key
    )
    const [editingSource, setEditingSource] = useState(false)
    const [draftKey, setDraftKey] = useState(selectedKey)
    const shownKey = editingSource ? draftKey : selectedKey
    const changed = editingSource && draftKey !== selectedKey
    const editLabel = changed ? 'Save' : 'Cancel'
    const active = sources.find((source) => source.key === shownKey)
    const history = describeChange && buildHistory(user, describeChange)
    const [detail, setDetail] = useState<HistoryEntry>()
    const [pushed, setPushed] = useState(false)

    const toggleEditing = () => {
        if (changed) {
            setSelectedKey(draftKey)
            onSave?.()
        }
        if (!editingSource) setDraftKey(selectedKey)
        setEditingSource(!editingSource)
    }

    return (
        <div className={styles.stack} data-pushed={pushed}>
            <div className={cn(styles.page, styles.root)}>
                {sources.length > 0 && (
                    <div className={styles.section}>
                        <List
                            title={
                                <span className={styles.title}>
                                    Source
                                    <button
                                        type="button"
                                        className={styles.editButton}
                                        data-editing={editingSource}
                                        data-primary={changed}
                                        disabled
                                        onClick={toggleEditing}
                                    >
                                        {editingSource ? editLabel : 'Edit'}
                                    </button>
                                </span>
                            }
                            collapsible={false}
                            editing={false}
                            disclaimer={disclaimer}
                            className={styles.list}
                        >
                            {sources.map((source) => (
                                <SourceRow
                                    key={source.key}
                                    source={source}
                                    selected={source.key === shownKey}
                                    identical={
                                        source.key !== shownKey &&
                                        !!source.value &&
                                        source.value === active?.value
                                    }
                                    editing={editingSource}
                                    onSelect={() => setDraftKey(source.key)}
                                />
                            ))}
                        </List>
                    </div>
                )}

                {history && (
                    <div className={styles.section}>
                        <List
                            title="Recent Changes"
                            collapsible={false}
                            editing={false}
                            disclaimer={
                                sources.length > 0 ? undefined : disclaimer
                            }
                            className={styles.list}
                        >
                            {history.length === 0 ? (
                                <ListRow label="No changes yet" muted />
                            ) : (
                                history.map((entry) => (
                                    <NavigationRow
                                        key={entry.update.historyId}
                                        label={
                                            <span
                                                className={styles.historyEntry}
                                            >
                                                <UpdaterAvatar
                                                    whoId={
                                                        entry.update
                                                            .historyWhoUpdatedId
                                                    }
                                                    size={18}
                                                    showName
                                                />
                                                <span
                                                    className={
                                                        styles.historyDetail
                                                    }
                                                >
                                                    {entry.value}
                                                </span>
                                            </span>
                                        }
                                        value={
                                            <span className={styles.dateTag}>
                                                {formatRecentChange(
                                                    entry.update
                                                        .historyWhenUpdatedUtc
                                                )}
                                            </span>
                                        }
                                        onClick={() => {
                                            setDetail(entry)
                                            setPushed(true)
                                        }}
                                    />
                                ))
                            )}
                        </List>
                    </div>
                )}
            </div>
            <div className={cn(styles.page, styles.detail)}>
                {detail && (
                    <HistoryDetail
                        entry={detail}
                        label={label}
                        previousValue={previousValue}
                        onBack={() => setPushed(false)}
                    />
                )}
            </div>
        </div>
    )
}
