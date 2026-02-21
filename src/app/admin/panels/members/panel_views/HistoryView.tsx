// panel_views/HistoryView.tsx
'use client'

import styles from './HistoryView.module.css'
import { CollapsibleSection } from '@/components/common'
import { FormGroupProps } from '@/components/common/forms'
import { UpdateHistory, User } from '@/contracts/data'
import cx from 'classnames'

// panel_views/HistoryView.tsx

// panel_views/HistoryView.tsx

// panel_views/HistoryView.tsx

export interface HistoryViewProps {
    selectedId: number
    user: User
    selectedHistory: UpdateHistory<User> | null
    onSelectHistory: (update: UpdateHistory<User> | null) => void
    isRefetching: boolean
}

export function HistoryView({
    selectedId,
    user,
    selectedHistory,
    onSelectHistory,
    isRefetching,
}: HistoryViewProps) {
    // Keep the exact UX you already liked, just moved into its own tab.
    // (Also keep the "first item clears selection" behavior you had.)
    if (selectedId == null) return null

    if (isRefetching) {
        return (
            <div className={styles.historyContainer}>
                <div className={styles.historyEntry}>Refreshing…</div>
            </div>
        )
    }

    if (!user?.history?.length) {
        return (
            <div className={styles.historyContainer}>
                <div className={styles.historyEntry}>No history found</div>
            </div>
        )
    }

    return (
        <AccountHistoryField
            title="Account History"
            history={user.history}
            selected={selectedHistory}
            onSelect={onSelectHistory}
        />
    )
}

interface AccountHistoryFieldProps extends FormGroupProps<User> {
    history?: UpdateHistory<User>[]
    selected: UpdateHistory<User> | null
    onSelect: (update: UpdateHistory<User> | null) => void
}

function AccountHistoryField({
    title,
    defaultCollapsed,
    history,
    selected,
    onSelect,
}: AccountHistoryFieldProps) {
    const value = (history ?? []).sort(
        (a, b) =>
            b.historyWhenUpdatedUtc.getTime() -
            a.historyWhenUpdatedUtc.getTime()
    )

    return (
        <div className={styles.section}>
            <CollapsibleSection
                title={title}
                initialOpenState={!defaultCollapsed}
            >
                <div className={styles.historyContainer}>
                    {value.map((update, i) => (
                        <div key={i}>
                            <button
                                onClick={() => onSelect(i ? update : null)}
                                className={cx(
                                    styles.historyEntry,
                                    (selected?.historyId == update.historyId ||
                                        (!i && !selected)) &&
                                        styles.historyEntrySelected
                                )}
                            >
                                <span color="#4b5563">{`${update.historyType == 'I' ? 'Created' : 'Updated'} at `}</span>
                                <span className={styles.historyEntryDate}>
                                    {update.historyWhenUpdatedUtc.toLocaleString()}
                                </span>
                                <span color="#4b5563">{' by '}</span>
                                <code>
                                    {update.email ?? 'deleted user'}#
                                    {update.id.toString()}
                                </code>
                            </button>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
        </div>
    )
}
