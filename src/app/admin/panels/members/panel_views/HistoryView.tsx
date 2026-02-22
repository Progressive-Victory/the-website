'use client'

import styles from './HistoryView.module.css'
import { MemberView } from './MemberView'
import { CollapsibleSection } from '@/components/common'
import { FormGroupProps, FormState } from '@/components/common/forms'
import { Location, Role, UpdateHistory, User } from '@/contracts/data'
import cx from 'classnames'
import { useMemo, useState } from 'react'

export interface HistoryViewProps {
    selectedId: number
    user: User

    selectedHistory: UpdateHistory<User> | null
    onSelectHistory: (update: UpdateHistory<User> | null) => void

    isRefetching: boolean

    roles: Role[]
    roleOptions: { value: number; label: string }[]
    makeFormTitle: (user: User) => string
    getLocation: (form: User) => Location | null
}

export function HistoryView({
    selectedId,
    user,
    selectedHistory,
    onSelectHistory,
    isRefetching,
    roles,
    roleOptions,
    makeFormTitle,
    getLocation,
}: HistoryViewProps) {
    const [historyFormState, setHistoryFormState] =
        useState<FormState<User> | null>(null)

    const sortedHistory = useMemo(() => {
        return (user?.history ?? []).slice().sort((a, b) => {
            return (
                b.historyWhenUpdatedUtc.getTime() -
                a.historyWhenUpdatedUtc.getTime()
            )
        })
    }, [user?.history])

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

    if (!sortedHistory.length) {
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
            <AccountHistoryField
                title="Account History"
                history={sortedHistory}
                selected={selectedHistory}
                onSelect={onSelectHistory}
            />

            {selectedHistory ? (
                <div className={styles.snapshotWrap}>
                    <MemberView
                        selectedId={selectedId}
                        user={user}
                        selectedHistory={selectedHistory}
                        formState={historyFormState}
                        setFormState={setHistoryFormState}
                        saving={false}
                        isInvalid={false}
                        roles={roles}
                        roleOptions={roleOptions}
                        makeFormTitle={(u) => makeFormTitle(u)}
                        handleSave={() => {
                            return
                        }}
                        getLocation={getLocation}
                    />
                </div>
            ) : null}
        </div>
    )
}

interface AccountHistoryFieldProps extends FormGroupProps<User> {
    history: UpdateHistory<User>[]
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
    return (
        <CollapsibleSection title={title} initialOpenState={!defaultCollapsed}>
            <div className={styles.historyContainer}>
                {history.map((update, i) => {
                    const isSelected = selected?.historyId === update.historyId

                    return (
                        <div key={update.historyId ?? i}>
                            <button
                                type="button"
                                onClick={() => onSelect(update)}
                                className={cx(
                                    styles.historyEntry,
                                    isSelected && styles.historyEntrySelected
                                )}
                            >
                                <span
                                    className={styles.historyEntryPrefix}
                                >{`${update.historyType == 'I' ? 'Created' : 'Updated'} at `}</span>

                                <span className={styles.historyEntryDate}>
                                    {update.historyWhenUpdatedUtc.toLocaleString()}
                                </span>

                                <span className={styles.historyEntryPrefix}>
                                    {' by '}
                                </span>

                                <code className={styles.historyEntryCode}>
                                    {update.email ?? 'deleted user'}#
                                    {update.id.toString()}
                                </code>
                            </button>
                        </div>
                    )
                })}
            </div>
        </CollapsibleSection>
    )
}
