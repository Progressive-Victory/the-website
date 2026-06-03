import type { ChartGranularity } from './DualAxisBarLineChart'

export function formatHour(date: Date, includeMinute = false): string {
    const hours = date.getHours()
    const suffix = hours >= 12 ? 'pm' : 'am'
    const display = hours % 12 === 0 ? 12 : hours % 12

    if (includeMinute) {
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${display}:${minutes}${suffix}`
    }

    return `${display}${suffix}`
}

export function pickLabel(
    granularity: ChartGranularity,
    date: Date,
    spansYears: boolean,
    perColumnWidth: number,
    idx: number,
    stride: number,
    totalCount: number
): string {
    const widthsByGranularity: Record<
        ChartGranularity,
        [number, number, number]
    > = {
        year: [60, 40, 24],
        quarter: [74, 48, 30],
        month: [78, 44, 26],
        week: [90, 56, 38],
        day: [98, 62, 38],
        hour: [62, 36, 24],
    }

    const widths = widthsByGranularity[granularity]

    let level: 0 | 1 | 2 | 3
    if (perColumnWidth >= widths[0]) level = 0
    else if (perColumnWidth >= widths[1]) level = 1
    else if (perColumnWidth >= widths[2]) level = 2
    else level = 3

    if (granularity === 'year') {
        if (level <= 1)
            return date.toLocaleDateString('en-US', { year: 'numeric' })
        if (level === 2)
            return date
                .toLocaleDateString('en-US', { year: '2-digit' })
                .replace(/^/, "'")
        return idx % stride === 0
            ? date
                  .toLocaleDateString('en-US', { year: '2-digit' })
                  .replace(/^/, "'")
            : ''
    }

    if (granularity === 'month') {
        const isFirst = idx === 0
        const isLast = idx === totalCount - 1
        const isQuarterStart = date.getMonth() % 3 === 0

        if (level === 0)
            return date.toLocaleDateString('en-US', {
                month: 'long',
                ...(spansYears ? { year: 'numeric' } : {}),
            })

        if (level === 1)
            return date.toLocaleDateString('en-US', {
                month: 'short',
                ...(spansYears ? { year: '2-digit' } : {}),
            })

        if (level === 2) {
            return date.toLocaleDateString('en-US', { month: 'short' })
        }

        if (isFirst || isLast || isQuarterStart) {
            return date.toLocaleDateString('en-US', { month: 'short' })
        }

        return ''
    }

    if (granularity === 'quarter') {
        const quarter = Math.floor(date.getMonth() / 3) + 1
        const yearFull = date.getFullYear()
        const yearShort = String(yearFull).slice(-2)

        if (level === 0) return `Q${quarter} ${yearFull}`
        if (level === 1) return `Q${quarter} '${yearShort}`
        if (level === 2) return `Q${quarter}`
        return idx % stride === 0 ? `Q${quarter}` : ''
    }

    if (granularity === 'week') {
        if (level === 0)
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
            })

        if (level === 1)
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            })

        if (level === 2)
            return date.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
            })

        return idx % stride === 0
            ? date.toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
              })
            : ''
    }

    if (granularity === 'day') {
        if (level === 0)
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            })

        if (level === 1)
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            })

        if (level === 2)
            return date.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
            })

        return idx % stride === 0
            ? date.toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
              })
            : ''
    }

    if (level === 0) return formatHour(date, true)
    if (level === 1) return formatHour(date)
    if (level === 2) return idx % 2 === 0 ? formatHour(date) : ''
    return idx % stride === 0 ? formatHour(date) : ''
}
