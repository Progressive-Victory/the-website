'use client'

import styles from './page.module.css'
import { FundraisingChart, FundraisingChartPoint } from './FundraisingChart'
import {
    ActBlueDonationPacket,
    zActBlueDonationPacket,
} from '@/contracts/data'
import {
    PaginatedResponse,
    zPaginatedResponse,
} from '@/contracts/responses'
import {
    ActBlueFundraisingStatsResponse,
    zActBlueFundraisingStatsResponse,
} from '@/contracts/responses/fundraisingStatsResponse'
import { SortDirection } from '@/contracts/requests'
import { useFetch } from '@/util/hooks'
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FaDonate } from 'react-icons/fa'
import { FaDollarSign } from 'react-icons/fa6'
import { FiCheck, FiChevronDown, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'

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

function isXToDatePreset(preset: Preset | null): preset is
    | 'Year To Date'
    | 'Month To Date'
    | 'Week To Date'
    | 'Today' {
    return (
        preset === 'Year To Date' ||
        preset === 'Month To Date' ||
        preset === 'Week To Date' ||
        preset === 'Today'
    )
}

function getXToDatePeriodName(preset: Preset | null, granularityMode: ChartGranularityMode): string {
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

function isoToDateInput(iso: string): string {
    if (!iso) return ''
    const d = new Date(iso)
    const y = String(d.getFullYear()).padStart(4, '0')
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function dateInputToStartISO(value: string): string | null {
    if (!value) return ''
    const [y, mo, d] = value.split('-').map(Number)
    if (!y || !mo || !d) return null
    const date = new Date(2000, mo - 1, d, 0, 0, 0)
    date.setFullYear(y, mo - 1, d)
    return date.toISOString()
}

function dateInputToEndISO(value: string): string | null {
    if (!value) return ''
    const [y, mo, d] = value.split('-').map(Number)
    if (!y || !mo || !d) return null
    const date = new Date(2000, mo - 1, d, 23, 59, 59)
    date.setFullYear(y, mo - 1, d)
    return date.toISOString()
}

function formatRangeDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

type ChartGranularityMode =
    | 'auto'
    | 'year'
    | 'quarter'
    | 'month'
    | 'week'
    | 'day'
    | 'hour'

interface ChartBucket {
    key: string
    label: string
    anchorIso: string
    startIso: string
    endIso: string
    granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
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
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0)
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

function buildHourBuckets(start: Date, end: Date): ChartBucket[] {
    const rangeStart = startOfDayDate(start)
    const rangeEnd = endOfDayDate(end)
    const buckets: ChartBucket[] = []

    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    let currentDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())

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
                label: hourDate.toLocaleDateString('en-US', { hour: 'numeric' }),
                anchorIso: bStart.toISOString(),
                startIso: bStart.toISOString(),
                endIso: bEnd.toISOString(),
                granularity: 'hour',
            })
        }

        currentDay = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() + 1)
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

function buildChartBuckets(
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

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface FundraisingMiniCalendarProps {
    month: Date
    onMonthChange: (next: Date) => void
    startDate: Date | null
    endDate: Date | null
    maxDate?: Date
    onDayClick: (day: Date) => void
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

function FundraisingMiniCalendar({
    month,
    onMonthChange,
    startDate,
    endDate,
    maxDate,
    onDayClick,
}: FundraisingMiniCalendarProps) {
    const [hoveredDayTs, setHoveredDayTs] = useState<number | null>(null)
    const year = month.getFullYear()
    const monthIdx = month.getMonth()
    const firstOfMonth = new Date(year, monthIdx, 1)
    const startWeekday = firstOfMonth.getDay()
    const gridStart = new Date(year, monthIdx, 1 - startWeekday)

    const cells: Date[] = []
    for (let i = 0; i < 42; i += 1) {
        cells.push(
            new Date(
                gridStart.getFullYear(),
                gridStart.getMonth(),
                gridStart.getDate() + i
            )
        )
    }
    const startTs = startDate
        ? new Date(
              startDate.getFullYear(),
              startDate.getMonth(),
              startDate.getDate()
          ).getTime()
        : null
    const endTs = endDate
        ? new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate()
          ).getTime()
        : null
    const hasPreviewSelection = startTs != null && endTs == null
    const previewRangeStartTs =
        hasPreviewSelection && hoveredDayTs != null
            ? Math.min(startTs, hoveredDayTs)
            : null
    const previewRangeEndTs =
        hasPreviewSelection && hoveredDayTs != null
            ? Math.max(startTs, hoveredDayTs)
            : null
    const maxTs = maxDate
        ? new Date(
              maxDate.getFullYear(),
              maxDate.getMonth(),
              maxDate.getDate(),
              23,
              59,
              59
          ).getTime()
        : null

    const monthLabel = firstOfMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })

    return (
        <div className={styles.miniCalendar}>
            <div className={styles.miniCalendarHeader}>
                <button
                    type="button"
                    className={styles.miniCalendarNavButton}
                    onClick={() =>
                        onMonthChange(new Date(year, monthIdx - 1, 1))
                    }
                    aria-label="Previous month"
                >
                    <FiChevronLeft size={16} />
                </button>
                <div className={styles.miniCalendarMonthLabel}>
                    {monthLabel}
                </div>
                <button
                    type="button"
                    className={styles.miniCalendarNavButton}
                    onClick={() =>
                        onMonthChange(new Date(year, monthIdx + 1, 1))
                    }
                    aria-label="Next month"
                >
                    <FiChevronRight size={16} />
                </button>
            </div>
            <div className={styles.miniCalendarWeekRow}>
                {WEEKDAY_LABELS.map((d) => (
                    <div
                        key={d}
                        className={styles.miniCalendarWeekday}
                        aria-hidden="true"
                    >
                        {d}
                    </div>
                ))}
            </div>
            <div
                className={styles.miniCalendarGrid}
                onMouseLeave={() => setHoveredDayTs(null)}
            >
                {cells.map((day, idx) => {
                    const dayStart = new Date(
                        day.getFullYear(),
                        day.getMonth(),
                        day.getDate()
                    ).getTime()
                    const inMonth = day.getMonth() === monthIdx
                    const disabled = maxTs != null && dayStart > maxTs
                    const isStart = startTs != null && dayStart === startTs
                    const isEnd = endTs != null && dayStart === endTs
                    const hasConfirmedRange =
                        startTs != null && endTs != null && startTs !== endTs
                    const inRange =
                        startTs != null &&
                        endTs != null &&
                        dayStart > startTs &&
                        dayStart < endTs
                    const inPreviewRange =
                        previewRangeStartTs != null &&
                        previewRangeEndTs != null &&
                        dayStart > previewRangeStartTs &&
                        dayStart < previewRangeEndTs
                    const isHoverAfterStart =
                        hoveredDayTs != null &&
                        startTs != null &&
                        hoveredDayTs > startTs
                    const isPreviewEdge =
                        hasPreviewSelection &&
                        hoveredDayTs != null &&
                        dayStart === hoveredDayTs &&
                        dayStart !== startTs
                    const isPreviewStartEdge =
                        hasPreviewSelection &&
                        hoveredDayTs != null &&
                        isStart &&
                        hoveredDayTs !== startTs
                    const isToday = isSameDay(day, new Date())

                    const classNames = [styles.miniCalendarDay]
                    if (!inMonth) classNames.push(styles.miniCalendarDayMuted)
                    if (disabled)
                        classNames.push(styles.miniCalendarDayDisabled)
                    if (inPreviewRange)
                        classNames.push(styles.miniCalendarDayHoverRange)
                    if (hasConfirmedRange && isStart)
                        classNames.push(styles.miniCalendarDayRangeStart)
                    if (hasConfirmedRange && isEnd)
                        classNames.push(styles.miniCalendarDayRangeEnd)
                    if (isPreviewStartEdge)
                        classNames.push(
                            isHoverAfterStart
                                ? styles.miniCalendarDayHoverStartLeft
                                : styles.miniCalendarDayHoverStartRight
                        )
                    if (isPreviewEdge)
                        classNames.push(
                            isHoverAfterStart
                                ? styles.miniCalendarDayHoverEdgeRight
                                : styles.miniCalendarDayHoverEdgeLeft
                        )
                    if (isStart || isEnd)
                        classNames.push(styles.miniCalendarDaySelected)
                    if (inRange) classNames.push(styles.miniCalendarDayInRange)
                    if (isToday && !isStart && !isEnd)
                        classNames.push(styles.miniCalendarDayToday)

                    return (
                        <button
                            key={idx}
                            type="button"
                            className={classNames.join(' ')}
                            disabled={disabled}
                            onMouseEnter={() => {
                                if (!hasPreviewSelection || disabled) {
                                    setHoveredDayTs(null)
                                    return
                                }
                                setHoveredDayTs(dayStart)
                            }}
                            onClick={() => onDayClick(day)}
                            tabIndex={inMonth ? 0 : -1}
                        >
                            {day.getDate()}
                        </button>
                    )
                })}
            </div>
        </div>
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
    const hasValidDraft = Boolean(draftStartDate && draftEndDate)
    const isAwaitingDraftEndDate = Boolean(draftStartDate && !draftEndDate)
    const isDraftUnchanged =
        draftStartDate === startDate &&
        draftEndDate === endDate &&
        draftPreset === committedPreset
    const canApplyCustomRange = hasValidDraft && !isDraftUnchanged

    const draftStartDateObj = useMemo(
        () => (draftStartDate ? new Date(draftStartDate) : null),
        [draftStartDate]
    )
    const draftEndDateObj = useMemo(
        () => (draftEndDate ? new Date(draftEndDate) : null),
        [draftEndDate]
    )

    const [calendarMonth, setCalendarMonth] = useState(() => {
        const anchor = draftStartDate
            ? new Date(draftStartDate)
            : new Date()
        return new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    })

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
        return getExtendedEndForXToDatePreset(committedPreset, startDate, endDate)
    }, [showFullXToDateSpan, committedPreset, startDate, endDate])

    const validGranularityModes = useMemo(() => {
        const totalDays = daysBetweenInclusive(
            clampToNoon(new Date(startDate)),
            clampToNoon(new Date(chartEndDate))
        )
        
        const modes: ChartGranularityMode[] = ['auto', 'day']
        if (totalDays <= 7) modes.push('hour')
        if (totalDays >= 7) modes.push('week')
        if (totalDays >= 30) modes.push('month')
        if (totalDays >= 90) modes.push('quarter')
        if (totalDays >= 365) modes.push('year')
        
        return modes
    }, [startDate, chartEndDate])

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

    const chartPoints = useMemo<FundraisingChartPoint[]>(() => {
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
                oneTime: item?.oneTime ?? 0,
                recurring: item?.recurring ?? 0,
                donations: item?.donations ?? 0,
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

                                <button
                                    id="fundraising-date-range-trigger"
                                    type="button"
                                    ref={dateRangeTriggerRef}
                                    className={styles.dateRangeTriggerButton}
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
                                            className={
                                                styles.dateRangePopHeader
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.dateRangePopTitle
                                                }
                                            >
                                                Select date range
                                            </span>
                                            <button
                                                type="button"
                                                className={
                                                    styles.dateRangePopClose
                                                }
                                                onClick={() => {
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
                                                aria-label="Close date range picker"
                                            >
                                                <FiX size={16} aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div
                                            className={styles.dateRangePopBody}
                                        >
                                            <div
                                                className={
                                                    styles.dateRangePresetCol
                                                }
                                            >
                                                {PRESETS.map((preset) => {
                                                    const isCommitted =
                                                        committedPreset ===
                                                        preset
                                                    const isDraft =
                                                        draftPreset === preset
                                                    const classes = [
                                                        styles.dateRangePresetButton,
                                                    ]
                                                    if (isCommitted)
                                                        classes.push(
                                                            styles.dateRangePresetButtonCommitted
                                                        )
                                                    if (isDraft)
                                                        classes.push(
                                                            styles.dateRangePresetButtonDraft
                                                        )
                                                    return (
                                                        <button
                                                            key={preset}
                                                            type="button"
                                                            className={classes.join(
                                                                ' '
                                                            )}
                                                            onClick={() => {
                                                                const [s, e] =
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
                                                                if (s) {
                                                                    const d =
                                                                        new Date(
                                                                            s
                                                                        )
                                                                    setCalendarMonth(
                                                                        new Date(
                                                                            d.getFullYear(),
                                                                            d.getMonth(),
                                                                            1
                                                                        )
                                                                    )
                                                                }
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
                                                                {preset}
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
                                                })}
                                            </div>

                                            <div
                                                className={
                                                    styles.dateRangeCalendarCol
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.dateRangeInputsRow
                                                    }
                                                >
                                                    <input
                                                        id="custom-start-date"
                                                        type="date"
                                                        name="startDate"
                                                        className={
                                                            styles.dateRangeInput
                                                        }
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
                                          
                                                            if (next === null)
                                                                return
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
                                                            setDraftPreset(
                                                                inferPresetFromRange(
                                                                    next,
                                                                    draftEndDate,
                                                                    allTimeFirstIso
                                                                )
                                                            )
                                                            if (next) {
                                                                const d =
                                                                    new Date(
                                                                        next
                                                                    )
                                                                setCalendarMonth(
                                                                    new Date(
                                                                        d.getFullYear(),
                                                                        d.getMonth(),
                                                                        1
                                                                    )
                                                                )
                                                            }
                                                        }}
                                                        value={isoToDateInput(
                                                            draftStartDate
                                                        )}
                                                        aria-label="Start date"
                                                    />
                                                    <span
                                                        className={
                                                            styles.dateRangeInputSeparator
                                                        }
                                                    >
                                                        to
                                                    </span>
                                                    <input
                                                        id="custom-end-date"
                                                        type="date"
                                                        name="endDate"
                                                        className={
                                                            styles.dateRangeInput
                                                        }
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
                                                            if (next === null)
                                                                return
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
                                                                const nextStartIso =
                                                                    startOfDayISO(
                                                                        new Date(
                                                                            next
                                                                        )
                                                                    )
                                                                const nextEndIso =
                                                                    endOfDayISO(
                                                                        new Date(
                                                                            draftStartDate
                                                                        )
                                                                    )
                                                                setDraftStartDate(
                                                                    nextStartIso
                                                                )
                                                                setDraftEndDate(
                                                                    nextEndIso
                                                                )
                                                                setDraftPreset(
                                                                    inferPresetFromRange(
                                                                        nextStartIso,
                                                                        nextEndIso,
                                                                        allTimeFirstIso
                                                                    )
                                                                )
                                                                return
                                                            }
                                                            setDraftEndDate(
                                                                next
                                                            )
                                                            setDraftPreset(
                                                                inferPresetFromRange(
                                                                    draftStartDate,
                                                                    next,
                                                                    allTimeFirstIso
                                                                )
                                                            )
                                                        }}
                                                        value={isoToDateInput(
                                                            draftEndDate
                                                        )}
                                                        aria-label="End date"
                                                    />
                                                </div>

                                                <FundraisingMiniCalendar
                                                    month={calendarMonth}
                                                    onMonthChange={
                                                        setCalendarMonth
                                                    }
                                                    startDate={
                                                        draftStartDateObj
                                                    }
                                                    endDate={draftEndDateObj}
                                                    maxDate={new Date()}
                                                    onDayClick={(day) => {
                                                        const startOfDay =
                                                            new Date(
                                                                day.getFullYear(),
                                                                day.getMonth(),
                                                                day.getDate(),
                                                                0,
                                                                0,
                                                                0
                                                            )
                                                        const endOfDay =
                                                            new Date(
                                                                day.getFullYear(),
                                                                day.getMonth(),
                                                                day.getDate(),
                                                                23,
                                                                59,
                                                                59
                                                            )

                                                        const hasStart =
                                                            !!draftStartDate
                                                        const hasEnd =
                                                            !!draftEndDate

                                                        if (
                                                            !hasStart ||
                                                            (hasStart && hasEnd)
                                                        ) {
                                                            if (
                                                                !hasStart &&
                                                                isSameDay(
                                                                    day,
                                                                    new Date()
                                                                )
                                                            ) {
                                                                const nextStartIso =
                                                                    startOfDay.toISOString()
                                                                const nextEndIso =
                                                                    endOfDay.toISOString()
                                                                setDraftStartDate(
                                                                    nextStartIso
                                                                )
                                                                setDraftEndDate(
                                                                    nextEndIso
                                                                )
                                                                setDraftPreset(
                                                                    inferPresetFromRange(
                                                                        nextStartIso,
                                                                        nextEndIso,
                                                                        allTimeFirstIso
                                                                    )
                                                                )
                                                                return
                                                            }

                                                            setDraftStartDate(
                                                                startOfDay.toISOString()
                                                            )
                                                            setDraftEndDate('')
                                                            setDraftPreset(
                                                                null
                                                            )
                                                            return
                                                        }

                                                        const startTs =
                                                            draftStartDateObj?.getTime() ??
                                                            0
                                                        if (
                                                            startOfDay.getTime() <
                                                            startTs
                                                        ) {
                                                            const nextStartIso =
                                                                startOfDay.toISOString()
                                                            const priorStartDate =
                                                                draftStartDateObj ??
                                                                (draftStartDate
                                                                    ? new Date(
                                                                          draftStartDate
                                                                      )
                                                                    : null)
                                                            if (!priorStartDate) {
                                                                setDraftStartDate(
                                                                    nextStartIso
                                                                )
                                                                setDraftPreset(
                                                                    null
                                                                )
                                                                return
                                                            }
                                                            const nextEndIso =
                                                                endOfDayISO(
                                                                    priorStartDate
                                                                )
                                                            setDraftStartDate(
                                                                nextStartIso
                                                            )
                                                            setDraftEndDate(
                                                                nextEndIso
                                                            )
                                                            setDraftPreset(
                                                                inferPresetFromRange(
                                                                    nextStartIso,
                                                                    nextEndIso,
                                                                    allTimeFirstIso
                                                                )
                                                            )
                                                        } else {
                                                            const nextEndIso =
                                                                endOfDay.toISOString()
                                                            setDraftEndDate(
                                                                nextEndIso
                                                            )
                                                            setDraftPreset(
                                                                inferPresetFromRange(
                                                                    draftStartDate,
                                                                    nextEndIso,
                                                                    allTimeFirstIso
                                                                )
                                                            )
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={
                                                styles.customDateActions
                                            }
                                        >
                                            <button
                                                type="button"
                                                className={
                                                    styles.setRangeButton
                                                }
                                                disabled={
                                                    !canApplyCustomRange
                                                }
                                                onClick={() => {
                                                    if (!canApplyCustomRange)
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
                                            >
                                                {isAwaitingDraftEndDate
                                                    ? 'Select End Date'
                                                    : 'Select'}
                                            </button>
                                        </div>
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

                <FundraisingChart
                    points={chartPoints}
                    smoothLine={smoothLine}
                    showAreaFill={showAreaFill}
                    showDonationsLine={showDonationsLine}
                    headerRight={
                        <div
                            ref={chartOptionsControlRef}
                            className={styles.chartOptionsControl}
                        >
                            <button
                                type="button"
                                className={styles.chartOptionsTrigger}
                                onClick={() =>
                                    setIsChartOptionsOpen(
                                        (current) => !current
                                    )
                                }
                                aria-haspopup="dialog"
                                aria-expanded={isChartOptionsOpen}
                            >
                                <span>Chart Options</span>
                                <FiChevronDown
                                    aria-hidden="true"
                                    size={12}
                                />
                            </button>

                            {isChartOptionsOpen && (
                                <div
                                    className={styles.chartOptionsBox}
                                    role="dialog"
                                    aria-label="Chart options"
                                >
                                    <div
                                        className={styles.chartOptionsHeader}
                                    >
                                        <span
                                            className={
                                                styles.chartOptionsTitle
                                            }
                                        >
                                            Chart Options
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.dateRangePopClose}
                                            onClick={() =>
                                                setIsChartOptionsOpen(false)
                                            }
                                            aria-label="Close chart options"
                                        >
                                            <FiX
                                                size={16}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>

                                    <div className={styles.chartOptionRow}>
                                        <span
                                            className={
                                                styles.chartOptionLabel
                                            }
                                        >
                                            Time scale
                                        </span>
                                        <div
                                            className={
                                                styles.chartOptionToggle
                                            }
                                            role="group"
                                            aria-label="Time scale"
                                        >
                                            {(
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
                                                .filter((mode) => validGranularityModes.includes(mode))
                                                .map((mode) => {
                                                const labelByMode: Record<
                                                    ChartGranularityMode,
                                                    string
                                                > = {
                                                    auto: 'Auto',
                                                    year: 'Years',
                                                    quarter: 'Quarters',
                                                    month: 'Months',
                                                    week: 'Weeks',
                                                    day: 'Days',
                                                    hour: 'Hours',
                                                }
                                                return (
                                                    <button
                                                        key={mode}
                                                        type="button"
                                                        className={[
                                                            styles.chartOptionToggleButton,
                                                            granularityMode ===
                                                            mode
                                                                ? styles.chartOptionToggleButtonActive
                                                                : '',
                                                        ].join(' ')}
                                                        aria-pressed={
                                                            granularityMode ===
                                                            mode
                                                        }
                                                        onClick={() =>
                                                            setGranularityMode(
                                                                mode
                                                            )
                                                        }
                                                    >
                                                        {labelByMode[mode]}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {isXToDateSpanOptionRelevant && (
                                        <div className={styles.chartOptionRow}>
                                            <span
                                                className={
                                                    styles.chartOptionLabel
                                                }
                                            >
                                                Show {getXToDatePeriodName(committedPreset, granularityMode)} To Date
                                            </span>
                                            <div
                                                className={
                                                    styles.chartOptionToggle
                                                }
                                                role="group"
                                                aria-label="X-to-date span"
                                            >
                                                <button
                                                    type="button"
                                                    className={[
                                                        styles.chartOptionToggleButton,
                                                        showFullXToDateSpan
                                                            ? styles.chartOptionToggleButtonActive
                                                            : '',
                                                    ].join(' ')}
                                                    aria-pressed={
                                                        showFullXToDateSpan
                                                    }
                                                    onClick={() =>
                                                        setShowFullXToDateSpan(
                                                            true
                                                        )
                                                    }
                                                >
                                                    Hide
                                                </button>
                                                <button
                                                    type="button"
                                                    className={[
                                                        styles.chartOptionToggleButton,
                                                        !showFullXToDateSpan
                                                            ? styles.chartOptionToggleButtonActive
                                                            : '',
                                                    ].join(' ')}
                                                    aria-pressed={
                                                        !showFullXToDateSpan
                                                    }
                                                    onClick={() =>
                                                        setShowFullXToDateSpan(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Show
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className={styles.chartOptionRow}>
                                        <span
                                            className={
                                                styles.chartOptionLabel
                                            }
                                        >
                                            Contributions line
                                        </span>
                                        <div
                                            className={
                                                styles.chartOptionToggle
                                            }
                                            role="group"
                                            aria-label="Contributions line"
                                        >
                                            <button
                                                type="button"
                                                className={[
                                                    styles.chartOptionToggleButton,
                                                    showDonationsLine
                                                        ? styles.chartOptionToggleButtonActive
                                                        : '',
                                                ].join(' ')}
                                                aria-pressed={
                                                    showDonationsLine
                                                }
                                                onClick={() =>
                                                    setShowDonationsLine(true)
                                                }
                                            >
                                                Show
                                            </button>
                                            <button
                                                type="button"
                                                className={[
                                                    styles.chartOptionToggleButton,
                                                    !showDonationsLine
                                                        ? styles.chartOptionToggleButtonActive
                                                        : '',
                                                ].join(' ')}
                                                aria-pressed={
                                                    !showDonationsLine
                                                }
                                                onClick={() =>
                                                    setShowDonationsLine(
                                                        false
                                                    )
                                                }
                                            >
                                                Hide
                                            </button>
                                        </div>
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
                                                    Line style
                                                </span>
                                                <div
                                                    className={
                                                        styles.chartOptionToggle
                                                    }
                                                    role="group"
                                                    aria-label="Line style"
                                                >
                                                    <button
                                                        type="button"
                                                        className={[
                                                            styles.chartOptionToggleButton,
                                                            smoothLine
                                                                ? styles.chartOptionToggleButtonActive
                                                                : '',
                                                        ].join(' ')}
                                                        aria-pressed={
                                                            smoothLine
                                                        }
                                                        onClick={() =>
                                                            setSmoothLine(true)
                                                        }
                                                    >
                                                        Curved
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={[
                                                            styles.chartOptionToggleButton,
                                                            !smoothLine
                                                                ? styles.chartOptionToggleButtonActive
                                                                : '',
                                                        ].join(' ')}
                                                        aria-pressed={
                                                            !smoothLine
                                                        }
                                                        onClick={() =>
                                                            setSmoothLine(
                                                                false
                                                            )
                                                        }
                                                    >
                                                        Straight
                                                    </button>
                                                </div>
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
                                                    Area fill
                                                </span>
                                                <div
                                                    className={
                                                        styles.chartOptionToggle
                                                    }
                                                    role="group"
                                                    aria-label="Area fill"
                                                >
                                                    <button
                                                        type="button"
                                                        className={[
                                                            styles.chartOptionToggleButton,
                                                            showAreaFill
                                                                ? styles.chartOptionToggleButtonActive
                                                                : '',
                                                        ].join(' ')}
                                                        aria-pressed={
                                                            showAreaFill
                                                        }
                                                        onClick={() =>
                                                            setShowAreaFill(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        Show
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={[
                                                            styles.chartOptionToggleButton,
                                                            !showAreaFill
                                                                ? styles.chartOptionToggleButtonActive
                                                                : '',
                                                        ].join(' ')}
                                                        aria-pressed={
                                                            !showAreaFill
                                                        }
                                                        onClick={() =>
                                                            setShowAreaFill(
                                                                false
                                                            )
                                                        }
                                                    >
                                                        Hide
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    }
                />

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
