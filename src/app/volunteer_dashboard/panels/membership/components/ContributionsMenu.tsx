'use client'

import {
    countMonthsWithLineitems,
    filterRecurringContributions,
    getEarliestLineitemDate,
    getMembershipTierForAmount,
} from '../membership.helpers'
import { ContributionRecord, MemberMenuProps } from '../membership.types'
import styles from './ContributionsMenu.module.css'
import tags from './Tags.module.css'
import { DropdownOverlay } from '@/components/common'
import { cn } from '@/util'
import { useRouter } from 'next/navigation'

const formatContributionDate = (value: string) =>
    new Date(value).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

const recurringAmountTagClass = (amount?: number) => {
    switch (getMembershipTierForAmount(amount)) {
        case 'Inner Circle Member':
            return tags.tagInnerCircle
        case 'Signature Member':
            return tags.tagSignature
        case 'Premium Member':
            return tags.tagPremium
        case 'Dues Paying Member':
            return tags.tagMember
        default:
            return undefined
    }
}

const formatAmount = (amount: number) =>
    amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const monthsElapsed = (start: Date, end: Date) =>
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth()) +
    1

const formatMonthLabel = (year: number, month: number) =>
    new Date(Date.UTC(year, month, 1)).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        timeZone: 'UTC',
    })

const buildMonthRange = (start: Date, end: Date) => {
    const months: { key: string; label: string }[] = []
    let year = start.getUTCFullYear()
    let month = start.getUTCMonth()

    while (
        year < end.getUTCFullYear() ||
        (year === end.getUTCFullYear() && month <= end.getUTCMonth())
    ) {
        months.push({
            key: `${year}-${month}`,
            label: formatMonthLabel(year, month),
        })
        month += 1
        if (month > 11) {
            month = 0
            year += 1
        }
    }

    return months
}

type MonthLineitem = NonNullable<
    ContributionRecord['lineitemsByMonth']
>[string][number]

interface MonthItemProps {
    item: MonthLineitem
    onlyRecurring?: boolean
}

const MonthItem = ({ item, onlyRecurring }: MonthItemProps) => (
    <span className={styles.monthItem}>
        <span className={styles.monthItemDate}>
            {item.orderNumber} &middot; {formatContributionDate(item.paidAt)}
        </span>
        <span
            className={cn(
                styles.monthItemAmount,
                onlyRecurring && recurringAmountTagClass(item.amount)
            )}
        >
            {formatAmount(item.amount)}
        </span>
    </span>
)

interface MonthRowProps {
    label: string
    items: MonthLineitem[]
    onlyRecurring?: boolean
}

const MonthRow = ({ label, items, onlyRecurring }: MonthRowProps) => (
    <div className={cn(styles.contributionRow, styles.contributionRowTop)}>
        <span className={styles.contributionDate}>{label}</span>
        {items.length === 0 ? (
            <span className={cn(styles.contributionAmount, tags.tagGhost)}>
                0 lineitems
            </span>
        ) : (
            <span className={styles.monthItems}>
                {items.map((item) => (
                    <MonthItem
                        key={item.orderNumber + item.paidAt}
                        item={item}
                        onlyRecurring={onlyRecurring}
                    />
                ))}
            </span>
        )}
    </div>
)

interface ContributionRowProps {
    record: ContributionRecord
    onlyRecurring?: boolean
    onSelect?: () => void
}

const ContributionRow = ({
    record,
    onlyRecurring,
    onSelect,
}: ContributionRowProps) => (
    <div
        className={cn(
            styles.contributionRow,
            onSelect && styles.contributionRowClickable
        )}
        onClick={onSelect}
    >
        <span className={styles.contributionMain}>
            <span className={styles.contributionDate}>
                {formatContributionDate(record.createdAt)}
            </span>
            <span className={styles.contributionForm}>
                {record.contributionForm}
            </span>
            <span className={styles.contributionLineitems}>
                {record.lineitemCount} lineitem
                {record.lineitemCount !== 1 && 's'}
            </span>
            {record.mostRecentLineitemDate && (
                <span className={styles.contributionLineitems}>
                    last paid{' '}
                    {formatContributionDate(record.mostRecentLineitemDate)}
                </span>
            )}
            {record.monthsSpanned != null && (
                <span className={styles.contributionLineitems}>
                    {record.monthsWithLineitems} of {record.monthsSpanned} month
                    {record.monthsSpanned !== 1 && 's'}
                </span>
            )}
        </span>
        <span
            className={cn(
                styles.contributionAmount,
                !onlyRecurring && record.isRecurring && tags.tagLightBlue,
                onlyRecurring && recurringAmountTagClass(record.recurringAmount)
            )}
        >
            {record.isRecurring && record.recurringAmount != null
                ? formatAmount(record.recurringAmount)
                : formatAmount(record.amount)}
        </span>
    </div>
)

export const ContributionsMenu = ({
    member,
    closeDropdown,
    onlyRecurring,
}: MemberMenuProps & { onlyRecurring?: boolean }) => {
    const router = useRouter()
    const records = (
        onlyRecurring
            ? filterRecurringContributions(member.contributionRecords)
            : [...(member.contributionRecords ?? [])]
    ).sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const earliestStart = getEarliestLineitemDate(records)
    const mostRecentEnd = records.reduce<string | undefined>(
        (latest, record) =>
            !latest ||
            (record.mostRecentLineitemDate &&
                record.mostRecentLineitemDate > latest)
                ? record.mostRecentLineitemDate
                : latest,
        undefined
    )
    const elapsedMonths =
        onlyRecurring && earliestStart && mostRecentEnd
            ? monthsElapsed(new Date(earliestStart), new Date(mostRecentEnd))
            : undefined
    const monthsWithAnyLineitem = countMonthsWithLineitems(records)
    const lineitemsByMonth = records.reduce<
        Record<
            string,
            { paidAt: string; amount: number; orderNumber: string }[]
        >
    >((byMonth, record) => {
        for (const [key, items] of Object.entries(
            record.lineitemsByMonth ?? {}
        )) {
            byMonth[key] = [...(byMonth[key] ?? []), ...items].sort(
                (a, b) =>
                    new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime()
            )
        }
        return byMonth
    }, {})
    const monthRows =
        earliestStart && mostRecentEnd
            ? buildMonthRange(
                  new Date(earliestStart),
                  new Date(mostRecentEnd)
              ).reverse()
            : []

    return (
        <DropdownOverlay
            label="Contributions"
            onClose={closeDropdown}
            className={styles.contributionsOverlay}
            bodyClassName={styles.contributionsBody}
            body={
                <>
                    {elapsedMonths != null &&
                        earliestStart &&
                        mostRecentEnd && (
                            <span className={styles.contributionsSummary}>
                                {elapsedMonths} month
                                {elapsedMonths === 1 ? '' : 's'} elapsed (
                                {formatContributionDate(earliestStart)} –{' '}
                                {formatContributionDate(mostRecentEnd)}),{' '}
                                {monthsWithAnyLineitem} with a lineitem
                            </span>
                        )}
                    {records.length === 0 ? (
                        <span className={styles.contributionsEmpty}>
                            No contributions found
                        </span>
                    ) : (
                        <div className={styles.listBox}>
                            {records.map((record) => (
                                <ContributionRow
                                    key={record.orderNumber}
                                    record={record}
                                    onlyRecurring={onlyRecurring}
                                    onSelect={
                                        onlyRecurring &&
                                        record.firstLineitemId != null
                                            ? () => {
                                                  closeDropdown()
                                                  router.push(
                                                      `/volunteer_dashboard/panels/contributions?lineitemId=${record.firstLineitemId}`
                                                  )
                                              }
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    )}
                    {monthRows.length > 0 && (
                        <>
                            <span className={styles.contributionsSummary}>
                                Months
                            </span>
                            <div className={styles.listBox}>
                                {monthRows.map((monthRow) => (
                                    <MonthRow
                                        key={monthRow.key}
                                        label={monthRow.label}
                                        items={
                                            lineitemsByMonth[monthRow.key] ?? []
                                        }
                                        onlyRecurring={onlyRecurring}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            }
        />
    )
}
