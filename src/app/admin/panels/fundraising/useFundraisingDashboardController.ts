import {
    getExtendedEndForXToDatePreset,
    getPercentage,
    getPresetRange,
    getRaisedKickerLabel,
    getSelectedRangeLabel,
    isXToDatePreset,
    type Preset,
} from './fundraising.helpers'
import type { ChartPoint } from '@/components/common/charts/DualAxisBarLineChart'
import {
    buildChartBuckets,
    getValidChartGranularityModes,
    type ChartGranularityMode,
} from '@/components/common/charts/timeBuckets'
import { SortDirection } from '@/contracts/requests'
import { useActblueQueries } from '@/queries'
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

type ChartBarDisplayMode = 'grouped' | 'stacked'

function getPreviousEquivalentRange(start: Date, end: Date) {
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null
    }

    const durationMs = end.getTime() - start.getTime()
    if (!Number.isFinite(durationMs) || durationMs < 0) {
        return null
    }

    const previousEnd = new Date(start.getTime() - 1000)
    const previousStart = new Date(previousEnd.getTime() - durationMs)

    return {
        start: previousStart,
        end: previousEnd,
    }
}

function isSameLocalDay(a: Date, b: Date): boolean {
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
        return false
    }

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

function formatFullLabel(
    anchor: Date,
    granularity: Exclude<ChartGranularityMode, 'auto'>
): string {
    if (granularity === 'year') return String(anchor.getFullYear())

    if (granularity === 'hour') {
        return anchor.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
    }

    if (granularity === 'quarter') {
        const quarter = Math.floor(anchor.getMonth() / 3) + 1
        return `Q${quarter} ${anchor.getFullYear()}`
    }

    if (granularity === 'month') {
        return anchor.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        })
    }

    if (granularity === 'week') {
        return `Week of ${anchor.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })}`
    }

    return anchor.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

export function useFundraisingDashboardController() {
    const actblueQueries = useActblueQueries()

    const [startDate, setStartDate] = useState(() => getPresetRange('Today')[0])
    const [endDate, setEndDate] = useState(() => getPresetRange('Today')[1])
    const [committedPreset, setCommittedPreset] = useState<Preset | null>(
        'Today'
    )
    const [draftPreset, setDraftPreset] = useState<Preset | null>('Today')

    const [draftStartDate, setDraftStartDate] = useState(startDate)
    const [draftEndDate, setDraftEndDate] = useState(endDate)

    const [smoothLine, setSmoothLine] = useState(true)
    const [showAreaFill, setShowAreaFill] = useState(true)
    const [showDonationsLine, setShowDonationsLine] = useState(true)
    const [chartBarDisplayMode, setChartBarDisplayMode] =
        useState<ChartBarDisplayMode>('grouped')
    const [zoomEnabled, setZoomEnabled] = useState(true)
    const [showFullXToDateSpan, setShowFullXToDateSpan] = useState(false)
    const [granularityMode, setGranularityMode] =
        useState<ChartGranularityMode>('auto')
    const [chartViewOverrideRange, setChartViewOverrideRange] = useState<{
        start: Date
        end: Date
    } | null>(null)

    const isAllTime = !startDate && !endDate

    const statsQuery = useQuery({
        queryKey: [
            '/actblue/fundraising/stats',
            startDate ?? null,
            endDate ?? null,
        ],
        queryFn: ({ signal }) =>
            actblueQueries.getFundraisingStats({
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                signal,
            }),
        placeholderData: keepPreviousData,
        enabled: actblueQueries.ready,
    })

    const previousPeriodRange = useMemo(() => {
        if (!startDate || !endDate) return null
        if (committedPreset === 'All Time') return null
        return getPreviousEquivalentRange(startDate, endDate)
    }, [startDate, endDate, committedPreset])

    const previousPeriodStatsQuery = useQuery({
        queryKey: [
            '/actblue/fundraising/stats',
            'previous-period',
            previousPeriodRange?.start ?? null,
            previousPeriodRange?.end ?? null,
        ],
        queryFn: ({ signal }) => {
            if (!previousPeriodRange) {
                throw new Error('Missing previous period range')
            }
            return actblueQueries.getFundraisingStats({
                startDate: previousPeriodRange.start.toISOString(),
                endDate: previousPeriodRange.end.toISOString(),
                signal,
            })
        },
        placeholderData: keepPreviousData,
        enabled: actblueQueries.ready && previousPeriodRange != null,
    })

    const allTimeStatsQuery = useQuery({
        queryKey: ['/actblue/fundraising/stats', 'all-time-cards'],
        queryFn: ({ signal }) => actblueQueries.getFundraisingStats({ signal }),
        enabled: actblueQueries.ready,
    })

    const earliestContributionQuery = useQuery({
        queryKey: ['/actblue/contributions', 'earliest'],
        queryFn: ({ signal }) =>
            actblueQueries.getContributions({
                search: {
                    page: 0,
                    limit: 1,
                    sortField: 'paidAt',
                    sort: SortDirection.ASC,
                },
                signal,
            }),
        enabled: actblueQueries.ready,
        staleTime: 5 * 60_000,
    })

    const allTimeFirst = useMemo(() => {
        const first = earliestContributionQuery.data?.data?.[0]?.paidAt
        if (!first) return undefined
        const d = first instanceof Date ? first : new Date(first)
        return Number.isNaN(d.getTime()) ? undefined : d
    }, [earliestContributionQuery.data])

    const recurringPct = useMemo(() => {
        if (!statsQuery.data) return null
        return getPercentage(
            statsQuery.data.recurringDollarsRaised,
            statsQuery.data.totalDollarsRaised
        )
    }, [statsQuery.data])

    const oneTimePct = useMemo(() => {
        if (!statsQuery.data) return null
        return getPercentage(
            statsQuery.data.oneTimeDollarsRaised,
            statsQuery.data.totalDollarsRaised
        )
    }, [statsQuery.data])

    const recurringDollarsChange = useMemo(() => {
        const current = statsQuery.data?.recurringDollarsRaised
        const previous = previousPeriodStatsQuery.data?.recurringDollarsRaised

        if (
            current == null ||
            previous == null ||
            !Number.isFinite(current) ||
            !Number.isFinite(previous)
        ) {
            return null
        }

        return current - previous
    }, [statsQuery.data, previousPeriodStatsQuery.data])

    const selectedChartStartDate = startDate
    const selectedChartBaseEndDate = endDate

    const selectedChartEndDate = useMemo(() => {
        if (!showFullXToDateSpan) return selectedChartBaseEndDate
        if (!isXToDatePreset(committedPreset)) return selectedChartBaseEndDate
        return getExtendedEndForXToDatePreset(
            committedPreset,
            selectedChartStartDate,
            selectedChartBaseEndDate
        )
    }, [
        showFullXToDateSpan,
        committedPreset,
        selectedChartStartDate,
        selectedChartBaseEndDate,
    ])

    const chartViewStartDate = chartViewOverrideRange?.start ?? startDate
    const chartViewBaseEndDate = chartViewOverrideRange?.end ?? endDate

    const chartEndDate = useMemo(() => {
        if (chartViewOverrideRange) return chartViewBaseEndDate
        if (!showFullXToDateSpan) return chartViewBaseEndDate
        if (!isXToDatePreset(committedPreset)) return chartViewBaseEndDate
        return getExtendedEndForXToDatePreset(
            committedPreset,
            chartViewStartDate,
            chartViewBaseEndDate
        )
    }, [
        chartViewOverrideRange,
        chartViewBaseEndDate,
        showFullXToDateSpan,
        committedPreset,
        chartViewStartDate,
    ])

    const validGranularityModes = useMemo(
        () => getValidChartGranularityModes(chartViewStartDate, chartEndDate),
        [chartViewStartDate, chartEndDate]
    )

    const chartBuckets = useMemo(
        () =>
            buildChartBuckets(
                chartViewStartDate,
                chartEndDate,
                allTimeFirst,
                granularityMode,
                !chartViewOverrideRange && committedPreset === 'All Time'
            ),
        [
            chartViewStartDate,
            chartEndDate,
            allTimeFirst,
            granularityMode,
            chartViewOverrideRange,
            committedPreset,
        ]
    )

    const chartBucketQueries = useQueries({
        queries: chartBuckets.map((bucket) => ({
            queryKey: [
                '/actblue/fundraising/stats',
                'bucket',
                bucket.start,
                bucket.end,
            ],
            queryFn: ({ signal }) =>
                actblueQueries.getFundraisingStats({
                    startDate: bucket.start.toISOString(),
                    endDate: bucket.end.toISOString(),
                    signal,
                }),
            enabled: actblueQueries.ready,
            staleTime: 60_000,
            placeholderData: keepPreviousData,
        })),
    })

    const chartPoints = useMemo<ChartPoint[]>(() => {
        return chartBuckets.map((bucket, idx) => {
            const data = chartBucketQueries[idx]?.data

            return {
                key: bucket.key,
                anchor: bucket.anchor,
                start: bucket.start,
                end: bucket.end,
                granularity: bucket.granularity,
                label: bucket.label,
                fullLabel: formatFullLabel(bucket.anchor, bucket.granularity),
                primaryBarValue: data?.oneTimeDollarsRaised ?? 0,
                secondaryBarValue: data?.recurringDollarsRaised ?? 0,
                lineValue: data?.totalContributionCount ?? 0,
            }
        })
    }, [chartBuckets, chartBucketQueries])

    if (
        granularityMode != 'auto' &&
        !validGranularityModes.includes(granularityMode)
    ) {
        setGranularityMode('auto')
    }

    const selectedRangeLabel = useMemo(
        () => getSelectedRangeLabel(committedPreset, startDate, endDate),
        [committedPreset, startDate, endDate]
    )

    const raisedKickerLabel = useMemo(
        () => getRaisedKickerLabel(committedPreset, startDate, endDate),
        [committedPreset, startDate, endDate]
    )

    const hasValidDraft = Boolean(draftStartDate && draftEndDate)
    const isAwaitingDraftEndDate = Boolean(draftStartDate && !draftEndDate)
    const isDraftUnchanged =
        draftStartDate === startDate &&
        draftEndDate === endDate &&
        draftPreset === committedPreset
    const canApplyCustomRange = hasValidDraft && !isDraftUnchanged

    const isXToDateSpanOptionRelevant = isXToDatePreset(committedPreset)

    const applyChartViewOverrideRange = (range: { start: Date; end: Date }) => {
        const selectedStart = selectedChartStartDate
        const selectedEnd = selectedChartEndDate

        if (
            selectedStart &&
            selectedEnd &&
            range.start.getTime() === selectedStart.getTime() &&
            range.end.getTime() === selectedEnd.getTime()
        ) {
            setChartViewOverrideRange(null)
            return
        }

        if (selectedStart && selectedEnd) {
            const oneDayMs = 24 * 60 * 60 * 1000
            const selectedInclusiveMs =
                selectedEnd.getTime() - selectedStart.getTime() + 1000
            const selectedIsOneDayWindow =
                Number.isFinite(selectedInclusiveMs) &&
                selectedInclusiveMs >= oneDayMs &&
                selectedInclusiveMs < oneDayMs * 2

            if (
                selectedIsOneDayWindow &&
                isSameLocalDay(range.start, selectedStart) &&
                isSameLocalDay(range.end, selectedEnd)
            ) {
                setChartViewOverrideRange(null)
                return
            }
        }
        setChartViewOverrideRange(range)
    }

    const chartViewOverrideActive =
        chartViewOverrideRange != null &&
        (chartViewOverrideRange.start.getTime() !==
            (selectedChartStartDate?.getTime() ?? NaN) ||
            chartViewOverrideRange.end.getTime() !==
                (selectedChartEndDate?.getTime() ?? NaN))

    const resetChartViewToSelectedRange = () => {
        setChartViewOverrideRange(null)
    }

    return {
        isAllTime,
        startDate,
        endDate,
        committedPreset,
        draftPreset,
        draftStartDate,
        draftEndDate,
        smoothLine,
        showAreaFill,
        showDonationsLine,
        chartBarDisplayMode,
        zoomEnabled,
        showFullXToDateSpan,
        granularityMode,
        selectedRangeLabel,
        raisedKickerLabel,
        recurringPct,
        oneTimePct,
        recurringDollarsChange,
        validGranularityModes,
        chartPoints,
        chartViewOverrideActive,
        allTimeFirst,
        isXToDateSpanOptionRelevant,
        hasValidDraft,
        isAwaitingDraftEndDate,
        canApplyCustomRange,
        statsQuery,
        allTimeStatsQuery,
        setStartDate,
        setEndDate,
        setCommittedPreset,
        setDraftPreset,
        setDraftStartDate,
        setDraftEndDate,
        setSmoothLine,
        setShowAreaFill,
        setShowDonationsLine,
        setChartBarDisplayMode,
        setZoomEnabled,
        setShowFullXToDateSpan,
        setGranularityMode,
        applyChartViewOverrideRange,
        resetChartViewToSelectedRange,
    }
}
