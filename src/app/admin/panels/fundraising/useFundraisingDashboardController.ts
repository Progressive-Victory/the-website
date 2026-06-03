import {
    getPercentage,
    getPresetRange,
    getRaisedKickerLabel,
    getSelectedRangeLabel,
    type Preset,
} from './fundraising.helpers'
import {
    getEarliestContribution,
    getFundraisingStats,
} from './fundraising.service'
import type { QueryParams, ZodSchema } from '@/util/hooks/useFetch'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
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

export function useFundraisingDashboardController(onGet: OnGet) {
    const [startDate, setStartDate] = useState(() => getPresetRange('Today')[0])
    const [endDate, setEndDate] = useState(() => getPresetRange('Today')[1])
    const [committedPreset, setCommittedPreset] = useState<Preset | null>(
        'Today'
    )
    const [draftPreset, setDraftPreset] = useState<Preset | null>('Today')

    const [draftStartDate, setDraftStartDate] = useState(startDate)
    const [draftEndDate, setDraftEndDate] = useState(endDate)

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

    return {
        isAllTime,
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
    }
}
