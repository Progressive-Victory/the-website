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

type RangeKind = 'preset' | 'all' | 'both' | 'from' | 'until'

function getRangeKind(
    committedPreset: Preset | null,
    startDate: string,
    endDate: string
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
    startDate: string,
    endDate: string
) {
    const kind = getRangeKind(committedPreset, startDate, endDate)
    switch (kind) {
        case 'preset':
            return committedPreset!
        case 'both':
            return isSameDay(new Date(startDate), new Date(endDate))
                ? formatRangeDate(startDate)
                : `${formatRangeDate(startDate)} - ${formatRangeDate(endDate)}`
        case 'from':
            return `From ${formatRangeDate(startDate)}`
        case 'until':
            return `Until ${formatRangeDate(endDate)}`
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
    startDate: string,
    endDate: string
) {
    const kind = getRangeKind(committedPreset, startDate, endDate)
    switch (kind) {
        case 'preset':
            return `Total Raised ${committedPreset!}`
        case 'both':
            return `Total Raised ${formatRangeDate(startDate)} - ${formatRangeDate(endDate)}`
        case 'from':
            return `Total Raised From ${formatRangeDate(startDate)}`
        case 'until':
            return `Total Raised Until ${formatRangeDate(endDate)}`
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
