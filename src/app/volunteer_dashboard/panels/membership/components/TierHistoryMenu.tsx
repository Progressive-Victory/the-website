'use client'

import {
    buildTierTimeline,
    filterRecurringContributions,
} from '../membership.helpers'
import { MemberMenuProps, MembershipTier } from '../membership.types'
import tags from './Tags.module.css'
import styles from './TierHistoryMenu.module.css'
import { DropdownOverlay } from '@/components/common'
import { cn } from '@/util'

const tierTagClass: Record<MembershipTier, string> = {
    'Dues Paying Member': tags.tagMember,
    'Premium Member': tags.tagPremium,
    'Signature Member': tags.tagSignature,
    'Inner Circle Member': tags.tagInnerCircle,
}

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

const formatAmount = (amount: number) =>
    amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export const TierHistoryMenu = ({ member, closeDropdown }: MemberMenuProps) => {
    const segments = buildTierTimeline(
        filterRecurringContributions(member.contributionRecords)
    ).reverse()

    return (
        <DropdownOverlay
            label="Tier History"
            onClose={closeDropdown}
            // Tier sits near the panel's left edge, so grow rightward instead of off-panel
            align="start"
            className={styles.tierHistoryOverlay}
            bodyClassName={styles.tierHistoryBody}
            body={
                segments.length === 0 ? (
                    <span className={styles.tierHistoryEmpty}>
                        No recurring contributions found
                    </span>
                ) : (
                    <>
                        <span className={styles.tierHistorySummary}>
                            {segments.length} tier change
                            {segments.length === 1 ? '' : 's'}
                        </span>
                        <div className={styles.listBox}>
                            {segments.map((segment) => (
                                <div
                                    key={`${segment.tier ?? 'none'}-${segment.from}`}
                                    className={styles.tierRow}
                                >
                                    <span className={styles.tierMeta}>
                                        <span
                                            className={cn(
                                                tags.tag,
                                                tags.tagTier,
                                                segment.tier
                                                    ? tierTagClass[segment.tier]
                                                    : tags.tagGhost
                                            )}
                                        >
                                            {segment.tier ?? 'Not A Member'}
                                        </span>
                                        <span className={styles.tierRange}>
                                            {formatDate(segment.from)}
                                            {segment.to !== segment.from &&
                                                ` – ${formatDate(segment.to)}`}
                                        </span>
                                        <span className={styles.tierPayments}>
                                            {segment.payments} payment
                                            {segment.payments === 1 ? '' : 's'}
                                        </span>
                                    </span>
                                    <span className={styles.tierAmount}>
                                        {formatAmount(segment.minAmount)}
                                        {segment.maxAmount !==
                                            segment.minAmount &&
                                            ` – ${formatAmount(segment.maxAmount)}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )
            }
        />
    )
}
