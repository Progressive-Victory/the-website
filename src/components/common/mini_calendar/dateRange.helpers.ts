export function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

export function isoToDateInput(iso: string): string {
    if (!iso) return ''
    const d = new Date(iso)
    const y = String(d.getFullYear()).padStart(4, '0')
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

export function dateInputToStartISO(value: string): string | null {
    if (!value) return ''
    const [y, mo, d] = value.split('-').map(Number)
    if (!y || !mo || !d) return null
    const date = new Date(2000, mo - 1, d, 0, 0, 0)
    date.setFullYear(y, mo - 1, d)
    return date.toISOString()
}

export function dateInputToEndISO(value: string): string | null {
    if (!value) return ''
    const [y, mo, d] = value.split('-').map(Number)
    if (!y || !mo || !d) return null
    const date = new Date(2000, mo - 1, d, 23, 59, 59)
    date.setFullYear(y, mo - 1, d)
    return date.toISOString()
}

export function startOfDayISO(date: Date): string {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0
    ).toISOString()
}

export function endOfDayISO(date: Date): string {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59
    ).toISOString()
}
