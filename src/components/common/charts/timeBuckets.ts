import type { ChartGranularity } from './DualAxisBarLineChart'

export type ChartGranularityMode = 'auto' | ChartGranularity

export interface ChartBucket {
    key: string
    label: string
    anchorIso: string
    startIso: string
    endIso: string
    granularity: ChartGranularity
}

function clampToNoon(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
}

function startOfDayDate(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
}

function endOfDayDate(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
}

function startOfHourDate(d: Date) {
    return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        0,
        0
    )
}

function endOfHourDate(d: Date) {
    return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        59,
        59
    )
}

function clampMin(d: Date, lower?: Date) {
    if (lower && d.getTime() < lower.getTime()) return new Date(lower)
    return d
}

function clampMax(d: Date, upper?: Date) {
    if (upper && d.getTime() > upper.getTime()) return new Date(upper)
    return d
}

function addDays(date: Date, days: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

export function daysBetweenInclusive(start: Date, end: Date) {
    const msPerDay = 1000 * 60 * 60 * 24
    const startUtc = Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
    )
    const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
    return Math.max(1, Math.floor((endUtc - startUtc) / msPerDay) + 1)
}

function buildHourBuckets(start: Date, end: Date): ChartBucket[] {
    const rangeStart = startOfDayDate(start)
    const rangeEnd = endOfDayDate(end)
    const buckets: ChartBucket[] = []

    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    let currentDay = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
    )

    while (currentDay.getTime() <= endDay.getTime()) {
        for (let hour = 0; hour < 24; hour += 1) {
            const hourDate = new Date(
                currentDay.getFullYear(),
                currentDay.getMonth(),
                currentDay.getDate(),
                hour,
                0,
                0
            )
            const bStart = clampMin(startOfHourDate(hourDate), rangeStart)
            const bEnd = clampMax(endOfHourDate(hourDate), rangeEnd)

            buckets.push({
                key: `h-${currentDay.getFullYear()}-${currentDay.getMonth() + 1}-${currentDay.getDate()}-${hour}`,
                label: hourDate.toLocaleDateString('en-US', {
                    hour: 'numeric',
                }),
                anchorIso: bStart.toISOString(),
                startIso: bStart.toISOString(),
                endIso: bEnd.toISOString(),
                granularity: 'hour',
            })
        }

        currentDay = new Date(
            currentDay.getFullYear(),
            currentDay.getMonth(),
            currentDay.getDate() + 1
        )
    }

    return buckets
}

function buildDayBuckets(
    start: Date,
    end: Date,
    maxBuckets = 365
): ChartBucket[] {
    const rangeStart = startOfDayDate(start)
    const rangeEnd = endOfDayDate(end)
    const totalDays = daysBetweenInclusive(start, end)
    const count = Math.min(totalDays, maxBuckets)
    const effectiveStart =
        count < totalDays ? addDays(end, -(count - 1)) : start
    const buckets: ChartBucket[] = []
    for (let idx = 0; idx < count; idx += 1) {
        const d = addDays(effectiveStart, idx)
        const bStart = clampMin(startOfDayDate(d), rangeStart)
        const bEnd = clampMax(endOfDayDate(d), rangeEnd)
        buckets.push({
            key: `d-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
            label: d.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
            }),
            anchorIso: bStart.toISOString(),
            startIso: bStart.toISOString(),
            endIso: bEnd.toISOString(),
            granularity: 'day',
        })
    }
    return buckets
}

function buildWeekBuckets(
    start: Date,
    end: Date,
    maxBuckets = 104
): ChartBucket[] {
    const rangeStart = startOfDayDate(start)
    const rangeEnd = endOfDayDate(end)
    const totalDays = daysBetweenInclusive(start, end)
    const weekCount = Math.ceil(totalDays / 7)
    const count = Math.min(weekCount, maxBuckets)
    const effectiveStart =
        count < weekCount ? addDays(end, -(count * 7 - 1)) : start
    const buckets: ChartBucket[] = []
    for (let idx = 0; idx < count; idx += 1) {
        const d = addDays(effectiveStart, idx * 7)
        const lastDay = addDays(effectiveStart, (idx + 1) * 7 - 1)
        const bStart = clampMin(startOfDayDate(d), rangeStart)
        const bEnd = clampMax(endOfDayDate(lastDay), rangeEnd)
        buckets.push({
            key: `w-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
            label: d.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
            }),
            anchorIso: bStart.toISOString(),
            startIso: bStart.toISOString(),
            endIso: bEnd.toISOString(),
            granularity: 'week',
        })
    }
    return buckets
}

function buildMonthBuckets(
    start: Date,
    end: Date,
    maxBuckets = 60
): ChartBucket[] {
    const rangeStart = startOfDayDate(start)
    const rangeEnd = endOfDayDate(end)
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1)
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
    const monthCount =
        (endMonth.getFullYear() - startMonth.getFullYear()) * 12 +
        (endMonth.getMonth() - startMonth.getMonth()) +
        1
    const count = Math.min(monthCount, maxBuckets)
    const offsetStart = monthCount - count
    const buckets: ChartBucket[] = []
    for (let idx = 0; idx < count; idx += 1) {
        const d = new Date(
            startMonth.getFullYear(),
            startMonth.getMonth() + offsetStart + idx,
            1
        )
        const bucketEndDay = new Date(d.getFullYear(), d.getMonth() + 1, 0)
        const bStart = clampMin(startOfDayDate(d), rangeStart)
        const bEnd = clampMax(endOfDayDate(bucketEndDay), rangeEnd)
        buckets.push({
            key: `m-${d.getFullYear()}-${d.getMonth() + 1}`,
            label: d.toLocaleDateString('en-US', { month: 'short' }),
            anchorIso: bStart.toISOString(),
            startIso: bStart.toISOString(),
            endIso: bEnd.toISOString(),
            granularity: 'month',
        })
    }
    return buckets
}

function buildQuarterBuckets(
    start: Date,
    end: Date,
    maxBuckets = 40
): ChartBucket[] {
    const rangeStart = startOfDayDate(start)
    const rangeEnd = endOfDayDate(end)

    const startQuarterMonth = Math.floor(start.getMonth() / 3) * 3
    const startQuarter = new Date(start.getFullYear(), startQuarterMonth, 1)

    const endQuarterMonth = Math.floor(end.getMonth() / 3) * 3
    const endQuarter = new Date(end.getFullYear(), endQuarterMonth, 1)

    const quarterCount =
        Math.floor(
            ((endQuarter.getFullYear() - startQuarter.getFullYear()) * 12 +
                (endQuarter.getMonth() - startQuarter.getMonth())) /
                3
        ) + 1

    const count = Math.min(quarterCount, maxBuckets)
    const offsetStart = quarterCount - count
    const buckets: ChartBucket[] = []

    for (let idx = 0; idx < count; idx += 1) {
        const d = new Date(
            startQuarter.getFullYear(),
            startQuarter.getMonth() + (offsetStart + idx) * 3,
            1
        )
        const quarterEndDay = new Date(d.getFullYear(), d.getMonth() + 3, 0)
        const bStart = clampMin(startOfDayDate(d), rangeStart)
        const bEnd = clampMax(endOfDayDate(quarterEndDay), rangeEnd)
        const q = Math.floor(d.getMonth() / 3) + 1

        buckets.push({
            key: `q-${d.getFullYear()}-Q${q}`,
            label: `Q${q}`,
            anchorIso: bStart.toISOString(),
            startIso: bStart.toISOString(),
            endIso: bEnd.toISOString(),
            granularity: 'quarter',
        })
    }

    return buckets
}

function buildYearBuckets(start: Date, end: Date): ChartBucket[] {
    const rangeStart = startOfDayDate(start)
    const rangeEnd = endOfDayDate(end)
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()
    const buckets: ChartBucket[] = []
    for (let yr = startYear; yr <= endYear; yr += 1) {
        const d = new Date(yr, 0, 1)
        const last = new Date(yr, 11, 31)
        const bStart = clampMin(startOfDayDate(d), rangeStart)
        const bEnd = clampMax(endOfDayDate(last), rangeEnd)
        buckets.push({
            key: `y-${yr}`,
            label: String(yr),
            anchorIso: bStart.toISOString(),
            startIso: bStart.toISOString(),
            endIso: bEnd.toISOString(),
            granularity: 'year',
        })
    }
    return buckets
}

export function getValidChartGranularityModes(
    startIso: string,
    endIso: string
): ChartGranularityMode[] {
    const start = clampToNoon(new Date(startIso))
    const end = clampToNoon(new Date(endIso))

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return ['auto', 'day']
    }

    const totalDays = daysBetweenInclusive(start, end)
    const modes: ChartGranularityMode[] = ['auto', 'day']
    if (totalDays <= 7) modes.push('hour')
    if (totalDays >= 7) modes.push('week')
    if (totalDays >= 30) modes.push('month')
    if (totalDays >= 90) modes.push('quarter')
    if (totalDays >= 365) modes.push('year')

    return modes
}

export function buildChartBuckets(
    startIso: string,
    endIso: string,
    allTimeFirstIso?: string,
    mode: ChartGranularityMode = 'auto',
    isAllTimeSelection = false
): ChartBucket[] {
    const today = clampToNoon(new Date())

    let start: Date
    let end: Date

    if (!startIso || !endIso) {
        const firstDate = allTimeFirstIso
            ? clampToNoon(new Date(allTimeFirstIso))
            : null
        const useFirst =
            firstDate &&
            !Number.isNaN(firstDate.getTime()) &&
            firstDate.getTime() <= today.getTime()
        start = useFirst
            ? new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
            : new Date(today.getFullYear(), today.getMonth() - 11, 1)
        end = today
    } else {
        const parsedStart = clampToNoon(new Date(startIso))
        const parsedEnd = clampToNoon(new Date(endIso))
        if (
            Number.isNaN(parsedStart.getTime()) ||
            Number.isNaN(parsedEnd.getTime())
        ) {
            return buildChartBuckets(
                '',
                '',
                allTimeFirstIso,
                mode,
                isAllTimeSelection
            )
        }
        start = parsedStart <= parsedEnd ? parsedStart : parsedEnd
        end = parsedStart <= parsedEnd ? parsedEnd : parsedStart
    }

    const totalDays = daysBetweenInclusive(start, end)

    if (mode === 'hour') return buildHourBuckets(start, end)
    if (totalDays === 1 && mode === 'auto') {
        return buildHourBuckets(start, end)
    }

    if (mode === 'day') return buildDayBuckets(start, end)
    if (mode === 'week') return buildWeekBuckets(start, end)
    if (mode === 'month') return buildMonthBuckets(start, end)
    if (mode === 'quarter') return buildQuarterBuckets(start, end)
    if (mode === 'year') return buildYearBuckets(start, end)

    if (isAllTimeSelection) {
        if (totalDays <= 90)
            return buildDayBuckets(start, end, Number.MAX_SAFE_INTEGER)
        if (totalDays <= 366 * 5)
            return buildMonthBuckets(start, end, Number.MAX_SAFE_INTEGER)
        return buildYearBuckets(start, end)
    }

    if (totalDays <= 90)
        return buildDayBuckets(start, end, Number.MAX_SAFE_INTEGER)
    if (totalDays <= 366 * 5)
        return buildMonthBuckets(start, end, Number.MAX_SAFE_INTEGER)
    return buildYearBuckets(start, end)
}
