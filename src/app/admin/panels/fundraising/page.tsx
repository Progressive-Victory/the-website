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

function formatCurrencyRounded(value?: number, step?: number) {
    if (value == null || !Number.isFinite(value)) return '—'

    let digits = 0
    if (step != null && Number.isFinite(step)) {
        if (step < 1) digits = 2
        else if (step < 10) digits = 1
    }

    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })
}

function roundUpToNiceStep(value: number, tickCount = 5, forceInteger = false) {
    if (!Number.isFinite(value) || value <= 0) {
        return { max: 1, step: 0.25 }
    }

    const safeTickCount = Math.max(2, tickCount)
    const rawStep = value / (safeTickCount - 1)

    const magnitude = 10 ** Math.floor(Math.log10(rawStep))
    const normalized = rawStep / magnitude

    let niceNormalized = 10
    if (normalized <= 1) niceNormalized = 1
    else if (normalized <= 2) niceNormalized = 2
    else if (normalized <= 2.5) niceNormalized = 2.5
    else if (normalized <= 5) niceNormalized = 5

    let step = niceNormalized * magnitude
    if (forceInteger) {
        step = Math.max(1, Math.ceil(step))
    }

    const max = Math.ceil(value / step) * step
    return { max: max > 0 ? max : 1, step }
}

function buildFiveTicks(maxValue: number, step: number) {
    if (!Number.isFinite(maxValue) || maxValue <= 0) {
        return [1, 0.75, 0.5, 0.25, 0]
    }

    return [
        maxValue,
        Math.max(0, maxValue - step),
        Math.max(0, maxValue - step * 2),
        Math.max(0, maxValue - step * 3),
        0,
    ]
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

interface ChartBucket {
    key: string
    label: string
}

function clampToNoon(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
}

function addDays(date: Date, days: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

function daysBetweenInclusive(start: Date, end: Date) {
    const msPerDay = 1000 * 60 * 60 * 24
    const startUtc = Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
    )
    const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
    return Math.max(1, Math.floor((endUtc - startUtc) / msPerDay) + 1)
}

function buildChartBuckets(startIso: string, endIso: string): ChartBucket[] {
    const today = clampToNoon(new Date())

    if (!startIso || !endIso) {
        const buckets: ChartBucket[] = []
        const anchor = new Date(today.getFullYear(), today.getMonth(), 1)

        for (let i = 11; i >= 0; i -= 1) {
            const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
            buckets.push({
                key: `${d.getFullYear()}-${d.getMonth() + 1}`,
                label: d.toLocaleDateString('en-US', { month: 'short' }),
            })
        }

        return buckets
    }

    const parsedStart = clampToNoon(new Date(startIso))
    const parsedEnd = clampToNoon(new Date(endIso))

    if (
        Number.isNaN(parsedStart.getTime()) ||
        Number.isNaN(parsedEnd.getTime())
    ) {
        return buildChartBuckets('', '')
    }

    const start = parsedStart <= parsedEnd ? parsedStart : parsedEnd
    const end = parsedStart <= parsedEnd ? parsedEnd : parsedStart
    const totalDays = daysBetweenInclusive(start, end)

    if (totalDays <= 14) {
        return Array.from({ length: totalDays }, (_, idx) => {
            const d = addDays(start, idx)
            return {
                key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
                label: d.toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                }),
            }
        })
    }

    if (totalDays <= 90) {
        const weekCount = Math.ceil(totalDays / 7)
        const step = Math.max(1, Math.ceil(weekCount / 12))
        const buckets: ChartBucket[] = []

        for (let idx = 0; idx < weekCount; idx += step) {
            const d = addDays(start, idx * 7)
            buckets.push({
                key: `w-${idx}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
                label: d.toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                }),
            })
        }

        return buckets
    }

    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1)
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
    const monthCount =
        (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
        (endMonth.getMonth() - startMonth.getMonth()) +
        1
    const step = Math.max(1, Math.ceil(monthCount / 12))
    const buckets: ChartBucket[] = []

    for (let idx = 0; idx < monthCount; idx += step) {
        const d = new Date(startMonth.getFullYear(), startMonth.getMonth() + idx, 1)
        buckets.push({
            key: `${d.getFullYear()}-${d.getMonth() + 1}`,
            label: d.toLocaleDateString('en-US', { month: 'short' }),
        })
    }

    return buckets
}

function buildNormalizedWeights(length: number): number[] {
    if (length <= 0) return []

    const raw = Array.from({ length }, (_, idx) => {
        const wobble = Math.sin((idx + 1) * 1.37) * 0.23
        const trend = Math.cos((idx + 1) * 0.79) * 0.14
        return Math.max(0.35, 1 + wobble + trend)
    })

    const sum = raw.reduce((acc, n) => acc + n, 0)
    return raw.map((n) => n / sum)
}

function distributeByWeights(total: number, weights: number[]) {
    if (!Number.isFinite(total) || total <= 0 || weights.length === 0) {
        return weights.map(() => 0)
    }

    const exact = weights.map((w) => total * w)
    const floored = exact.map((v) => Math.floor(v))
    let remainder = Math.round(total - floored.reduce((a, b) => a + b, 0))

    const byFraction = exact
        .map((value, idx) => ({ idx, frac: value - Math.floor(value) }))
        .sort((a, b) => b.frac - a.frac)

    let cursor = 0
    while (remainder > 0 && byFraction.length > 0) {
        const target = byFraction[cursor % byFraction.length]?.idx
        if (target == null) break
        floored[target] += 1
        remainder -= 1
        cursor += 1
    }

    return floored
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
    const [isDateRangeOverlayOpen, setIsDateRangeOverlayOpen] = useState(false)
    const [dateRangeOverlayMaxHeight, setDateRangeOverlayMaxHeight] =
        useState<number>()
    const [dateRangeOverlayOffset, setDateRangeOverlayOffset] = useState(0)
    const [draftStartDate, setDraftStartDate] = useState(startDate)
    const [draftEndDate, setDraftEndDate] = useState(endDate)
    const dateRangeControlRef = useRef<HTMLDivElement | null>(null)
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
    }, [isDateRangeOverlayOpen, activeDateOption])

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

    const chartBuckets = useMemo(
        () => buildChartBuckets(startDate, endDate),
        [startDate, endDate]
    )

    const chartData = useMemo(() => {
        const oneTimeTotal = statsQuery.data?.oneTimeDollarsRaised ?? 0
        const recurringTotal = statsQuery.data?.recurringDollarsRaised ?? 0
        const donationsTotal = statsQuery.data?.totalContributionCount ?? 0
        const oneTimeWeights = buildNormalizedWeights(chartBuckets.length)
        const recurringWeights = buildNormalizedWeights(chartBuckets.length).map(
            (weight, idx) =>
                Math.max(
                    0.001,
                    weight * (0.93 + Math.sin((idx + 1) * 1.11) * 0.08)
                )
        )
        const recurringWeightTotal = recurringWeights.reduce(
            (acc, value) => acc + value,
            0
        )
        const recurringNormalized = recurringWeights.map(
            (value) => value / recurringWeightTotal
        )
        const donationsWeights = buildNormalizedWeights(chartBuckets.length).map(
            (weight, idx) =>
                Math.max(
                    0.001,
                    weight * (0.9 + Math.cos((idx + 1) * 1.29) * 0.09)
                )
        )
        const donationsWeightTotal = donationsWeights.reduce(
            (acc, value) => acc + value,
            0
        )
        const donationsNormalized = donationsWeights.map(
            (value) => value / donationsWeightTotal
        )

        const oneTimeSeries = distributeByWeights(oneTimeTotal, oneTimeWeights)
        const recurringSeries = distributeByWeights(
            recurringTotal,
            recurringNormalized
        )
        const donationSeries = distributeByWeights(
            donationsTotal,
            donationsNormalized
        )

        return chartBuckets.map((bucket, idx) => ({
            key: bucket.key,
            label: bucket.label,
            oneTime: oneTimeSeries[idx] ?? 0,
            recurring: recurringSeries[idx] ?? 0,
            donations: donationSeries[idx] ?? 0,
        }))
    }, [
        chartBuckets,
        statsQuery.data?.oneTimeDollarsRaised,
        statsQuery.data?.recurringDollarsRaised,
        statsQuery.data?.totalContributionCount,
    ])

    const chartDollarScale = useMemo(() => {
        const maxSeriesValue = Math.max(
            ...chartData.map((item) => Math.max(item.oneTime, item.recurring)),
            0
        )
        return roundUpToNiceStep(maxSeriesValue, 5, false)
    }, [chartData])

    const chartDonationScale = useMemo(() => {
        const maxSeriesValue = Math.max(
            ...chartData.map((item) => item.donations),
            0
        )
        return roundUpToNiceStep(maxSeriesValue, 5, true)
    }, [chartData])

    const chartDollarTicks = useMemo(() => {
        return buildFiveTicks(chartDollarScale.max, chartDollarScale.step)
    }, [chartDollarScale.max, chartDollarScale.step])

    const chartDonationTicks = useMemo(() => {
        return buildFiveTicks(chartDonationScale.max, chartDonationScale.step)
    }, [chartDonationScale.max, chartDonationScale.step])

    const lineCoordinates = useMemo(() => {
        return chartData.map((item, idx) => {
            const x = ((idx + 0.5) / Math.max(chartData.length, 1)) * 100
            const yRaw =
                100 -
                Math.max(
                    0,
                    Math.min(100, (item.donations / chartDonationScale.max) * 100)
                )

            const y = Math.max(2, Math.min(98, yRaw))

            return { x, y }
        })
    }, [chartData, chartDonationScale.max])

    const linePath = useMemo(() => {
        return lineCoordinates.map((point) => `${point.x},${point.y}`).join(' ')
    }, [lineCoordinates])

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

                                <button
                                    id="fundraising-date-range-trigger"
                                    type="button"
                                    ref={dateRangeTriggerRef}
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
                                    <div
                                        ref={dateRangeOverlayRef}
                                        className={styles.customDateRangeBox}
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
                                            className={styles.customRangeLabel}
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
                                                        setIsDateRangeOverlayOpen(
                                                            false
                                                        )
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
                                                        setDraftEndDate(endDate)
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
                                                                    ev.target
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
                                                        max={todayInputValue}
                                                        onChange={(ev) => {
                                                            const next =
                                                                dateInputToEndISO(
                                                                    ev.target
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

                <section
                    className={styles.fundraisingBarGraph}
                    aria-label="Monthly one-time and recurring dollars with total donations line"
                >
                    <div className={styles.barGraphHeaderRow}>
                        <h2 className={styles.barGraphTitle}>
                            Fundraising Volume
                        </h2>
                        <span className={styles.barGraphHint}>
                            Date Range
                        </span>
                    </div>

                    <div className={styles.barGraphLegend}>
                        <span className={styles.legendItem}>
                            <span
                                className={`${styles.legendSwatch} ${styles.legendSwatchOneTime}`}
                                aria-hidden="true"
                            />
                            One-Time Amount
                        </span>
                        <span className={styles.legendItem}>
                            <span
                                className={`${styles.legendSwatch} ${styles.legendSwatchRecurring}`}
                                aria-hidden="true"
                            />
                            Recurring Amount
                        </span>
                        <span className={styles.legendItem}>
                            <span
                                className={`${styles.legendSwatch} ${styles.legendSwatchDonations}`}
                                aria-hidden="true"
                            />
                            Total Donations
                        </span>
                    </div>

                    <div className={styles.barGraphArea}>
                        <div className={styles.barGraphYAxisLeft}>
                            {chartDollarTicks.map((tick, index) => (
                                <span key={`dollar-${index}-${tick}`}>
                                    {formatCurrencyRounded(
                                        tick,
                                        chartDollarScale.step
                                    )}
                                </span>
                            ))}
                        </div>

                        <div className={styles.barGraphPlot}>
                            {chartDollarTicks.map((_, index) => (
                                <span
                                    key={`grid-${index}`}
                                    className={styles.barGraphGridLine}
                                    aria-hidden="true"
                                />
                            ))}

                            <div
                                className={styles.barGraphBars}
                                style={{
                                    ['--barGraphColumns' as string]: String(
                                        Math.max(chartData.length, 1)
                                    ),
                                }}
                            >
                                {chartData.map((item, idx) => {
                                    const oneTimeHeight = Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            (item.oneTime / chartDollarScale.max) *
                                                100
                                        )
                                    )
                                    const recurringHeight = Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            (item.recurring /
                                                chartDollarScale.max) * 100
                                        )
                                    )

                                    return (
                                        <div
                                            key={`${item.key}-${idx}`}
                                            className={styles.barGraphMonthItem}
                                        >
                                            <div
                                                className={styles.barGraphBarPair}
                                                aria-hidden="true"
                                            >
                                                <span
                                                    className={`${styles.barGraphBar} ${styles.barGraphBarOneTime}`}
                                                    style={{
                                                        height: `${oneTimeHeight}%`,
                                                    }}
                                                    title={`${item.label} One-Time: ${formatCurrency(item.oneTime)}`}
                                                />
                                                <span
                                                    className={`${styles.barGraphBar} ${styles.barGraphBarRecurring}`}
                                                    style={{
                                                        height: `${recurringHeight}%`,
                                                    }}
                                                    title={`${item.label} Recurring: ${formatCurrency(item.recurring)}`}
                                                />
                                            </div>
                                            <div className={styles.barGraphXLabel}>
                                                {item.label}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <svg
                                className={styles.barGraphLineSvg}
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                            >
                                <polyline
                                    className={styles.barGraphLinePath}
                                    points={linePath}
                                />
                            </svg>

                            {lineCoordinates.map((point, idx) => (
                                <span
                                    key={`line-point-${idx}`}
                                    className={styles.barGraphLinePoint}
                                    style={{
                                        left: `${point.x}%`,
                                        top: `${point.y}%`,
                                    }}
                                    title={`${chartData[idx]?.label} Donations: ${formatCount(chartData[idx]?.donations)}`}
                                />
                            ))}
                        </div>

                        <div className={styles.barGraphYAxisRight}>
                            {chartDonationTicks.map((tick, index) => (
                                <span key={`donations-${index}-${tick}`}>
                                    {formatCount(tick)}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <div className={styles.splitTrack}>
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
