'use client'

import { useFieldHistory } from '../hooks'
import { DescribeChange, Member } from '../membership.types'
import styles from './FieldHistory.module.css'
import { User } from 'pv-contracts/data'

export const selectUserHistory = (user: User) => user.history ?? []

const formatHistoryDate = (value: Date) =>
    value.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

export interface FieldHistoryProps {
    member: Member
    title: string
    emptyMessage: string
    describeChange: DescribeChange
}

export const FieldHistory = ({
    member,
    title,
    emptyMessage,
    describeChange,
}: FieldHistoryProps) => {
    const userId = member.userId
    const { history, isPending, isError } = useFieldHistory({
        userId,
        selectHistory: selectUserHistory,
        describeChange,
    })

    const statusMessage =
        userId == null
            ? 'No linked user'
            : isPending
              ? 'Loading…'
              : isError
                ? 'Failed to load history'
                : history.length === 0
                  ? emptyMessage
                  : undefined

    return (
        <div className={styles.historySection}>
            <span className={styles.historySectionLabel}>{title}</span>
            {statusMessage ? (
                <div className={styles.historyEmpty}>{statusMessage}</div>
            ) : (
                <div className={styles.historyContainer}>
                    {history.map(({ update, label, value }) => (
                        <div
                            key={update.historyId}
                            className={styles.historyEntry}
                        >
                            <span className={styles.historyEntryMain}>
                                <span className={styles.historyEntryPrefix}>
                                    {label}
                                </span>
                                <span className={styles.historyEntryName}>
                                    {value}
                                </span>
                            </span>
                            <span className={styles.historyEntryDateTag}>
                                {formatHistoryDate(
                                    update.historyWhenUpdatedUtc
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
