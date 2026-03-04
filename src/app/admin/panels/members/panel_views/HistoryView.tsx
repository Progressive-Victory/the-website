'use client'

import styles from './HistoryView.module.css'
import { MemberView } from './MemberView'
import { CollapsibleSection } from '@/components/common'
import { FormGroupProps } from '@/components/common/forms'
import {
    ActBlueDonor,
    Location,
    Role,
    UpdateHistory,
    User,
} from '@/contracts/data'
import cx from 'classnames'
import { ReactNode, useMemo } from 'react'

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
    getLocation: (form: User) => Location | null
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
    getLocation,
}: HistoryViewProps) {
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

    const handleMakeHistoryLabel = (update: UpdateHistory<User>) => {
        return (
            <>
                <code className={styles.historyEntryCode}>
                    {update.email ?? 'deleted user'}#{update.id.toString()}
                </code>
            </>
        )
    }

    const handleMakeDonorHistoryLabel = (
        update: UpdateHistory<ActBlueDonor>
    ) => {
        return (
            <>
                <code className={styles.historyEntryCode}>
                    {update.historyWhoUpdatedId
                        ? `${update.historyWhoUpdatedId}#${update.historyDataSource ?? 'Unknown'}`
                        : `${update.historyDataSource ?? 'Unknown'}`}
                </code>
            </>
        )
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

    if (!sortedHistory.length || !sortedDonorHistory.length) {
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
        <>
            <div className={styles.section}>
                <AccountHistoryField<User>
                    title="Account History"
                    history={sortedHistory}
                    selected={selectedHistory}
                    onSelect={onSelectHistory}
                    makeLabel={handleMakeHistoryLabel}
                />

                {selectedHistory ? (
                    <div className={styles.snapshotWrap}>
                        <MemberView
                            selectedId={selectedId}
                            user={user}
                            selectedHistory={selectedHistory}
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
            <div className={styles.section}>
                <AccountHistoryField<ActBlueDonor>
                    title="Donor History"
                    history={sortedDonorHistory}
                    selected={selectedDonorHistory}
                    onSelect={onSelectDonorHistory}
                    makeLabel={handleMakeDonorHistoryLabel}
                />

                {selectedDonorHistory ? (
                    <div className={styles.snapshotWrap}>
                        <span>
                            Donor:{' '}
                            {`${selectedDonorHistory.firstname} ${selectedDonorHistory.lastname}`}
                        </span>
                        <br />
                        <span>
                            {selectedDonorHistory.userId
                                ? 'Linked'
                                : 'Unlinked'}
                        </span>
                    </div>
                ) : null}
            </div>
        </>
    )
}

interface AccountHistoryFieldProps<T> extends FormGroupProps<T> {
    history: UpdateHistory<T>[]
    selected: UpdateHistory<T> | null
    onSelect: (update: UpdateHistory<T> | null) => void
    makeLabel: (update: UpdateHistory<T>) => ReactNode
}

function AccountHistoryField<T>({
    title,
    defaultCollapsed,
    history,
    selected,
    onSelect,
    makeLabel,
}: AccountHistoryFieldProps<T>) {
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
                                    {makeLabel(update)}
                                </code>
                            </button>
                        </div>
                    )
                })}
            </div>
        </CollapsibleSection>
    )
}
