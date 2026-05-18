'use client'

import styles from './page.module.css'
import {
    DashboardWidget,
    DropdownButton,
    DropdownOverlay,
    DateRangePicker,
    ShareTracks,
    ToggleGroup,
} from '@/components/common'
import {
    Chart,
    type ChartPoint,
} from '@/components/common/charts/DualAxisBarLineChart'
import {
    buildChartBuckets,
    getValidChartGranularityModes,
    type ChartGranularityMode,
} from '@/components/common/charts/timeBuckets'
import { ActBlueDonationPacket, zActBlueDonationPacket } from '@/contracts/data'
import { SortDirection } from '@/contracts/requests'
import { PaginatedResponse, zPaginatedResponse } from '@/contracts/responses'
import {
    ActBlueFundraisingStatsResponse,
    zActBlueFundraisingStatsResponse,
} from '@/contracts/responses/fundraisingStatsResponse'
import { useFetch } from '@/util/hooks'
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FaDonate } from 'react-icons/fa'
import { FaDollarSign } from 'react-icons/fa6'
import { FiCheck } from 'react-icons/fi'

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

function formatCurrencyAxis(value: number, step: number): string {
    if (!Number.isFinite(value)) return ''
    let digits = 0
    if (step < 1) digits = 2
    else if (step < 10 && !Number.isInteger(step)) digits = 1
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toLocaleString('en-US', {
            maximumFractionDigits: 1,
        })}M`
    }
    if (value >= 10_000) {
        return `$${Math.round(value / 1000).toLocaleString('en-US')}k`
    }
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })
}

function formatCountAxis(value: number): string {
    if (!Number.isFinite(value)) return ''
    const rounded = Math.round(value)
    if (rounded >= 1_000_000) {
        return `${(rounded / 1_000_000).toLocaleString('en-US', {
            maximumFractionDigits: 1,
        })}M`
    }
    if (rounded >= 10_000) {
        return `${Math.round(rounded / 1000).toLocaleString('en-US')}k`
    }
    return rounded.toLocaleString('en-US')
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

function addDays(date: Date, days: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
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

function getResolvedPresetRange(
    preset: Preset,
    allTimeFirstIso?: string
): [string, string] {
    let [startIso, endIso] = getPresetRange(preset)

    if (preset === 'All Time') {
        const today = new Date()
        endIso = endOfDayISO(today)
        startIso = allTimeFirstIso
            ? startOfDayISO(new Date(allTimeFirstIso))
            : startOfDayISO(today)
    }

    return [startIso, endIso]
}

function inferPresetFromRange(
    startIso: string,
    endIso: string,
    allTimeFirstIso?: string
): Preset | null {
    if (!startIso || !endIso) return null

    for (const preset of PRESETS) {
        const [presetStart, presetEnd] = getResolvedPresetRange(
            preset,
            allTimeFirstIso
        )
        if (startIso === presetStart && endIso === presetEnd) {
            return preset
        }
    }

    return null
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

function isXToDatePreset(
    preset: Preset | null
): preset is 'Year To Date' | 'Month To Date' | 'Week To Date' | 'Today' {
    return (
        preset === 'Year To Date' ||
        preset === 'Month To Date' ||
        preset === 'Week To Date' ||
        preset === 'Today'
    )
}

function getXToDatePeriodName(
    preset: Preset | null,
    granularityMode: ChartGranularityMode
): string {
    if (preset === 'Year To Date') return 'Year'
    if (preset === 'Month To Date') return 'Month'
    if (preset === 'Week To Date') return 'Week'
    if (preset === 'Today' && granularityMode === 'hour') return 'Hour'
    return 'Date'
}

function getExtendedEndForXToDatePreset(
    preset: 'Year To Date' | 'Month To Date' | 'Week To Date' | 'Today',
    startIso: string,
    endIso: string
): string {
    if (!startIso || !endIso) return endIso

    if (preset === 'Today') {
        const d = new Date(startIso)
        return endOfDayISO(d)
    }

    if (preset === 'Year To Date') {
        const d = new Date(startIso)
        return endOfDayISO(new Date(d.getFullYear(), 11, 31))
    }

    if (preset === 'Month To Date') {
        const d = new Date(startIso)
        return endOfDayISO(new Date(d.getFullYear(), d.getMonth() + 1, 0))
    }

    const start = new Date(startIso)
    const weekEnd = addDays(
        new Date(start.getFullYear(), start.getMonth(), start.getDate()),
        6
    )
    return endOfDayISO(weekEnd)
}

function formatRangeDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

const CHART_GRANULARITY_LABELS: Record<ChartGranularityMode, string> = {
    auto: 'Auto',
    year: 'Years',
    quarter: 'Quarters',
    month: 'Months',
    week: 'Weeks',
    day: 'Days',
    hour: 'Hours',
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

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

export default function Page() {
    const [startDate, setStartDate] = useState(() => getPresetRange('Today')[0])
    const [endDate, setEndDate] = useState(() => getPresetRange('Today')[1])
    const [committedPreset, setCommittedPreset] = useState<Preset | null>(
        'Today'
    )
    const [draftPreset, setDraftPreset] = useState<Preset | null>('Today')
    const [isDateRangeOverlayOpen, setIsDateRangeOverlayOpen] = useState(false)
    const [dateRangeOverlayMaxHeight, setDateRangeOverlayMaxHeight] =
        useState<number>()
    const [dateRangeOverlayOffset, setDateRangeOverlayOffset] = useState(0)
    const [draftStartDate, setDraftStartDate] = useState(startDate)
    const [draftEndDate, setDraftEndDate] = useState(endDate)
    const dateRangeControlRef = useRef<HTMLDivElement | null>(null)
    const dateRangeTriggerRef = useRef<HTMLButtonElement | null>(null)
    const dateRangeOverlayRef = useRef<HTMLDivElement | null>(null)

    const [smoothLine, setSmoothLine] = useState(true)
    const [showAreaFill, setShowAreaFill] = useState(true)
    const [showDonationsLine, setShowDonationsLine] = useState(true)
    const [showFullXToDateSpan, setShowFullXToDateSpan] = useState(false)
    const [granularityMode, setGranularityMode] =
        useState<ChartGranularityMode>('auto')
    const [isChartOptionsOpen, setIsChartOptionsOpen] = useState(false)
    const chartOptionsControlRef = useRef<HTMLDivElement | null>(null)

    const selectedRangeLabel = useMemo(() => {
        if (committedPreset) return committedPreset
        if (!startDate && !endDate) return 'All Time'
        if (startDate && endDate) {
            if (isSameDay(new Date(startDate), new Date(endDate))) {
                return formatRangeDate(startDate)
            }
            return `${formatRangeDate(startDate)} - ${formatRangeDate(endDate)}`
        }
        if (startDate) return `From ${formatRangeDate(startDate)}`
        if (endDate) return `Until ${formatRangeDate(endDate)}`
        return 'All Time'
    }, [committedPreset, startDate, endDate])

    const hasValidDraft = Boolean(draftStartDate && draftEndDate)
    const isAwaitingDraftEndDate = Boolean(draftStartDate && !draftEndDate)
    const isDraftUnchanged =
        draftStartDate === startDate &&
        draftEndDate === endDate &&
        draftPreset === committedPreset
    const canApplyCustomRange = hasValidDraft && !isDraftUnchanged

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
    }, [isDateRangeOverlayOpen, startDate, endDate, committedPreset])

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

        const updateDateRangeOverlayPosition = () => {
            const trigger = dateRangeTriggerRef.current
            const overlay = dateRangeOverlayRef.current
            if (!trigger || !overlay) return

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
    }, [isDateRangeOverlayOpen])

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

    const earliestContributionQuery = useQuery({
        queryKey: ['/actblue/contributions', 'earliest'],
        queryFn: () =>
            onGet<PaginatedResponse<ActBlueDonationPacket>>(
                '/actblue/contributions',
                zPaginatedResponse(zActBlueDonationPacket),
                {
                    query: {
                        page: 0,
                        limit: 1,
                        sortField: 'paidAt',
                        sort: SortDirection.ASC,
                    },
                }
            ),
        staleTime: 5 * 60_000,
    })

    const allTimeFirstIso = useMemo(() => {
        const first = earliestContributionQuery.data?.data?.[0]?.paidAt
        if (!first) return undefined
        const d = first instanceof Date ? first : new Date(first)
        return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
    }, [earliestContributionQuery.data])

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

    const chartEndDate = useMemo(() => {
        if (!showFullXToDateSpan) return endDate
        if (!isXToDatePreset(committedPreset)) return endDate
        return getExtendedEndForXToDatePreset(
            committedPreset,
            startDate,
            endDate
        )
    }, [showFullXToDateSpan, committedPreset, startDate, endDate])

    const validGranularityModes = useMemo(
        () => getValidChartGranularityModes(startDate, chartEndDate),
        [startDate, chartEndDate]
    )

    const isXToDateSpanOptionRelevant = useMemo(
        () => isXToDatePreset(committedPreset),
        [committedPreset]
    )

    const chartBuckets = useMemo(
        () =>
            buildChartBuckets(
                startDate,
                chartEndDate,
                allTimeFirstIso,
                granularityMode,
                committedPreset === 'All Time'
            ),
        [
            startDate,
            chartEndDate,
            allTimeFirstIso,
            granularityMode,
            committedPreset,
        ]
    )

    const chartBucketQueries = useQueries({
        queries: chartBuckets.map((bucket) => ({
            queryKey: [
                '/actblue/fundraising/stats',
                'bucket',
                bucket.startIso,
                bucket.endIso,
            ],
            queryFn: () =>
                onGet<ActBlueFundraisingStatsResponse>(
                    '/actblue/fundraising/stats',
                    zActBlueFundraisingStatsResponse,
                    {
                        query: {
                            startDate: bucket.startIso,
                            endDate: bucket.endIso,
                        },
                    }
                ),
            staleTime: 60_000,
            placeholderData: keepPreviousData,
        })),
    })

    const chartData = useMemo(() => {
        return chartBuckets.map((bucket, idx) => {
            const data = chartBucketQueries[idx]?.data
            return {
                key: bucket.key,
                label: bucket.label,
                oneTime: data?.oneTimeDollarsRaised ?? 0,
                recurring: data?.recurringDollarsRaised ?? 0,
                donations: data?.totalContributionCount ?? 0,
            }
        })
    }, [chartBuckets, chartBucketQueries])

    useEffect(() => {
        if (!validGranularityModes.includes(granularityMode)) {
            setGranularityMode('auto')
        }
    }, [validGranularityModes, granularityMode])

    const chartPoints = useMemo<ChartPoint[]>(() => {
        return chartBuckets.map((bucket, idx) => {
            const item = chartData[idx]
            const anchor = new Date(bucket.anchorIso)

            let fullLabel: string
            if (bucket.granularity === 'year') {
                fullLabel = String(anchor.getFullYear())
            } else if (bucket.granularity === 'hour') {
                fullLabel = anchor.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                })
            } else if (bucket.granularity === 'quarter') {
                const quarter = Math.floor(anchor.getMonth() / 3) + 1
                fullLabel = `Q${quarter} ${anchor.getFullYear()}`
            } else if (bucket.granularity === 'month') {
                fullLabel = anchor.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                })
            } else if (bucket.granularity === 'week') {
                fullLabel = `Week of ${anchor.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })}`
            } else {
                fullLabel = anchor.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                })
            }

            return {
                key: bucket.key,
                anchorIso: bucket.anchorIso,
                granularity: bucket.granularity,
                label: bucket.label,
                fullLabel,
                primaryBarValue: item?.oneTime ?? 0,
                secondaryBarValue: item?.recurring ?? 0,
                lineValue: item?.donations ?? 0,
            }
        })
    }, [chartBuckets, chartData])

    const raisedKickerLabel = useMemo(() => {
        if (committedPreset) return `Total Raised ${committedPreset}`

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
    }, [committedPreset, endDate, startDate])

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

                    <Chart
                        title="Fundraising Volume"
                        hint="Date Range"
                        points={chartPoints}
                        smoothLine={smoothLine}
                        showAreaFill={showAreaFill}
                        showLine={showDonationsLine}
                        seriesLabels={{
                            primaryBar: 'One-Time Amount',
                            secondaryBar: 'Recurring Amount',
                            line: 'Total Donations',
                        }}
                        valueFormatters={{
                            primaryBar: (value) => formatCurrency(value),
                            secondaryBar: (value) => formatCurrency(value),
                            line: (value) => formatCount(value),
                        }}
                        axisFormatters={{
                            left: formatCurrencyAxis,
                            right: formatCountAxis,
                        }}
                        ariaLabel="Fundraising volume by period: one-time and recurring dollars with total donations"
                        chartAriaLabel={`Fundraising volume across ${chartPoints.length} periods`}
                        tableConfig={{
                            caption: 'Fundraising volume per period',
                            periodHeader: 'Period',
                            primaryBarHeader: 'One-Time',
                            secondaryBarHeader: 'Recurring',
                            lineHeader: 'Donations',
                        }}
                        headerRight={
                            <div
                                ref={chartOptionsControlRef}
                                className={styles.chartOptionsControl}
                            >
                                <DropdownButton
                                    type="button"
                                    isOpen={isChartOptionsOpen}
                                    label="Chart Options"
                                    buttonVariant="minimal"
                                    onClick={() =>
                                        setIsChartOptionsOpen(
                                            (current) => !current
                                        )
                                    }
                                    menu={
                                        isChartOptionsOpen ? (
                                            <DropdownOverlay
                                                className={
                                                    styles.chartOptionsBox
                                                }
                                                label="Chart Options"
                                                onClose={() =>
                                                    setIsChartOptionsOpen(false)
                                                }
                                                bodyClassName={
                                                    styles.chartOptionsBody
                                                }
                                                body={
                                                    <>
                                                        <div
                                                            className={
                                                                styles.chartOptionRow
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    styles.chartOptionLabel
                                                                }
                                                            >
                                                                Time scale
                                                            </span>
                                                            <ToggleGroup<ChartGranularityMode>
                                                                ariaLabel="Time scale"
                                                                className={
                                                                    styles.chartOptionToggle
                                                                }
                                                                buttonClassName={
                                                                    styles.chartOptionToggleButton
                                                                }
                                                                activeButtonClassName={
                                                                    styles.chartOptionToggleButtonActive
                                                                }
                                                                value={
                                                                    granularityMode
                                                                }
                                                                options={(
                                                                    [
                                                                        'auto',
                                                                        'year',
                                                                        'quarter',
                                                                        'month',
                                                                        'week',
                                                                        'day',
                                                                        'hour',
                                                                    ] as ChartGranularityMode[]
                                                                )
                                                                    .filter(
                                                                        (
                                                                            mode
                                                                        ) =>
                                                                            validGranularityModes.includes(
                                                                                mode
                                                                            )
                                                                    )
                                                                    .map(
                                                                        (
                                                                            mode
                                                                        ) => ({
                                                                            value: mode,
                                                                            label: CHART_GRANULARITY_LABELS[
                                                                                mode
                                                                            ],
                                                                        })
                                                                    )}
                                                                onChange={
                                                                    setGranularityMode
                                                                }
                                                            />
                                                        </div>

                                                        {isXToDateSpanOptionRelevant && (
                                                            <div
                                                                className={
                                                                    styles.chartOptionRow
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        styles.chartOptionLabel
                                                                    }
                                                                >
                                                                    Show{' '}
                                                                    {getXToDatePeriodName(
                                                                        committedPreset,
                                                                        granularityMode
                                                                    )}{' '}
                                                                    To Date
                                                                </span>
                                                                <ToggleGroup<boolean>
                                                                    ariaLabel="X-to-date span"
                                                                    className={
                                                                        styles.chartOptionToggle
                                                                    }
                                                                    buttonClassName={
                                                                        styles.chartOptionToggleButton
                                                                    }
                                                                    activeButtonClassName={
                                                                        styles.chartOptionToggleButtonActive
                                                                    }
                                                                    value={
                                                                        showFullXToDateSpan
                                                                    }
                                                                    options={[
                                                                        {
                                                                            value: true,
                                                                            label: 'Hide',
                                                                        },
                                                                        {
                                                                            value: false,
                                                                            label: 'Show',
                                                                        },
                                                                    ]}
                                                                    onChange={
                                                                        setShowFullXToDateSpan
                                                                    }
                                                                />
                                                            </div>
                                                        )}

                                                        <div
                                                            className={
                                                                styles.chartOptionRow
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    styles.chartOptionLabel
                                                                }
                                                            >
                                                                Contributions
                                                                line
                                                            </span>
                                                            <ToggleGroup<boolean>
                                                                ariaLabel="Contributions line"
                                                                className={
                                                                    styles.chartOptionToggle
                                                                }
                                                                buttonClassName={
                                                                    styles.chartOptionToggleButton
                                                                }
                                                                activeButtonClassName={
                                                                    styles.chartOptionToggleButtonActive
                                                                }
                                                                value={
                                                                    showDonationsLine
                                                                }
                                                                options={[
                                                                    {
                                                                        value: true,
                                                                        label: 'Show',
                                                                    },
                                                                    {
                                                                        value: false,
                                                                        label: 'Hide',
                                                                    },
                                                                ]}
                                                                onChange={
                                                                    setShowDonationsLine
                                                                }
                                                            />
                                                        </div>

                                                        {showDonationsLine && (
                                                            <>
                                                                <div
                                                                    className={
                                                                        styles.chartOptionRow
                                                                    }
                                                                >
                                                                    <span
                                                                        className={
                                                                            styles.chartOptionLabel
                                                                        }
                                                                    >
                                                                        Line
                                                                        style
                                                                    </span>
                                                                    <ToggleGroup<boolean>
                                                                        ariaLabel="Line style"
                                                                        className={
                                                                            styles.chartOptionToggle
                                                                        }
                                                                        buttonClassName={
                                                                            styles.chartOptionToggleButton
                                                                        }
                                                                        activeButtonClassName={
                                                                            styles.chartOptionToggleButtonActive
                                                                        }
                                                                        value={
                                                                            smoothLine
                                                                        }
                                                                        options={[
                                                                            {
                                                                                value: true,
                                                                                label: 'Curved',
                                                                            },
                                                                            {
                                                                                value: false,
                                                                                label: 'Straight',
                                                                            },
                                                                        ]}
                                                                        onChange={
                                                                            setSmoothLine
                                                                        }
                                                                    />
                                                                </div>

                                                                <div
                                                                    className={
                                                                        styles.chartOptionRow
                                                                    }
                                                                >
                                                                    <span
                                                                        className={
                                                                            styles.chartOptionLabel
                                                                        }
                                                                    >
                                                                        Area
                                                                        fill
                                                                    </span>
                                                                    <ToggleGroup<boolean>
                                                                        ariaLabel="Area fill"
                                                                        className={
                                                                            styles.chartOptionToggle
                                                                        }
                                                                        buttonClassName={
                                                                            styles.chartOptionToggleButton
                                                                        }
                                                                        activeButtonClassName={
                                                                            styles.chartOptionToggleButtonActive
                                                                        }
                                                                        value={
                                                                            showAreaFill
                                                                        }
                                                                        options={[
                                                                            {
                                                                                value: true,
                                                                                label: 'Show',
                                                                            },
                                                                            {
                                                                                value: false,
                                                                                label: 'Hide',
                                                                            },
                                                                        ]}
                                                                        onChange={
                                                                            setShowAreaFill
                                                                        }
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </>
                                                }
                                            ></DropdownOverlay>
                                        ) : null
                                    }
                                />
                            </div>
                        }
                    />

                    <ShareTracks
                        label="One-Time Share"
                        value={oneTimePct}
                        fill="linear-gradient(90deg, #9fb9e1 0%, #7f9fd4 52%, #6d95d1 100%)"
                    />
                    <ShareTracks
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
