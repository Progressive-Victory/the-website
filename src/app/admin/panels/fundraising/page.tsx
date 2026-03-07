'use client'

import styles from './page.module.css'
import { ActBlueDonationPacket, zActBlueDonationPacket } from '@/contracts/data'
import { zActBlueDonor } from '@/contracts/data/ActBlueDonor'
import { usePaginatedSearch } from '@/util/hooks'
import Link from 'next/link'
import { FaDonate } from 'react-icons/fa'
import { FaDollarSign } from 'react-icons/fa6'

function formatCount(value?: number) {
    if (value == null) return '—'
    return value.toLocaleString()
}

function formatCurrency(value?: number) {
    if (value == null) return '—'
    return value.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    })
}

function formatDateTime(value?: Date) {
    if (value == null) return '—'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const target = new Date(value)
    target.setHours(0, 0, 0, 0)

    const diffMs = today.getTime() - target.getTime()
    const diffDays = Math.floor(diffMs / 86_400_000)

    if (diffDays <= 0) {
        return Intl.DateTimeFormat('en-US', {
            timeStyle: 'short',
        }).format(value)
    }

    if (diffDays >= 1 && diffDays <= 6) {
        return Intl.DateTimeFormat('en-US', {
            weekday: 'long',
        }).format(value)
    }

    return Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
    }).format(value)
}

interface FundraisingCardProps {
    title: string
    description: string
    href: string
    icon: React.ComponentType<{ size?: number }>
    count?: number
}

function FundraisingCard({
    title,
    description,
    href,
    icon: Icon,
    count,
}: FundraisingCardProps) {
    return (
        <Link href={href} className={styles.card} aria-label={`${title} panel`}>
            <div className={styles.cardTop}>
                <div className={styles.cardLeft}>
                    <div className={styles.iconPill} aria-hidden="true">
                        <Icon size={20} />
                    </div>

                    <div className={styles.cardTitle}>{title}</div>
                </div>

                <div className={styles.cardCount}>{formatCount(count)}</div>
            </div>

            <div className={styles.cardDescription}>{description}</div>
        </Link>
    )
}

export default function Page() {
    const donors = usePaginatedSearch('/actblue/donors', zActBlueDonor, {
        search: { limit: 0 },
    })

    const contributions = usePaginatedSearch<ActBlueDonationPacket>(
        '/actblue/contributions',
        zActBlueDonationPacket,
        { search: { limit: 0 } }
    )

    const contributionRecords = usePaginatedSearch<ActBlueDonationPacket>(
        '/actblue/contributions',
        zActBlueDonationPacket,
        {
            search: { limit: 200 },
            all: true,
        }
    )

    const allContributions = contributionRecords.query.data?.data

    const totalRaised = allContributions?.reduce(
        (sum, contribution) => sum + contribution.amount,
        0
    )

    const recurringRaised = allContributions
        ?.filter((contribution) => contribution.isRecurring)
        .reduce((sum, contribution) => sum + contribution.amount, 0)

    const oneTimeRaised = allContributions
        ?.filter((contribution) => !contribution.isRecurring)
        .reduce((sum, contribution) => sum + contribution.amount, 0)

    const recurringPct =
        totalRaised && recurringRaised != null
            ? Math.round((recurringRaised / totalRaised) * 100)
            : null
    const oneTimePct =
        totalRaised && oneTimeRaised != null
            ? Math.round((oneTimeRaised / totalRaised) * 100)
            : null

    const latestContributionAt =
        contributionRecords.query.data?.data.reduce<Date | null>(
            (latest, contribution) => {
                if (latest == null || contribution.paidAt > latest) {
                    return contribution.paidAt
                }
                return latest
            },
            null
        )

    return (
        <div className={styles.panelContents}>
            <div className={styles.panelHeader}>
                <div className={styles.breadcrumbs}>
                    <span className={styles.prominentBreadcrumb}>Admin</span>
                    <span className={styles.breadcrumbSeperator}>/</span>
                    <span className={styles.panelBreadcrumb}>Fundraising</span>
                </div>
            </div>

            <div className={styles.galleryHeader}>
                <h1 className={styles.galleryTitle}>Fundraising</h1>
                <p className={styles.gallerySubTitle}>
                    Manage ActBlue donors and contribution records.
                </p>
            </div>
            <div className={styles.dashboard}>
                <div className={styles.dashboardTopRow}>
                    <div className={styles.dashboardKicker}>
                        All-Time Performance
                    </div>

                    <div className={styles.dashboardTimestamp}>
                        Last Updated:{' '}
                        {/* logic will eventually need to be reworked to show last api fetch and not most recent contribution date */}
                        {formatDateTime(latestContributionAt ?? undefined) ?? "n/a"}
                    </div>
                </div>

                <div className={styles.dashboardHeroRow}>
                    <div className={styles.heroValue}>
                        {formatCurrency(totalRaised)}
                    </div>
                </div>

                <div className={styles.metricGrid}>
                    <article className={styles.metricCard}>
                        <div className={styles.metricLabel}>Recurring</div>
                        <div className={styles.metricValue}>
                            {formatCurrency(recurringRaised)}
                        </div>
                        <div className={styles.metricMeta}>
                            {recurringPct != null
                                ? `${recurringPct}% of total`
                                : '—'}
                        </div>
                    </article>

                    <article className={styles.metricCard}>
                        <div className={styles.metricLabel}>One-Time</div>
                        <div className={styles.metricValue}>
                            {formatCurrency(oneTimeRaised)}
                        </div>
                        <div className={styles.metricMeta}>
                            {oneTimePct != null
                                ? `${oneTimePct}% of total`
                                : '—'}
                        </div>
                    </article>

                    <article className={styles.metricCard}>
                        <div className={styles.metricLabel}>Donors</div>
                        <div className={styles.metricValue}>
                            {formatCount(donors.query.data?.count)}
                        </div>
                        <div className={styles.metricMeta}>
                            Total contributors
                        </div>
                    </article>

                    <article className={styles.metricCard}>
                        <div className={styles.metricLabel}>Contributions</div>
                        <div className={styles.metricValue}>
                            {formatCount(contributions.query.data?.count)}
                        </div>
                        <div className={styles.metricMeta}>
                            All captured events
                        </div>
                    </article>
                </div>

                <div className={styles.splitTrack}>
                    <div className={styles.splitRow}>
                        <span>Recurring Share</span>
                        <span>
                            {recurringPct != null ? `${recurringPct}%` : '—'}
                        </span>
                    </div>
                    <div className={styles.trackBar} aria-hidden="true">
                        <span
                            className={styles.trackFillRecurring}
                            style={{
                                width: `${Math.max(0, Math.min(100, recurringPct ?? 0))}%`,
                            }}
                        />
                    </div>

                    <div className={styles.splitRow}>
                        <span>One-Time Share</span>
                        <span>
                            {oneTimePct != null ? `${oneTimePct}%` : '—'}
                        </span>
                    </div>
                    <div className={styles.trackBar} aria-hidden="true">
                        <span
                            className={styles.trackFillOneTime}
                            style={{
                                width: `${Math.max(0, Math.min(100, oneTimePct ?? 0))}%`,
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.grid}>
                <FundraisingCard
                    title="Donors"
                    description="ActBlue donors, totals, and donor records."
                    href="/admin/panels/donors"
                    icon={FaDonate}
                    count={donors.query.data?.count}
                />

                <FundraisingCard
                    title="Contributions"
                    description="Contribution lineitems, payment info, and details."
                    href="/admin/panels/contributions"
                    icon={FaDollarSign}
                    count={contributions.query.data?.count}
                />
            </div>
        </div>
    )
}
