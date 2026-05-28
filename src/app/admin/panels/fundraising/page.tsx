'use client'

import styles from './page.module.css'
import {
    DropdownButton,
    DropdownOverlay,
    DashboardWidget,
    ProgressBar,
} from '@/components/common'
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

function formatCurrency(value?: number) {
    if (value == null || !Number.isFinite(value)) return '—'
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

function formatCount(value?: number) {
    if (value == null || !Number.isFinite(value)) return '—'
    return value.toLocaleString('en-US')
}

function formatDonationCountLabel(value?: number) {
    return `${formatCount(value)} ${value === 1 ? 'donation' : 'donations'}`
}

function startOfDayISO(d: Date): string {
    return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        0,
        0,
        0
    ).toISOString()
}

function endOfDayISO(d: Date): string {
    return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59
    ).toISOString()
}

function getPresetRange(preset: string): [string, string] {
    const today = new Date()

    switch (preset) {
        case 'All Time':
            return ['', '']
        case 'Year To Date':
            return [
                startOfDayISO(new Date(today.getFullYear(), 0, 1)),
                endOfDayISO(today),
            ]
        case 'Month To Date':
            return [
                startOfDayISO(
                    new Date(today.getFullYear(), today.getMonth(), 1)
                ),
                endOfDayISO(today),
            ]
        case 'Last Month': {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            const end = new Date(today.getFullYear(), today.getMonth(), 0)
            return [startOfDayISO(start), endOfDayISO(end)]
        }
        case 'Week To Date': {
            const day = today.getDay()
            const diff = day === 0 ? 6 : day - 1
            const start = new Date(today)
            start.setDate(today.getDate() - diff)
            return [startOfDayISO(start), endOfDayISO(today)]
        }
        case 'Last 7 Days': {
            const start = new Date(today)
            start.setDate(today.getDate() - 6)
            return [startOfDayISO(start), endOfDayISO(today)]
        }
        case 'Today':
            return [startOfDayISO(today), endOfDayISO(today)]
        case 'Yesterday': {
            const yesterday = new Date(today)
            yesterday.setDate(today.getDate() - 1)
            return [startOfDayISO(yesterday), endOfDayISO(yesterday)]
        }
        default:
            return ['', '']
    }
}

const PRESETS = [
    'All Time',
    'Year To Date',
    'Month To Date',
    'Last Month',
    'Week To Date',
    'Last 7 Days',
    'Today',
    'Yesterday',
] as const
type Preset = (typeof PRESETS)[number]
type DateRangeOption = Preset | 'Custom Range'

function isoToDateInput(iso: string): string {
    if (!iso) return ''
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function dateInputToStartISO(value: string): string {
    if (!value) return ''
    const [y, mo, d] = value.split('-').map(Number)
    return new Date(y, mo - 1, d, 0, 0, 0).toISOString()
}

function dateInputToEndISO(value: string): string {
    if (!value) return ''
    const [y, mo, d] = value.split('-').map(Number)
    return new Date(y, mo - 1, d, 23, 59, 59).toISOString()
}

function formatRangeDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
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
    const [startDate, setStartDate] = useState(() => getPresetRange('Today')[0])
    const [endDate, setEndDate] = useState(() => getPresetRange('Today')[1])
    const [activePreset, setActivePreset] = useState<Preset | null>('Today')
    const [previousPreset, setPreviousPreset] = useState<Preset | null>('Today')
    const [dateRangeOverlayMaxHeight, setDateRangeOverlayMaxHeight] =
        useState<number>()
    const [dateRangeOverlayOffset, setDateRangeOverlayOffset] = useState(0)
    const [draftStartDate, setDraftStartDate] = useState(startDate)
    const [draftEndDate, setDraftEndDate] = useState(endDate)
    const dateRangeTriggerRef = useRef<HTMLButtonElement | null>(null)
    const dateRangeOverlayRef = useRef<HTMLDivElement | null>(null)

    function applyPreset(preset: Preset) {
        const [start, end] = getPresetRange(preset)
        setStartDate(start)
        setEndDate(end)
        setActivePreset(preset)
        setPreviousPreset(preset)
    }

    const selectedRangeLabel = useMemo(() => {
        if (activePreset) return activePreset
        if (!startDate && !endDate) return 'All Time'
        if (startDate && endDate) {
            return `${formatRangeDate(startDate)} - ${formatRangeDate(endDate)}`
        }
        if (startDate) return `From ${formatRangeDate(startDate)}`
        if (endDate) return `Until ${formatRangeDate(endDate)}`
        return 'Custom Range'
    }, [activePreset, startDate, endDate])

    const todayInputValue = useMemo(
        () => isoToDateInput(new Date().toISOString()),
        []
    )
    const draftStartInputValue = useMemo(
        () => isoToDateInput(draftStartDate),
        [draftStartDate]
    )
    const draftEndInputValue = useMemo(
        () => isoToDateInput(draftEndDate),
        [draftEndDate]
    )
    const canApplyCustomRange = Boolean(draftStartDate && draftEndDate)

    const activeDateOption: DateRangeOption = activePreset ?? 'Custom Range'

    useEffect(() => {
        const trigger = dateRangeTriggerRef.current
        const overlay = dateRangeOverlayRef.current

        if (!trigger || !overlay) {
            setDateRangeOverlayMaxHeight(undefined)
            setDateRangeOverlayOffset(0)
            return
        }

        const viewportPadding = 12
        const constrainedBottomMargin = 16
        const triggerGap = 6

        const updateDateRangeOverlayPosition = () => {
            const currentTrigger = dateRangeTriggerRef.current
            const currentOverlay = dateRangeOverlayRef.current
            if (!currentTrigger || !currentOverlay) return

            const triggerRect = currentTrigger.getBoundingClientRect()
            const viewportHeight = window.innerHeight
            const naturalOverlayHeight = currentOverlay.scrollHeight
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
            const upwardShift = Math.min(overflowBelow, maxUpwardShift)

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
    }, [activeDateOption])

    const { onGet } = useFetch()

    const isAllTime = !startDate && !endDate

    const statsQuery = useQuery({
        queryKey: [
            '/actblue/fundraising/stats',
            startDate || null,
            endDate || null,
        ],
        queryFn: () =>
            onGet<ActBlueFundraisingStatsResponse>(
                '/actblue/fundraising/stats',
                zActBlueFundraisingStatsResponse,
                isAllTime
                    ? undefined
                    : {
                          query: {
                              ...(startDate && { startDate }),
                              ...(endDate && { endDate }),
                          },
                      }
            ),
        placeholderData: keepPreviousData,
    })

    const allTimeStatsQuery = useQuery({
        queryKey: ['/actblue/fundraising/stats', 'all-time-cards'],
        queryFn: () =>
            onGet<ActBlueFundraisingStatsResponse>(
                '/actblue/fundraising/stats',
                zActBlueFundraisingStatsResponse
            ),
    })

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

    const raisedKickerLabel = useMemo(() => {
        if (activePreset) return `Total Raised ${activePreset}`

        if (startDate && endDate) {
            return `Total Raised ${formatRangeDate(startDate)} - ${formatRangeDate(endDate)}`
        }

        if (startDate) {
            return `Total Raised From ${formatRangeDate(startDate)}`
        }

        if (endDate) {
            return `Total Raised Until ${formatRangeDate(endDate)}`
        }

        return 'Total Raised Custom Range'
    }, [activePreset, endDate, startDate])

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
                                    buttonVariant="long"
                                    label={selectedRangeLabel}
                                    onClick={() => {
                                        setDraftStartDate(startDate)
                                        setDraftEndDate(endDate)
                                    }}
                                    menu={({ closeDropdown }) => (
                                        <DropdownOverlay
                                            ref={dateRangeOverlayRef}
                                            className={
                                                styles.customDateRangeBox
                                            }
                                            style={{
                                                maxHeight:
                                                    dateRangeOverlayMaxHeight !=
                                                    null
                                                        ? `${dateRangeOverlayMaxHeight}px`
                                                        : undefined,
                                                transform: `translateY(-${dateRangeOverlayOffset}px)`,
                                            }}
                                        >
                                            <div
                                                className={
                                                    styles.customRangeLabel
                                                }
                                            >
                                                Select Range
                                            </div>

                                            <div
                                                className={
                                                    styles.dateRangeOptionList
                                                }
                                            >
                                                {PRESETS.map((preset) => (
                                                    <button
                                                        key={preset}
                                                        type="button"
                                                        className={`${styles.dateRangeOptionButton} ${activeDateOption === preset ? styles.dateRangeOptionButtonActive : ''}`}
                                                        onClick={() => {
                                                            applyPreset(preset)
                                                            setDraftStartDate(
                                                                getPresetRange(
                                                                    preset
                                                                )[0]
                                                            )
                                                            setDraftEndDate(
                                                                getPresetRange(
                                                                    preset
                                                                )[1]
                                                            )
                                                            closeDropdown()
                                                        }}
                                                    >
                                                        {preset}
                                                    </button>
                                                ))}

                                                <button
                                                    type="button"
                                                    className={`${styles.dateRangeOptionButton} ${activeDateOption === 'Custom Range' ? styles.dateRangeOptionButtonActive : ''}`}
                                                    onClick={() => {
                                                        setPreviousPreset(
                                                            activePreset
                                                        )
                                                        setActivePreset(null)
                                                        if (!draftStartDate)
                                                            setDraftStartDate(
                                                                startDate
                                                            )
                                                        if (!draftEndDate)
                                                            setDraftEndDate(
                                                                endDate
                                                            )
                                                    }}
                                                >
                                                    Custom Range
                                                </button>
                                            </div>

                                            {activeDateOption ===
                                                'Custom Range' && (
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
                                                                const next =
                                                                    dateInputToStartISO(
                                                                        ev
                                                                            .target
                                                                            .value
                                                                    )

                                                                if (
                                                                    next &&
                                                                    draftEndDate &&
                                                                    new Date(
                                                                        next
                                                                    ).getTime() >
                                                                        new Date(
                                                                            draftEndDate
                                                                        ).getTime()
                                                                ) {
                                                                    return
                                                                }

                                                                setDraftStartDate(
                                                                    next
                                                                )
                                                            }}
                                                            value={isoToDateInput(
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
                                                            max={
                                                                todayInputValue
                                                            }
                                                            onChange={(ev) => {
                                                                const next =
                                                                    dateInputToEndISO(
                                                                        ev
                                                                            .target
                                                                            .value
                                                                    )

                                                                if (
                                                                    next &&
                                                                    draftStartDate &&
                                                                    new Date(
                                                                        draftStartDate
                                                                    ).getTime() >
                                                                        new Date(
                                                                            next
                                                                        ).getTime()
                                                                ) {
                                                                    return
                                                                }

                                                                setDraftEndDate(
                                                                    next
                                                                )
                                                            }}
                                                            value={isoToDateInput(
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
                                                                setActivePreset(
                                                                    previousPreset
                                                                )
                                                                closeDropdown()
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
                                                                )
                                                                    return

                                                                setStartDate(
                                                                    draftStartDate
                                                                )
                                                                setEndDate(
                                                                    draftEndDate
                                                                )
                                                                setActivePreset(
                                                                    null
                                                                )
                                                                closeDropdown()
                                                            }}
                                                        >
                                                            Set Range
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </DropdownOverlay>
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
                            statsQuery.data?.recurringContributionCount != null
                                ? `${recurringPct}% of total`
                                : '—'
                        }
                        stat2={
                            statsQuery.data?.recurringContributionCount != null
                                ? formatDonationCountLabel(
                                      statsQuery.data.recurringContributionCount
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
                            statsQuery.data?.oneTimeContributionCount != null
                                ? `${oneTimePct}% of total`
                                : '—'
                        }
                        stat2={
                            statsQuery.data?.oneTimeContributionCount != null
                                ? formatDonationCountLabel(
                                      statsQuery.data.oneTimeContributionCount
                                  )
                                : '—'
                        }
                    />

                    <DashboardWidget
                        title="Donors"
                        value={formatCount(statsQuery.data?.totalDonorCount)}
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
    )
}
