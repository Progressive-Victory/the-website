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

export function startOfDayISO(d: Date): string {
    return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        0,
        0,
        0
    ).toISOString()
}

export function endOfDayISO(d: Date): string {
    return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59
    ).toISOString()
}

export function addDays(date: Date, days: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

export function getPresetRange(preset: Preset): [string, string] {
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
    }
}

export function getResolvedPresetRange(
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

export function inferPresetFromRange(
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

export function formatRangeDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
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

export function getSelectedRangeLabel(
    committedPreset: Preset | null,
    startDate: string,
    endDate: string
) {
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
}

export function getRaisedKickerLabel(
    committedPreset: Preset | null,
    startDate: string,
    endDate: string
) {
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
}

export function getPercentage(part: number, total: number): number | null {
    if (!Number.isFinite(total) || total <= 0) return null
    const pct = Math.round((part / total) * 100)
    return Number.isFinite(pct) ? pct : null
}
