'use client'

import styles from './page.module.css'
import {
    ActBlueFundraisingStatsResponse,
    zActBlueFundraisingStatsResponse,
} from '@/contracts/responses/fundraisingStatsResponse'
import { useFetch } from '@/util/hooks'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FaDonate } from 'react-icons/fa'
import { FaDollarSign } from 'react-icons/fa6'
import { FiChevronDown } from 'react-icons/fi'

function formatCount(value?: number) {
    if (value == null || !Number.isFinite(value)) return '—'
    return value.toLocaleString()
}

function formatCurrency(value?: number) {
    if (value == null || !Number.isFinite(value)) return '—'
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

function formatDonationCountLabel(value?: number) {
    return `${formatCount(value)} ${value === 1 ? 'donation' : 'donations'}`
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

function formatDateLabel(value: Date) {
    return Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(value)
}

interface FundraisingCardProps {
    title: string
    description: string
    href: string
    icon: React.ComponentType<{ size?: number }>
    count?: number
}

type DateRangePreset =
    | 'all-time'
    | 'month-to-date'
    | 'last-month'
    | 'today'
    | 'custom'

function toInputDateValue(value: Date | null) {
    if (!value) return ''

    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function fromInputGetDateValue(value: string) {
    if (!value) return null

    const [year, month, day] = value.split('-').map(Number)
    if (!year || !month || !day) return null

    return new Date(year, month - 1, day)
}

function isAfterDate(left: Date, right: Date) {
    const leftDate = startOfDay(left)
    const rightDate = startOfDay(right)
    return leftDate.getTime() > rightDate.getTime()
}

function startOfDay(value: Date) {
    const output = new Date(value)
    output.setHours(0, 0, 0, 0)
    return output
}

function endOfDay(value: Date) {
    const output = new Date(value)
    output.setHours(23, 59, 59, 999)
    return output
}

function getDatesForPreset(preset: DateRangePreset) {
    const now = new Date()

    switch (preset) {
        case 'month-to-date': {
            const start = new Date(now.getFullYear(), now.getMonth(), 1)
            return { startDate: startOfDay(start), endDate: now }
        }
        case 'last-month': {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const end = new Date(now.getFullYear(), now.getMonth(), 0)
            return { startDate: startOfDay(start), endDate: endOfDay(end) }
        }
        case 'today': {
            return { startDate: startOfDay(now), endDate: endOfDay(now) }
        }
        case 'all-time':
        case 'custom':
        default:
            return { startDate: null, endDate: null }
    }
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
    const [dateRangePreset, setDateRangePreset] =
        useState<DateRangePreset>('all-time')
    const [isDateRangeOverlayOpen, setIsDateRangeOverlayOpen] = useState(false)
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [draftStartDate, setDraftStartDate] = useState<Date | null>(null)
    const [draftEndDate, setDraftEndDate] = useState<Date | null>(null)
    const dateRangeControlRef = useRef<HTMLDivElement | null>(null)
    const { onGet } = useFetch()

    const handlePresetChange = (preset: DateRangePreset) => {
        setDateRangePreset(preset)

        if (preset === 'custom') {
            setDraftStartDate(startDate)
            setDraftEndDate(endDate)
            setIsDateRangeOverlayOpen(true)
            return
        }

        setIsDateRangeOverlayOpen(false)
        const nextRange = getDatesForPreset(preset)
        setStartDate(nextRange.startDate)
        setEndDate(nextRange.endDate)
    }

    const statsQuery = useQuery({
        queryKey: ['/actblue/fundraising/stats'],
        queryFn: async () =>
            onGet<ActBlueFundraisingStatsResponse>(
                '/actblue/fundraising/stats',
                zActBlueFundraisingStatsResponse,
                {
                    query: {
                        ...(startDate && {
                            startDate: startDate?.toISOString(),
                        }),
                        ...(endDate && { endDate: endDate?.toISOString() }),
                    },
                }
            ),
        placeholderData: keepPreviousData,
    })

    useEffect(() => {
        statsQuery.refetch().catch((err) => console.error(err))
    }, [startDate, endDate, statsQuery])

    useEffect(() => {
        const onDocumentMouseDown = (event: MouseEvent) => {
            if (!isDateRangeOverlayOpen) return

            const control = dateRangeControlRef.current
            if (!control) return

            if (!control.contains(event.target as Node)) {
                setIsDateRangeOverlayOpen(false)
                setDraftStartDate(startDate)
                setDraftEndDate(endDate)
            }
        }

        document.addEventListener('mousedown', onDocumentMouseDown)
        return () => {
            document.removeEventListener('mousedown', onDocumentMouseDown)
        }
    }, [isDateRangeOverlayOpen, startDate, endDate])

    const recurringPct = useMemo(() => {
        if (!statsQuery.data) return null

        const total = statsQuery.data.totalDollarsRaised
        if (!Number.isFinite(total) || total <= 0) return null

        const pct = Math.round(
            (statsQuery.data.recurringDollarsRaised / total) * 100
        )

        return Number.isFinite(pct) ? pct : null
    }, [statsQuery.data])

    const oneTimePct = useMemo(() => {
        if (!statsQuery.data) return null

        const total = statsQuery.data.totalDollarsRaised
        if (!Number.isFinite(total) || total <= 0) return null

        const pct = Math.round(
            (statsQuery.data.oneTimeDollarsRaised / total) * 100
        )

        return Number.isFinite(pct) ? pct : null
    }, [statsQuery.data])

    const selectedRangeLabel = useMemo(() => {
        if (dateRangePreset === 'all-time') return 'All Time'
        if (dateRangePreset === 'month-to-date') return 'Month to Date'
        if (dateRangePreset === 'last-month') return 'Last Month'
        if (dateRangePreset === 'today') return 'Today'

        if (startDate && endDate) {
            return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`
        }

        if (startDate) {
            return `From ${formatDateLabel(startDate)}`
        }

        if (endDate) {
            return `Until ${formatDateLabel(endDate)}`
        }

        return 'Custom Range'
    }, [dateRangePreset, endDate, startDate])

    const todayInputValue = useMemo(() => toInputDateValue(new Date()), [])
    const draftStartInputValue = useMemo(
        () => toInputDateValue(draftStartDate),
        [draftStartDate]
    )
    const draftEndInputValue = useMemo(
        () => toInputDateValue(draftEndDate),
        [draftEndDate]
    )
    const canApplyCustomRange = Boolean(draftStartDate && draftEndDate)

    const raisedKickerLabel = useMemo(() => {
        if (dateRangePreset === 'all-time') return 'Total Raised All Time'
        if (dateRangePreset === 'month-to-date')
            return 'Total Raised This Month'
        if (dateRangePreset === 'last-month') return 'Total Raised Last Month'
        if (dateRangePreset === 'today') return 'Total Raised Today'

        if (startDate && endDate) {
            return `Total Raised ${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`
        }

        if (startDate) {
            return `Total Raised From ${formatDateLabel(startDate)}`
        }

        if (endDate) {
            return `Total Raised Until ${formatDateLabel(endDate)}`
        }

        return 'Total Raised Custom Range'
    }, [dateRangePreset, endDate, startDate])

    return (
        <div className={styles.panelContents}>
            <div className={styles.panelHeader}>
                <div className={styles.breadcrumbs}>
                    <span className={styles.prominentBreadcrumb}>Admin</span>
                    <span className={styles.breadcrumbSeperator}>/</span>
                    <span className={styles.panelBreadcrumb}>Fundraising</span>
                </div>

                <div className={styles.panelTimestamp}>
                    Last Updated:{' '}
                    {/* logic will eventually need to be reworked to show last api fetch and not most recent contribution date */}
                    {formatDateTime(undefined) ?? 'n/a'}
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
                    <div className={styles.dashboardSummaryGroup}>
                        <div className={styles.dashboardKicker}>
                            {raisedKickerLabel}
                        </div>

                        <div className={styles.heroValue}>
                            {formatCurrency(
                                statsQuery.data?.totalDollarsRaised
                            )}
                        </div>
                    </div>

                    <div className={styles.dashboardDateGroup}>
                        <div className={styles.dateContainer}>
                            <div
                                ref={dateRangeControlRef}
                                className={styles.dateFilterControls}
                            >
                                <label
                                    htmlFor="fundraising-date-range-trigger"
                                    className={styles.dateFilterLabel}
                                >
                                    Date Range
                                </label>

                                <button
                                    id="fundraising-date-range-trigger"
                                    type="button"
                                    className={styles.dateRangeTriggerButton}
                                    onClick={() => {
                                        if (!isDateRangeOverlayOpen) {
                                            setDraftStartDate(startDate)
                                            setDraftEndDate(endDate)
                                        }

                                        setIsDateRangeOverlayOpen(
                                            (current) => !current
                                        )
                                    }}
                                    aria-haspopup="dialog"
                                    aria-expanded={isDateRangeOverlayOpen}
                                >
                                    <span>{selectedRangeLabel}</span>
                                    <FiChevronDown
                                        className={
                                            styles.dateRangeTriggerChevron
                                        }
                                        aria-hidden="true"
                                        size={14}
                                    />
                                </button>

                                {isDateRangeOverlayOpen && (
                                    <div className={styles.customDateRangeBox}>
                                        <div
                                            className={styles.customRangeLabel}
                                        >
                                            Select Range
                                        </div>
                                        <div
                                            className={
                                                styles.dateRangeOptionList
                                            }
                                        >
                                            <button
                                                type="button"
                                                className={`${styles.dateRangeOptionButton} ${dateRangePreset === 'all-time' ? styles.dateRangeOptionButtonActive : ''}`}
                                                onClick={() =>
                                                    handlePresetChange(
                                                        'all-time'
                                                    )
                                                }
                                            >
                                                All Time
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.dateRangeOptionButton} ${dateRangePreset === 'month-to-date' ? styles.dateRangeOptionButtonActive : ''}`}
                                                onClick={() =>
                                                    handlePresetChange(
                                                        'month-to-date'
                                                    )
                                                }
                                            >
                                                Month to Date
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.dateRangeOptionButton} ${dateRangePreset === 'last-month' ? styles.dateRangeOptionButtonActive : ''}`}
                                                onClick={() =>
                                                    handlePresetChange(
                                                        'last-month'
                                                    )
                                                }
                                            >
                                                Last Month
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.dateRangeOptionButton} ${dateRangePreset === 'today' ? styles.dateRangeOptionButtonActive : ''}`}
                                                onClick={() =>
                                                    handlePresetChange('today')
                                                }
                                            >
                                                Today
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.dateRangeOptionButton} ${dateRangePreset === 'custom' ? styles.dateRangeOptionButtonActive : ''}`}
                                                onClick={() =>
                                                    handlePresetChange('custom')
                                                }
                                            >
                                                Custom Range
                                            </button>
                                        </div>

                                        {dateRangePreset === 'custom' && (
                                            <>
                                                <div
                                                    className={
                                                        styles.customDateField
                                                    }
                                                >
                                                    <label htmlFor="custom-start-date">
                                                        Start Date
                                                    </label>
                                                    <input
                                                        id="custom-start-date"
                                                        type="date"
                                                        name="startDate"
                                                        max={
                                                            draftEndInputValue
                                                                ? draftEndInputValue <
                                                                  todayInputValue
                                                                    ? draftEndInputValue
                                                                    : todayInputValue
                                                                : todayInputValue
                                                        }
                                                        onChange={(ev) => {
                                                            const value =
                                                                fromInputGetDateValue(
                                                                    ev.target
                                                                        .value
                                                                )

                                                            if (
                                                                value &&
                                                                draftEndDate &&
                                                                isAfterDate(
                                                                    value,
                                                                    draftEndDate
                                                                )
                                                            ) {
                                                                return
                                                            }

                                                            setDraftStartDate(
                                                                value
                                                                    ? startOfDay(
                                                                          value
                                                                      )
                                                                    : null
                                                            )
                                                        }}
                                                        value={toInputDateValue(
                                                            draftStartDate
                                                        )}
                                                    />
                                                </div>

                                                <div
                                                    className={
                                                        styles.customDateField
                                                    }
                                                >
                                                    <label htmlFor="custom-end-date">
                                                        End Date
                                                    </label>
                                                    <input
                                                        id="custom-end-date"
                                                        type="date"
                                                        name="endDate"
                                                        min={
                                                            draftStartInputValue ||
                                                            undefined
                                                        }
                                                        max={todayInputValue}
                                                        onChange={(ev) => {
                                                            const value =
                                                                fromInputGetDateValue(
                                                                    ev.target
                                                                        .value
                                                                )

                                                            if (
                                                                value &&
                                                                draftStartDate &&
                                                                isAfterDate(
                                                                    draftStartDate,
                                                                    value
                                                                )
                                                            ) {
                                                                return
                                                            }

                                                            setDraftEndDate(
                                                                value
                                                                    ? endOfDay(
                                                                          value
                                                                      )
                                                                    : null
                                                            )
                                                        }}
                                                        value={toInputDateValue(
                                                            draftEndDate
                                                        )}
                                                    />
                                                </div>

                                                <div
                                                    className={
                                                        styles.customDateActions
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.cancelRangeButton
                                                        }
                                                        onClick={() => {
                                                            setDraftStartDate(
                                                                startDate
                                                            )
                                                            setDraftEndDate(
                                                                endDate
                                                            )
                                                            setIsDateRangeOverlayOpen(
                                                                false
                                                            )
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.setRangeButton
                                                        }
                                                        disabled={
                                                            !canApplyCustomRange
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                !canApplyCustomRange
                                                            ) {
                                                                return
                                                            }

                                                            setStartDate(
                                                                draftStartDate
                                                            )
                                                            setEndDate(
                                                                draftEndDate
                                                            )
                                                            setIsDateRangeOverlayOpen(
                                                                false
                                                            )
                                                        }}
                                                    >
                                                        Set Range
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.metricGrid}>
                    <article className={styles.metricCard}>
                        <div className={styles.metricLabel}>Recurring</div>
                        <div className={styles.metricValue}>
                            {formatCurrency(
                                statsQuery.data?.recurringDollarsRaised
                            )}
                        </div>
                        <div className={styles.metricMeta}>
                            {recurringPct != null &&
                            statsQuery.data?.recurringContributionCount != null
                                ? `${recurringPct}% of total · ${formatDonationCountLabel(statsQuery.data.recurringContributionCount)}`
                                : '—'}
                        </div>
                    </article>

                    <article className={styles.metricCard}>
                        <div className={styles.metricLabel}>One-Time</div>
                        <div className={styles.metricValue}>
                            {formatCurrency(
                                statsQuery.data?.oneTimeDollarsRaised
                            )}
                        </div>
                        <div className={styles.metricMeta}>
                            {oneTimePct != null &&
                            statsQuery.data?.oneTimeContributionCount != null
                                ? `${oneTimePct}% of total · ${formatDonationCountLabel(statsQuery.data.oneTimeContributionCount)}`
                                : '—'}
                        </div>
                    </article>

                    <article className={styles.metricCard}>
                        <div className={styles.metricLabel}>Donors</div>
                        <div className={styles.metricValue}>
                            {formatCount(statsQuery.data?.totalDonorCount)}
                        </div>
                        <div className={styles.metricMeta}>
                            {`${formatCount(statsQuery.data?.recurringDonorCount)} Recurring · ${formatCount(statsQuery.data?.oneTimeDonorCount)} One-Time`}
                        </div>
                    </article>

                    <article className={styles.metricCard}>
                        <div className={styles.metricLabel}>Contributions</div>
                        <div className={styles.metricValue}>
                            {formatCount(
                                statsQuery.data?.totalContributionCount
                            )}
                        </div>
                        <div className={styles.metricMeta}>
                            {`${formatCount(statsQuery.data?.recurringContributionCount)} Recurring · ${formatCount(statsQuery.data?.oneTimeContributionCount)} One-Time`}
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
                    count={statsQuery.data?.totalDonorCount}
                />

                <FundraisingCard
                    title="Contributions"
                    description="Contribution lineitems, payment info, and details."
                    href="/admin/panels/contributions"
                    icon={FaDollarSign}
                    count={statsQuery.data?.totalContributionCount}
                />
            </div>
        </div>
    )
}
