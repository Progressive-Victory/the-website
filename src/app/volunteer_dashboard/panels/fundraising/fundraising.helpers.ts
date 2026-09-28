import type { ChartGranularityMode } from '@/components/common/charts/timeBuckets'

export const PRESETS = [
    'All Time',
    'Year To Date',
    'Month To Date',
    'Last Month',
    'Week To Date',
    'Last 7 Days',
    'Today',
    'Yesterday',
] as const

export type Preset = (typeof PRESETS)[number]

export const CHART_GRANULARITY_LABELS: Record<ChartGranularityMode, string> = {
    auto: 'Auto',
    year: 'Years',
    quarter: 'Quarters',
    month: 'Months',
    week: 'Weeks',
    day: 'Days',
    hour: 'Hours',
}

export function formatCurrency(value?: number) {
    if (value == null || !Number.isFinite(value)) return '—'
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export function formatCount(value?: number) {
    if (value == null || !Number.isFinite(value)) return '—'
    return value.toLocaleString('en-US')
}

export function formatCurrencyAxis(value: number, step: number): string {
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

export function formatCountAxis(value: number): string {
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

export function formatDonationCountLabel(value?: number) {
    return `${formatCount(value)} ${value === 1 ? 'donation' : 'donations'}`
}

export function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
}

export function endOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
}

function isSameDate(a: Date | null, b: Date | null): boolean {
    if (a === null || b === null) return a === b
    return a.getTime() === b.getTime()
}

export function addDays(date: Date, days: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

export function getPresetRange(preset: Preset): [Date | null, Date | null] {
    const today = new Date()

    switch (preset) {
        case 'All Time':
            return [null, null]
        case 'Year To Date':
            return [
                startOfDay(new Date(today.getFullYear(), 0, 1)),
                endOfDay(today),
            ]
        case 'Month To Date':
            return [
                startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)),
                endOfDay(today),
            ]
        case 'Last Month': {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            const end = new Date(today.getFullYear(), today.getMonth(), 0)
            return [startOfDay(start), endOfDay(end)]
        }
        case 'Week To Date': {
            const day = today.getDay()
            const diff = day === 0 ? 6 : day - 1
            const start = new Date(today)
            start.setDate(today.getDate() - diff)
            return [startOfDay(start), endOfDay(today)]
        }
        case 'Last 7 Days': {
            const start = new Date(today)
            start.setDate(today.getDate() - 6)
            return [startOfDay(start), endOfDay(today)]
        }
        case 'Today':
            return [startOfDay(today), endOfDay(today)]
        case 'Yesterday': {
            const yesterday = new Date(today)
            yesterday.setDate(today.getDate() - 1)
            return [startOfDay(yesterday), endOfDay(yesterday)]
        }
    }
}

export function getResolvedPresetRange(
    preset: Preset,
    allTimeFirst?: Date | null
): [Date | null, Date | null] {
    let [start, end] = getPresetRange(preset)

    if (preset === 'All Time') {
        const today = new Date()
        end = endOfDay(today)
        start = allTimeFirst ? startOfDay(allTimeFirst) : startOfDay(today)
    }

    return [start, end]
}

export function inferPresetFromRange(
    start: Date | null,
    end: Date | null,
    allTimeFirst?: Date | null
): Preset | null {
    if (!start || !end) return null

    for (const preset of PRESETS) {
        const [presetStart, presetEnd] = getResolvedPresetRange(
            preset,
            allTimeFirst
        )
        if (isSameDate(start, presetStart) && isSameDate(end, presetEnd)) {
            return preset
        }
    }

    return null
}

export function isXToDatePreset(
    preset: Preset | null
): preset is 'Year To Date' | 'Month To Date' | 'Week To Date' | 'Today' {
    return (
        preset === 'Year To Date' ||
        preset === 'Month To Date' ||
        preset === 'Week To Date' ||
        preset === 'Today'
    )
}

export function getXToDatePeriodName(
    preset: Preset | null,
    granularityMode: ChartGranularityMode
): string {
    if (preset === 'Year To Date') return 'Year'
    if (preset === 'Month To Date') return 'Month'
    if (preset === 'Week To Date') return 'Week'
    if (preset === 'Today' && granularityMode === 'hour') return 'Hour'
    return 'Date'
}

export function getExtendedEndForXToDatePreset(
    preset: 'Year To Date' | 'Month To Date' | 'Week To Date' | 'Today',
    start: Date | null,
    end: Date | null
): Date | null {
    if (!start || !end) return end

    if (preset === 'Today') {
        return endOfDay(start)
    }

    if (preset === 'Year To Date') {
        return endOfDay(new Date(start.getFullYear(), 11, 31))
    }

    if (preset === 'Month To Date') {
        return endOfDay(new Date(start.getFullYear(), start.getMonth() + 1, 0))
    }

    const weekEnd = addDays(
        new Date(start.getFullYear(), start.getMonth(), start.getDate()),
        6
    )
    return endOfDay(weekEnd)
}

export function formatRangeDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

type RangeKind = 'preset' | 'all' | 'both' | 'from' | 'until'

function getRangeKind(
    committedPreset: Preset | null,
    startDate: Date | null,
    endDate: Date | null
): RangeKind {
    switch (true) {
        case !!committedPreset:
            return 'preset'
        case !!(startDate && endDate):
            return 'both'
        case !!startDate:
            return 'from'
        case !!endDate:
            return 'until'
        default:
            return 'all'
    }
}

export function getSelectedRangeLabel(
    committedPreset: Preset | null,
    startDate: Date | null,
    endDate: Date | null
) {
    const kind = getRangeKind(committedPreset, startDate, endDate)
    switch (kind) {
        case 'preset':
            return committedPreset!
        case 'both':
            return isSameDay(startDate!, endDate!)
                ? formatRangeDate(startDate!)
                : `${formatRangeDate(startDate!)} - ${formatRangeDate(endDate!)}`
        case 'from':
            return `From ${formatRangeDate(startDate!)}`
        case 'until':
            return `Until ${formatRangeDate(endDate!)}`
        case 'all':
            return 'All Time'
        default: {
            const _exhaustive: never = kind
            return _exhaustive
        }
    }
}

export function getRaisedKickerLabel(
    committedPreset: Preset | null,
    startDate: Date | null,
    endDate: Date | null
) {
    const kind = getRangeKind(committedPreset, startDate, endDate)
    switch (kind) {
        case 'preset':
            return `Total Raised ${committedPreset!}`
        case 'both':
            return `Total Raised ${formatRangeDate(startDate!)} - ${formatRangeDate(endDate!)}`
        case 'from':
            return `Total Raised From ${formatRangeDate(startDate!)}`
        case 'until':
            return `Total Raised Until ${formatRangeDate(endDate!)}`
        case 'all':
            return 'Total Raised Custom Range'
        default: {
            const _exhaustive: never = kind
            return _exhaustive
        }
    }
}

export function getPercentage(part: number, total: number): number | null {
    if (!Number.isFinite(total) || total <= 0) return null
    const pct = Math.round((part / total) * 100)
    return Number.isFinite(pct) ? pct : null
}
