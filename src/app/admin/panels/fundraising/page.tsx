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
    DashboardWidget,
    DropdownButton,
    DropdownOverlay,
    DateRangePicker,
    ProgressBar,
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
    const [dateRangeOverlayMaxHeight, setDateRangeOverlayMaxHeight] =
        useState<number>()
    const [dateRangeOverlayOffset, setDateRangeOverlayOffset] = useState(0)
    const [isNarrowDateRangeLayout, setIsNarrowDateRangeLayout] =
        useState(false)
    const dateRangeTriggerRef = useRef<HTMLButtonElement | null>(null)
    const dateRangeOverlayRef = useRef<HTMLDivElement | null>(null)

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
        const viewportPadding = 12
        const constrainedBottomMargin = 16
        const triggerGap = 6
        const narrowOverlayQuery = '(max-width: 53rem)'

        const updateDateRangeOverlayPosition = () => {
            const trigger = dateRangeTriggerRef.current
            const overlay = dateRangeOverlayRef.current
            if (!trigger || !overlay) return

            const isNarrowLayout = window.matchMedia(narrowOverlayQuery).matches
            setIsNarrowDateRangeLayout(isNarrowLayout)
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
    }, [draftStartDate, draftEndDate, committedPreset])

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
                                <div className={styles.dateFilterControls}>
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
                                        className={
                                            styles.dateRangeTriggerButton
                                        }
                                        buttonVariant="long"
                                        label={selectedRangeLabel}
                                        onClick={() => {
                                            setDraftStartDate(startDate)
                                            setDraftEndDate(endDate)
                                            setDraftPreset(committedPreset)
                                        }}
                                        menu={({ closeDropdown }) => (
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
                                                    marginTop:
                                                        isNarrowDateRangeLayout
                                                            ? '0.35rem'
                                                            : undefined,
                                                }}
                                                label="Select date range"
                                                onClose={() => {
                                                    closeDropdown()
                                                }}
                                                body={
                                                    <>
                                                        <div
                                                            className={
                                                                styles.dateRangePresetCol
                                                            }
                                                        >
                                                            {PRESETS.map(
                                                                (preset) => {
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
                                                                    if (isDraft)
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
                                                    if (!canApplyCustomRange)
                                                        return
                                                    setStartDate(draftStartDate)
                                                    setEndDate(draftEndDate)
                                                    setCommittedPreset(
                                                        draftPreset
                                                    )
                                                    closeDropdown()
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.metricGrid}>
                        <DashboardWidget
                            title="Recurring"
                            value={formatCurrency(
                                statsQuery.data?.recurringDollarsRaised
                            )}
                            stat1={
                                recurringPct != null &&
                                statsQuery.data?.recurringContributionCount !=
                                    null
                                    ? `${recurringPct}% of total`
                                    : '—'
                            }
                            stat2={
                                statsQuery.data?.recurringContributionCount !=
                                null
                                    ? formatDonationCountLabel(
                                          statsQuery.data
                                              .recurringContributionCount
                                      )
                                    : '—'
                            }
                        />

                        <DashboardWidget
                            title="One-Time"
                            value={formatCurrency(
                                statsQuery.data?.oneTimeDollarsRaised
                            )}
                            stat1={
                                oneTimePct != null &&
                                statsQuery.data?.oneTimeContributionCount !=
                                    null
                                    ? `${oneTimePct}% of total`
                                    : '—'
                            }
                            stat2={
                                statsQuery.data?.oneTimeContributionCount !=
                                null
                                    ? formatDonationCountLabel(
                                          statsQuery.data
                                              .oneTimeContributionCount
                                      )
                                    : '—'
                            }
                        />

                        <DashboardWidget
                            title="Donors"
                            value={formatCount(
                                statsQuery.data?.totalDonorCount
                            )}
                            stat1={`Recurring ${formatCount(
                                statsQuery.data?.recurringDonorCount
                            )}`}
                            stat2={`One-Time ${formatCount(
                                statsQuery.data?.oneTimeDonorCount
                            )}`}
                        />

                        <DashboardWidget
                            title="Contributions"
                            value={formatCount(
                                statsQuery.data?.totalContributionCount
                            )}
                            stat1={`Recurring ${formatCount(
                                statsQuery.data?.recurringContributionCount
                            )}`}
                            stat2={`One-Time ${formatCount(
                                statsQuery.data?.oneTimeContributionCount
                            )}`}
                        />
                    </div>

                    <ProgressBar
                        label="One-Time Share"
                        value={oneTimePct}
                        fill="linear-gradient(90deg, #9fb9e1 0%, #7f9fd4 52%, #6d95d1 100%)"
                    />
                    <ProgressBar
                        label="Recurring Share"
                        value={recurringPct}
                        fill="linear-gradient(90deg, #b8da72 0%, #94c92d 48%, #7fb800 100%)"
                    />
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
