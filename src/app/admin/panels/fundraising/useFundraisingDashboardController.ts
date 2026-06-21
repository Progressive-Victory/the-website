import {
    getExtendedEndForXToDatePreset,
    getPercentage,
    getPresetRange,
    getRaisedKickerLabel,
    getSelectedRangeLabel,
    isXToDatePreset,
    type Preset,
} from './fundraising.helpers'
import {
    getEarliestContribution,
    getFundraisingBucketStats,
    getFundraisingStats,
} from './fundraising.service'
import type { ChartPoint } from '@/components/common/charts/DualAxisBarLineChart'
import {
    buildChartBuckets,
    getValidChartGranularityModes,
    type ChartGranularityMode,
} from '@/components/common/charts/timeBuckets'
import type { QueryParams, ZodSchema } from '@/util/hooks/useFetch'
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

interface GetOptions {
    query?: QueryParams
    signal?: AbortSignal
}

type OnGet = <R>(
    url: string,
    schema: ZodSchema,
    options?: GetOptions
) => Promise<R>

type ChartBarDisplayMode = 'grouped' | 'stacked'

function isSameLocalDay(aIso: string, bIso: string): boolean {
    const a = new Date(aIso)
    const b = new Date(bIso)

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
    anchorIso: string,
    granularity: Exclude<ChartGranularityMode, 'auto'>
): string {
    const anchor = new Date(anchorIso)

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

export function useFundraisingDashboardController(onGet: OnGet) {
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
        startIso: string
        endIso: string
    } | null>(null)

    const isAllTime = !startDate && !endDate

    const statsQuery = useQuery({
        queryKey: [
            '/actblue/fundraising/stats',
            startDate || null,
            endDate || null,
        ],
        queryFn: () => getFundraisingStats(onGet, startDate, endDate),
        placeholderData: keepPreviousData,
    })

    const allTimeStatsQuery = useQuery({
        queryKey: ['/actblue/fundraising/stats', 'all-time-cards'],
        queryFn: () => getFundraisingStats(onGet),
    })

    const earliestContributionQuery = useQuery({
        queryKey: ['/actblue/contributions', 'earliest'],
        queryFn: () => getEarliestContribution(onGet),
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

    const chartViewStartDate = chartViewOverrideRange?.startIso ?? startDate
    const chartViewBaseEndDate = chartViewOverrideRange?.endIso ?? endDate

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
                allTimeFirstIso,
                granularityMode,
                !chartViewOverrideRange && committedPreset === 'All Time'
            ),
        [
            chartViewStartDate,
            chartEndDate,
            allTimeFirstIso,
            granularityMode,
            chartViewOverrideRange,
            committedPreset,
        ]
    )

    // useEffect(() => {
    //     setChartViewOverrideRange(null)
    // }, [startDate, endDate, committedPreset])

    // useEffect(() => {
    //     if (!zoomEnabled) {
    //         setChartViewOverrideRange(null)
    //     }
    // }, [zoomEnabled])

    const chartBucketQueries = useQueries({
        queries: chartBuckets.map((bucket) => ({
            queryKey: [
                '/actblue/fundraising/stats',
                'bucket',
                bucket.startIso,
                bucket.endIso,
            ],
            queryFn: () =>
                getFundraisingBucketStats(
                    onGet,
                    bucket.startIso,
                    bucket.endIso
                ),
            staleTime: 60_000,
            placeholderData: keepPreviousData,
        })),
    })

    const chartPoints = useMemo<ChartPoint[]>(() => {
        return chartBuckets.map((bucket, idx) => {
            const data = chartBucketQueries[idx]?.data

            return {
                key: bucket.key,
                anchorIso: bucket.anchorIso,
                startIso: bucket.startIso,
                endIso: bucket.endIso,
                granularity: bucket.granularity,
                label: bucket.label,
                fullLabel: formatFullLabel(
                    bucket.anchorIso,
                    bucket.granularity
                ),
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

    const applyChartViewOverrideRange = (range: {
        startIso: string
        endIso: string
    }) => {
        const selectedStart = selectedChartStartDate
        const selectedEnd = selectedChartEndDate

        if (range.startIso === selectedStart && range.endIso === selectedEnd) {
            setChartViewOverrideRange(null)
            return
        }

        const oneDayMs = 24 * 60 * 60 * 1000
        const selectedInclusiveMs =
            new Date(selectedEnd).getTime() -
            new Date(selectedStart).getTime() +
            1000
        const selectedIsOneDayWindow =
            Number.isFinite(selectedInclusiveMs) &&
            selectedInclusiveMs >= oneDayMs &&
            selectedInclusiveMs < oneDayMs * 2

        if (
            selectedIsOneDayWindow &&
            isSameLocalDay(range.startIso, selectedStart) &&
            isSameLocalDay(range.endIso, selectedEnd)
        ) {
            setChartViewOverrideRange(null)
            return
        }
        console.debug('Applying chart view override range:', range)
        setChartViewOverrideRange(range)
    }

    const chartViewOverrideActive =
        chartViewOverrideRange != null &&
        (chartViewOverrideRange.startIso !== selectedChartStartDate ||
            chartViewOverrideRange.endIso !== selectedChartEndDate)

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
        validGranularityModes,
        chartPoints,
        chartViewOverrideActive,
        allTimeFirstIso,
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
