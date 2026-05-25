'use client'

import {
    PRESETS,
    formatCount,
    formatCurrency,
    formatDonationCountLabel,
    getResolvedPresetRange,
    inferPresetFromRange,
} from './fundraising.helpers'
import styles from './page.module.css'
import { useFundraisingDashboardController } from './useFundraisingDashboardController'
import {
    DropdownButton,
    DropdownOverlay,
    DateRangePicker,
} from '@/components/common'
import { useFetch } from '@/util/hooks'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FaDonate } from 'react-icons/fa'
import { FaDollarSign } from 'react-icons/fa6'
import { FiCheck } from 'react-icons/fi'

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
    const [isDateRangeOverlayOpen, setIsDateRangeOverlayOpen] = useState(false)
    const [dateRangeOverlayMaxHeight, setDateRangeOverlayMaxHeight] =
        useState<number>()
    const [dateRangeOverlayOffset, setDateRangeOverlayOffset] = useState(0)
    const dateRangeControlRef = useRef<HTMLDivElement | null>(null)
    const dateRangeTriggerRef = useRef<HTMLButtonElement | null>(null)
    const dateRangeOverlayRef = useRef<HTMLDivElement | null>(null)

    const [isChartOptionsOpen, setIsChartOptionsOpen] = useState(false)
    const chartOptionsControlRef = useRef<HTMLDivElement | null>(null)

    const { onGet } = useFetch()
    const {
        startDate,
        endDate,
        committedPreset,
        draftPreset,
        draftStartDate,
        draftEndDate,
        selectedRangeLabel,
        raisedKickerLabel,
        recurringPct,
        oneTimePct,
        allTimeFirstIso,
        canApplyCustomRange,
        isAwaitingDraftEndDate,
        statsQuery,
        allTimeStatsQuery,
        setStartDate,
        setEndDate,
        setCommittedPreset,
        setDraftPreset,
        setDraftStartDate,
        setDraftEndDate,
    } = useFundraisingDashboardController(onGet)

    useEffect(() => {
        const onDocumentMouseDown = (event: MouseEvent) => {
            if (!isDateRangeOverlayOpen) return

            const control = dateRangeControlRef.current
            if (!control) return

            if (!control.contains(event.target as Node)) {
                setIsDateRangeOverlayOpen(false)
                setDraftStartDate(startDate)
                setDraftEndDate(endDate)
                setDraftPreset(committedPreset)
            }
        }

        document.addEventListener('mousedown', onDocumentMouseDown)
        return () => {
            document.removeEventListener('mousedown', onDocumentMouseDown)
        }
    }, [
        isDateRangeOverlayOpen,
        startDate,
        endDate,
        committedPreset,
        setDraftStartDate,
        setDraftEndDate,
        setDraftPreset,
    ])

    useEffect(() => {
        if (!isChartOptionsOpen) return
        const onDocumentMouseDown = (event: MouseEvent) => {
            const control = chartOptionsControlRef.current
            if (!control) return
            if (!control.contains(event.target as Node)) {
                setIsChartOptionsOpen(false)
            }
        }
        document.addEventListener('mousedown', onDocumentMouseDown)
        return () => {
            document.removeEventListener('mousedown', onDocumentMouseDown)
        }
    }, [isChartOptionsOpen])

    useEffect(() => {
        if (!isDateRangeOverlayOpen) {
            setDateRangeOverlayMaxHeight(undefined)
            setDateRangeOverlayOffset(0)
            return
        }

        const viewportPadding = 12
        const constrainedBottomMargin = 16
        const triggerGap = 6
        const narrowOverlayQuery = '(max-width: 53rem)'

        const updateDateRangeOverlayPosition = () => {
            const trigger = dateRangeTriggerRef.current
            const overlay = dateRangeOverlayRef.current
            if (!trigger || !overlay) return

            const isNarrowLayout = window.matchMedia(narrowOverlayQuery).matches
            if (isNarrowLayout) {
                setDateRangeOverlayOffset(0)
                setDateRangeOverlayMaxHeight(undefined)
                return
            }

            const triggerRect = trigger.getBoundingClientRect()
            const viewportHeight = window.innerHeight
            const naturalOverlayHeight = overlay.scrollHeight
            const naturalTop = triggerRect.bottom + triggerGap
            const naturalViewportBottom = viewportHeight - viewportPadding

            const naturalBottom = naturalTop + naturalOverlayHeight
            const shouldUseConstrainedBottomMargin =
                naturalBottom > naturalViewportBottom
            const viewportBottom =
                viewportHeight -
                viewportPadding -
                (shouldUseConstrainedBottomMargin ? constrainedBottomMargin : 0)

            const overflowBelow = Math.max(0, naturalBottom - viewportBottom)
            const maxUpwardShift = Math.max(0, naturalTop - viewportPadding)
            const upwardShift = isNarrowLayout
                ? 0
                : Math.min(overflowBelow, maxUpwardShift)

            const shiftedTop = naturalTop - upwardShift
            const availableHeight = viewportBottom - shiftedTop

            setDateRangeOverlayOffset(Math.floor(upwardShift))

            if (availableHeight >= naturalOverlayHeight) {
                setDateRangeOverlayMaxHeight(undefined)
                return
            }

            setDateRangeOverlayMaxHeight(
                Math.max(0, Math.floor(availableHeight))
            )
        }

        updateDateRangeOverlayPosition()
        window.addEventListener('resize', updateDateRangeOverlayPosition)
        window.addEventListener('scroll', updateDateRangeOverlayPosition, true)

        return () => {
            window.removeEventListener('resize', updateDateRangeOverlayPosition)
            window.removeEventListener(
                'scroll',
                updateDateRangeOverlayPosition,
                true
            )
        }
    }, [isDateRangeOverlayOpen])

    return (
        <div className={styles.panelContents}>
            <div className={styles.panelHeader}>
                <div className={styles.breadcrumbs}>
                    <span className={styles.prominentBreadcrumb}>Admin</span>
                    <span className={styles.breadcrumbSeperator}>/</span>
                    <span className={styles.panelBreadcrumb}>Fundraising</span>
                </div>

                {/* logic will eventually need to be reworked to show last api fetch and not most recent contribution date */}
                <div className={styles.panelTimestamp}>Last Updated: N/A</div>
            </div>

            <div className={styles.scrollView}>
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

                                    <DropdownButton
                                        id="fundraising-date-range-trigger"
                                        type="button"
                                        ref={dateRangeTriggerRef}
                                        isOpen={isDateRangeOverlayOpen}
                                        buttonVariant="long"
                                        label={selectedRangeLabel}
                                        onClick={() => {
                                            if (!isDateRangeOverlayOpen) {
                                                setDraftStartDate(startDate)
                                                setDraftEndDate(endDate)
                                                setDraftPreset(committedPreset)
                                            }

                                            setIsDateRangeOverlayOpen(
                                                (current) => !current
                                            )
                                        }}
                                        menu={
                                            isDateRangeOverlayOpen ? (
                                                <DropdownOverlay
                                                    ref={dateRangeOverlayRef}
                                                    className={
                                                        styles.customDateRangeBox
                                                    }
                                                    narrowLayoutMode="flow"
                                                    style={{
                                                        maxHeight:
                                                            dateRangeOverlayMaxHeight !=
                                                            null
                                                                ? `${dateRangeOverlayMaxHeight}px`
                                                                : undefined,
                                                        transform: `translateY(-${dateRangeOverlayOffset}px)`,
                                                    }}
                                                    label="Select date range"
                                                    onClose={() => {
                                                        setIsDateRangeOverlayOpen(
                                                            false
                                                        )
                                                        setDraftStartDate(
                                                            startDate
                                                        )
                                                        setDraftEndDate(endDate)
                                                        setDraftPreset(
                                                            committedPreset
                                                        )
                                                    }}
                                                    body={
                                                        <>
                                                            <div
                                                                className={
                                                                    styles.dateRangePresetCol
                                                                }
                                                            >
                                                                {PRESETS.map(
                                                                    (
                                                                        preset
                                                                    ) => {
                                                                        const isCommitted =
                                                                            committedPreset ===
                                                                            preset
                                                                        const isDraft =
                                                                            draftPreset ===
                                                                            preset
                                                                        const classes =
                                                                            [
                                                                                styles.dateRangePresetButton,
                                                                            ]
                                                                        if (
                                                                            isCommitted
                                                                        )
                                                                            classes.push(
                                                                                styles.dateRangePresetButtonCommitted
                                                                            )
                                                                        if (
                                                                            isDraft
                                                                        )
                                                                            classes.push(
                                                                                styles.dateRangePresetButtonDraft
                                                                            )
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    preset
                                                                                }
                                                                                type="button"
                                                                                className={classes.join(
                                                                                    ' '
                                                                                )}
                                                                                onClick={() => {
                                                                                    const [
                                                                                        s,
                                                                                        e,
                                                                                    ] =
                                                                                        getResolvedPresetRange(
                                                                                            preset,
                                                                                            allTimeFirstIso
                                                                                        )
                                                                                    setDraftStartDate(
                                                                                        s
                                                                                    )
                                                                                    setDraftEndDate(
                                                                                        e
                                                                                    )
                                                                                    setDraftPreset(
                                                                                        preset
                                                                                    )
                                                                                }}
                                                                                aria-pressed={
                                                                                    isDraft
                                                                                }
                                                                                aria-current={
                                                                                    isCommitted
                                                                                        ? 'true'
                                                                                        : undefined
                                                                                }
                                                                            >
                                                                                <span>
                                                                                    {
                                                                                        preset
                                                                                    }
                                                                                </span>
                                                                                <span
                                                                                    className={
                                                                                        styles.dateRangePresetCheck
                                                                                    }
                                                                                    aria-hidden="true"
                                                                                >
                                                                                    {isCommitted ? (
                                                                                        <FiCheck
                                                                                            size={
                                                                                                14
                                                                                            }
                                                                                        />
                                                                                    ) : null}
                                                                                </span>
                                                                            </button>
                                                                        )
                                                                    }
                                                                )}
                                                            </div>

                                                            <DateRangePicker
                                                                startDate={
                                                                    draftStartDate
                                                                }
                                                                endDate={
                                                                    draftEndDate
                                                                }
                                                                onRangeChange={(
                                                                    nextStartDate: string,
                                                                    nextEndDate: string
                                                                ) => {
                                                                    setDraftStartDate(
                                                                        nextStartDate
                                                                    )
                                                                    setDraftEndDate(
                                                                        nextEndDate
                                                                    )
                                                                    setDraftPreset(
                                                                        inferPresetFromRange(
                                                                            nextStartDate,
                                                                            nextEndDate,
                                                                            allTimeFirstIso
                                                                        )
                                                                    )
                                                                }}
                                                            />
                                                        </>
                                                    }
                                                    bodyClassName={
                                                        styles.dateRangePopBody
                                                    }
                                                    footerButtonLabel={
                                                        isAwaitingDraftEndDate
                                                            ? 'Select End Date'
                                                            : 'Select'
                                                    }
                                                    footerButtonDisabled={
                                                        !canApplyCustomRange
                                                    }
                                                    footerButtonOnClick={() => {
                                                        if (
                                                            !canApplyCustomRange
                                                        )
                                                            return
                                                        setStartDate(
                                                            draftStartDate
                                                        )
                                                        setEndDate(draftEndDate)
                                                        setCommittedPreset(
                                                            draftPreset
                                                        )
                                                        setIsDateRangeOverlayOpen(
                                                            false
                                                        )
                                                    }}
                                                />
                                            ) : null
                                        }
                                    />
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
                                statsQuery.data?.recurringContributionCount !=
                                    null
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
                                statsQuery.data?.oneTimeContributionCount !=
                                    null
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
                            <div className={styles.metricLabel}>
                                Contributions
                            </div>
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
                                {recurringPct != null
                                    ? `${recurringPct}%`
                                    : '—'}
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
                        count={allTimeStatsQuery.data?.totalDonorCount}
                    />
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
                    count={allTimeStatsQuery.data?.totalDonorCount}
                />

                    <FundraisingCard
                        title="Contributions"
                        description="Contribution lineitems, payment info, and details."
                        href="/admin/panels/contributions"
                        icon={FaDollarSign}
                        count={allTimeStatsQuery.data?.totalContributionCount}
                    />
                </div>
            </div>
        </div>
    )
}
