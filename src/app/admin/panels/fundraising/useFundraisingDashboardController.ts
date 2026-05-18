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
import { useEffect, useMemo, useState } from 'react'

interface GetOptions {
    query?: QueryParams
    signal?: AbortSignal
}

type OnGet = <R>(
    url: string,
    schema: ZodSchema,
    options?: GetOptions
) => Promise<R>

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
    const [showFullXToDateSpan, setShowFullXToDateSpan] = useState(false)
    const [granularityMode, setGranularityMode] =
        useState<ChartGranularityMode>('auto')

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

    useEffect(() => {
        if (!validGranularityModes.includes(granularityMode)) {
            setGranularityMode('auto')
        }
    }, [validGranularityModes, granularityMode])

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
        showFullXToDateSpan,
        granularityMode,
        selectedRangeLabel,
        raisedKickerLabel,
        recurringPct,
        oneTimePct,
        validGranularityModes,
        chartPoints,
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
        setShowFullXToDateSpan,
        setGranularityMode,
    }
}
