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
import { useActblueQueries } from '@/queries'
import { usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
    zActBlueDonationPacket,
    type ActBlueDonationPacket,
} from 'pv-contracts/data'
import { SortDirection } from 'pv-contracts/requests'
import type { MembershipSearchRequest } from 'pv-contracts/requests'
import {
    zMembershipsResponsePacket,
    type ActBlueFundraisingStatsResponse,
} from 'pv-contracts/responses'
import { useEffect, useMemo, useState } from 'react'

type ChartBarDisplayMode = 'grouped' | 'stacked'

const CONTRIBUTIONS_PAGE_SIZE = 1000

const membershipCountSearch: MembershipSearchRequest = {
    limit: 1,
    isMember: true,
}

function isWithinRange(paidAt: Date, start: Date | null, end: Date | null) {
    const time = paidAt.getTime()
    if (start && time < start.getTime()) return false
    if (end && time >= end.getTime() + 1000) return false
    return true
}

function computeFundraisingStats(
    contributions: ActBlueDonationPacket[]
): ActBlueFundraisingStatsResponse {
    let oneTimeDollarsRaised = 0
    let recurringDollarsRaised = 0
    let oneTimeContributionCount = 0
    let recurringContributionCount = 0
    const oneTimeDonors = new Set<string>()
    const recurringDonors = new Set<string>()

    for (const contribution of contributions) {
        const donor = contribution.email.toLowerCase()
        if (contribution.isRecurring) {
            recurringDollarsRaised += contribution.amount
            recurringContributionCount += 1
            recurringDonors.add(donor)
        } else {
            oneTimeDollarsRaised += contribution.amount
            oneTimeContributionCount += 1
            oneTimeDonors.add(donor)
        }
    }

    const totalDollarsRaised = oneTimeDollarsRaised + recurringDollarsRaised
    const totalContributionCount =
        oneTimeContributionCount + recurringContributionCount

    return {
        totalDollarsRaised,
        oneTimeDollarsRaised,
        recurringDollarsRaised,
        totalContributionCount,
        oneTimeContributionCount,
        recurringContributionCount,
        totalDonorCount: oneTimeDonors.size + recurringDonors.size,
        oneTimeDonorCount: oneTimeDonors.size,
        recurringDonorCount: recurringDonors.size,
        avgContributionAmount: totalContributionCount
            ? totalDollarsRaised / totalContributionCount
            : 0,
    }
}

function findBucketIndex(buckets: { start: Date; end: Date }[], paidAt: Date) {
    const time = paidAt.getTime()
    let low = 0
    let high = buckets.length - 1
    let match = -1

    while (low <= high) {
        const mid = (low + high) >> 1
        if (buckets[mid].start.getTime() <= time) {
            match = mid
            low = mid + 1
        } else {
            high = mid - 1
        }
    }

    if (match < 0) return -1
    const bucket = buckets[match]
    return isWithinRange(paidAt, bucket.start, bucket.end) ? match : -1
}

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

    const previousPeriodRange = useMemo(() => {
        if (!startDate || !endDate) return null
        if (committedPreset === 'All Time') return null
        return getPreviousEquivalentRange(startDate, endDate)
    }, [startDate, endDate, committedPreset])

    const allTimeStatsQuery = useQuery({
        queryKey: ['/actblue/fundraising/stats', 'all-time-cards'],
        queryFn: ({ signal }) => actblueQueries.getFundraisingStats({ signal }),
        enabled: actblueQueries.ready,
    })

    const membershipCountQuery = usePaginatedSearch(
        '/actblue/memberships',
        zMembershipsResponsePacket,
        { search: membershipCountSearch }
    ).query

    const contributionCountQuery = usePaginatedSearch(
        '/actblue/contributions',
        zActBlueDonationPacket,
        { search: { limit: 0 } }
    ).query

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

    useEffect(() => {
        setChartViewOverrideRange(null)
    }, [startDate, endDate, committedPreset])

    useEffect(() => {
        if (!zoomEnabled) {
            setChartViewOverrideRange(null)
        }
    }, [zoomEnabled])

    const contributionsFetchFrom = useMemo(() => {
        if (!startDate) return null
        const starts = [
            startDate,
            previousPeriodRange?.start,
            chartBuckets[0]?.start,
        ].filter((date): date is Date => date != null)
        return new Date(Math.min(...starts.map((date) => date.getTime())))
    }, [startDate, previousPeriodRange, chartBuckets])

    const contributionsQuery = useQuery({
        queryKey: [
            '/actblue/contributions',
            'client-stats',
            contributionsFetchFrom ?? null,
        ],
        queryFn: async ({ signal }) => {
            const fetched: ActBlueDonationPacket[] = []

            for (let page = 0; ; page += 1) {
                const response = await actblueQueries.getContributions({
                    search: {
                        page,
                        limit: CONTRIBUTIONS_PAGE_SIZE,
                        sortField: 'paid_at',
                        sort: SortDirection.DESC,
                    },
                    signal,
                })
                const pageData = response.data
                fetched.push(...pageData)

                const newest = pageData[0]?.paidAt
                const oldest = pageData[pageData.length - 1]?.paidAt
                const reachedFetchFrom =
                    contributionsFetchFrom != null &&
                    newest != null &&
                    oldest != null &&
                    newest.getTime() >= oldest.getTime() &&
                    oldest.getTime() < contributionsFetchFrom.getTime()

                if (
                    pageData.length === 0 ||
                    fetched.length >= response.count ||
                    reachedFetchFrom
                )
                    break
            }

            return fetched
        },
        placeholderData: keepPreviousData,
        enabled: actblueQueries.ready,
        staleTime: 60_000,
    })

    const contributions = contributionsQuery.data

    const currentStats = useMemo(
        () =>
            contributions &&
            computeFundraisingStats(
                contributions.filter((contribution) =>
                    isWithinRange(contribution.paidAt, startDate, endDate)
                )
            ),
        [contributions, startDate, endDate]
    )

    const previousPeriodStats = useMemo(
        () =>
            contributions &&
            previousPeriodRange &&
            computeFundraisingStats(
                contributions.filter((contribution) =>
                    isWithinRange(
                        contribution.paidAt,
                        previousPeriodRange.start,
                        previousPeriodRange.end
                    )
                )
            ),
        [contributions, previousPeriodRange]
    )

    const statsQuery = { data: currentStats }

    const recurringPct = useMemo(() => {
        if (!currentStats) return null
        return getPercentage(
            currentStats.recurringDollarsRaised,
            currentStats.totalDollarsRaised
        )
    }, [currentStats])

    const oneTimePct = useMemo(() => {
        if (!currentStats) return null
        return getPercentage(
            currentStats.oneTimeDollarsRaised,
            currentStats.totalDollarsRaised
        )
    }, [currentStats])

    const recurringDollarsChange = useMemo(() => {
        if (!currentStats || !previousPeriodStats) return null
        return (
            currentStats.recurringDollarsRaised -
            previousPeriodStats.recurringDollarsRaised
        )
    }, [currentStats, previousPeriodStats])

    const chartBucketStats = useMemo(() => {
        const groups = chartBuckets.map(() => [] as ActBlueDonationPacket[])
        for (const contribution of contributions ?? []) {
            const idx = findBucketIndex(chartBuckets, contribution.paidAt)
            if (idx >= 0) groups[idx].push(contribution)
        }
        return groups.map(computeFundraisingStats)
    }, [chartBuckets, contributions])

    const chartPoints = useMemo<ChartPoint[]>(() => {
        return chartBuckets.map((bucket, idx) => {
            const data = chartBucketStats[idx]

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
    }, [chartBuckets, chartBucketStats])

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
        membershipCountQuery,
        contributionCountQuery,
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
