'use client'

import styles from './HistoryView.module.css'
import { MemberView } from './MemberView'
import { CollapsibleSection } from '@/components/common'
import { FormGroupProps, FormState } from '@/components/common/forms'
import {
    ActBlueDonor,
    Location,
    Role,
    UpdateHistory,
    User,
} from '@/contracts/data'
import cx from 'classnames'
import { ReactNode, useMemo, useState } from 'react'

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

type UnifiedHistoryItem =
    | {
          kind: 'account'
          update: UpdateHistory<User>
          when: Date
          key: string
          selected: boolean
      }
    | {
          kind: 'donor'
          update: UpdateHistory<ActBlueDonor>
          when: Date
          key: string
          selected: boolean
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
    const [historyFormState, setHistoryFormState] =
        useState<FormState<User> | null>(null)

    const unified = useMemo(() => {
        const account: UnifiedHistoryItem[] = (user?.history ?? []).map(
            (u) => ({
                kind: 'account',
                update: u,
                when: u.historyWhenUpdatedUtc,
                key: `account:${u.historyId ?? `${u.id}:${u.historyWhenUpdatedUtc.getTime()}`}`,
                selected: selectedHistory?.historyId === u.historyId,
            })
        )

        const donor: UnifiedHistoryItem[] = (user?.donorHistory ?? []).map(
            (d) => ({
                kind: 'donor',
                update: d,
                when: d.historyWhenUpdatedUtc,
                key: `donor:${d.historyId ?? `${d.historyWhoUpdatedId ?? 'unknown'}:${d.historyWhenUpdatedUtc.getTime()}`}`,
                selected: selectedDonorHistory?.historyId === d.historyId,
            })
        )

        return [...account, ...donor].sort(
            (a, b) => b.when.getTime() - a.when.getTime()
        )
    }, [
        user?.history,
        user?.donorHistory,
        selectedHistory?.historyId,
        selectedDonorHistory?.historyId,
    ])

    const makeAccountLabel = (update: UpdateHistory<User>) => {
        return (
            <code className={styles.historyEntryCode}>
                {update.email ?? 'deleted user'}#{update.id.toString()}
            </code>
        )
    }

    const makeDonorLabel = (update: UpdateHistory<ActBlueDonor>) => {
        const label = update.historyWhoUpdatedId
            ? `${update.historyWhoUpdatedId}#${update.historyDataSource ?? 'Unknown'}`
            : `${update.historyDataSource ?? 'Unknown'}`

        return <code className={styles.historyEntryCode}>{label}</code>
    }

    const handleSelectUnified = (item: UnifiedHistoryItem) => {
        if (item.kind === 'account') {
            onSelectDonorHistory(null)
            onSelectHistory(item.update)
            return
        }

        onSelectHistory(null)
        onSelectDonorHistory(item.update)
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

    if (!unified.length) {
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
                title="History"
                history={unified}
                onSelect={handleSelectUnified}
                makeLabel={(item) =>
                    item.kind === 'account'
                        ? makeAccountLabel(item.update)
                        : makeDonorLabel(item.update)
                }
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

            {selectedDonorHistory ? (
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

interface AccountHistoryFieldProps extends Omit<
    FormGroupProps<unknown>,
    'dynamic' | 'children'
> {
    history: UnifiedHistoryItem[]
    onSelect: (item: UnifiedHistoryItem) => void
    makeLabel: (item: UnifiedHistoryItem) => ReactNode
}

function AccountHistoryField({
    title,
    defaultCollapsed,
    history,
    onSelect,
    makeLabel,
}: AccountHistoryFieldProps) {
    return (
        <CollapsibleSection title={title} initialOpenState={!defaultCollapsed}>
            <div className={styles.historyContainer}>
                {history.map((item) => {
                    const update = item.update as UpdateHistory<unknown>

                    return (
                        <div key={item.key}>
                            <button
                                type="button"
                                onClick={() => onSelect(item)}
                                className={cx(
                                    styles.historyEntry,
                                    item.selected && styles.historyEntrySelected
                                )}
                            >
                                <span
                                    className={cx(
                                        styles.historyEntryTag,
                                        item.kind === 'account'
                                            ? styles.historyEntryTagAccount
                                            : styles.historyEntryTagDonor
                                    )}
                                >
                                    {item.kind === 'account'
                                        ? 'Account'
                                        : 'Donor'}
                                </span>

                                <span className={styles.historyEntryPrefix}>
                                    {`${update.historyType == 'I' ? 'Created' : 'Updated'} at `}
                                </span>

                                <span className={styles.historyEntryDate}>
                                    {update.historyWhenUpdatedUtc.toLocaleString()}
                                </span>

                                <span className={styles.historyEntryPrefix}>
                                    {' by '}
                                </span>

                                {makeLabel(item)}
                            </button>
                        </div>
                    )
                })}
            </div>
        </CollapsibleSection>
    )
}
