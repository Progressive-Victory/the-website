'use client'

import { useEffect, useMemo, useState } from 'react'
import { MiniCalendar } from './MiniCalendar'
import styles from './DateRangePicker.module.css'

interface DateRangePickerProps {
    startDate: string
    endDate: string
    onRangeChange: (startDate: string, endDate: string) => void
    maxDate?: Date
    stretch?: boolean
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
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

function startOfDayISO(date: Date): string {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0
    ).toISOString()
}

function endOfDayISO(date: Date): string {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59
    ).toISOString()
}

export function DateRangePicker({
    startDate,
    endDate,
    onRangeChange,
    maxDate = new Date(),
    stretch = true,
}: DateRangePickerProps) {
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const anchor = startDate ? new Date(startDate) : new Date()
        return new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    })

    useEffect(() => {
        if (!startDate) return
        const anchor = new Date(startDate)
        if (Number.isNaN(anchor.getTime())) return
        setCalendarMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1))
    }, [startDate])

    const todayInputValue = useMemo(
        () => isoToDateInput(new Date().toISOString()),
        []
    )
    const startInputValue = useMemo(() => isoToDateInput(startDate), [startDate])
    const endInputValue = useMemo(() => isoToDateInput(endDate), [endDate])
    const startDateObj = useMemo(
        () => (startDate ? new Date(startDate) : null),
        [startDate]
    )
    const endDateObj = useMemo(
        () => (endDate ? new Date(endDate) : null),
        [endDate]
    )

    const hasStart = Boolean(startDate)
    const hasEnd = Boolean(endDate)

    return (
        <div className={styles.column}>
            <div className={styles.inputsRow}>
                <input
                    id="custom-start-date"
                    type="date"
                    name="startDate"
                    className={styles.input}
                    max={
                        endInputValue
                            ? endInputValue < todayInputValue
                                ? endInputValue
                                : todayInputValue
                            : todayInputValue
                    }
                    onChange={(event) => {
                        const next = dateInputToStartISO(event.target.value)
                        if (next === null) return
                        if (
                            next &&
                            endDate &&
                            new Date(next).getTime() > new Date(endDate).getTime()
                        ) {
                            return
                        }
                        onRangeChange(next, endDate)
                    }}
                    value={startInputValue}
                    aria-label="Start date"
                />
                <span className={styles.separator}>to</span>
                <input
                    id="custom-end-date"
                    type="date"
                    name="endDate"
                    className={styles.input}
                    min={startInputValue || undefined}
                    max={todayInputValue}
                    onChange={(event) => {
                        const next = dateInputToEndISO(event.target.value)
                        if (next === null) return
                        if (
                            next &&
                            startDate &&
                            new Date(startDate).getTime() > new Date(next).getTime()
                        ) {
                            const nextStartIso = startOfDayISO(new Date(next))
                            const nextEndIso = endOfDayISO(new Date(startDate))
                            onRangeChange(nextStartIso, nextEndIso)
                            return
                        }
                        onRangeChange(startDate, next)
                    }}
                    value={endInputValue}
                    aria-label="End date"
                />
            </div>

            <MiniCalendar
                stretch={stretch}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                startDate={startDateObj}
                endDate={endDateObj}
                maxDate={maxDate}
                onDayClick={(day) => {
                    const dayStart = new Date(
                        day.getFullYear(),
                        day.getMonth(),
                        day.getDate(),
                        0,
                        0,
                        0
                    )
                    const dayEnd = new Date(
                        day.getFullYear(),
                        day.getMonth(),
                        day.getDate(),
                        23,
                        59,
                        59
                    )

                    if (!hasStart || (hasStart && hasEnd)) {
                        if (!hasStart && isSameDay(day, new Date())) {
                            onRangeChange(dayStart.toISOString(), dayEnd.toISOString())
                            return
                        }

                        onRangeChange(dayStart.toISOString(), '')
                        return
                    }

                    const startTs = startDateObj?.getTime() ?? 0
                    if (dayStart.getTime() < startTs) {
                        const priorStartDate =
                            startDateObj ?? (startDate ? new Date(startDate) : null)
                        if (!priorStartDate) {
                            onRangeChange(dayStart.toISOString(), '')
                            return
                        }

                        onRangeChange(
                            dayStart.toISOString(),
                            endOfDayISO(priorStartDate)
                        )
                        return
                    }

                    onRangeChange(startDate, dayEnd.toISOString())
                }}
                onSetEndDateToToday={() => {
                    if (!startDate) return
                    onRangeChange(startDate, endOfDayISO(new Date()))
                }}
            />
        </div>
    )
}
