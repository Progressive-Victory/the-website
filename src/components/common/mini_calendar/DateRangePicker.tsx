'use client'

import styles from './DateRangePicker.module.css'
import { MiniCalendar } from './MiniCalendar'
import {
    dateInputToEndISO,
    dateInputToStartISO,
    endOfDayISO,
    isoToDateInput,
    startOfDayISO,
} from './dateRange.helpers'
import { useDateRangeSelectionController } from './useDateRangeSelectionController'
import { useMemo, useState } from 'react'

interface DateRangePickerProps {
    startDate: Date | null
    endDate: Date | null
    onRangeChange: (startDate: Date | null, endDate: Date | null) => void
    maxDate?: Date
    stretch?: boolean
}

export function DateRangePicker({
    startDate: startDateProp,
    endDate: endDateProp,
    onRangeChange: onRangeChangeProp,
    maxDate = new Date(),
    stretch = true,
}: DateRangePickerProps) {
    const startDate = startDateProp ? startDateProp.toISOString() : ''
    const endDate = endDateProp ? endDateProp.toISOString() : ''
    const onRangeChange = (nextStart: string, nextEnd: string) =>
        onRangeChangeProp(
            nextStart ? new Date(nextStart) : null,
            nextEnd ? new Date(nextEnd) : null
        )

    const [calendarMonth, setCalendarMonth] = useState(() => {
        const anchor = startDate ? new Date(startDate) : new Date()
        return new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    })
    const [prevDate, setPrevDate] = useState(startDate)

    if (startDate && startDate != prevDate) {
        setPrevDate(startDate)
        const anchor = new Date(startDate)
        if (!Number.isNaN(anchor.getTime())) {
            setCalendarMonth(
                new Date(anchor.getFullYear(), anchor.getMonth(), 1)
            )
        }
    }

    const todayInputValue = useMemo(
        () => isoToDateInput(new Date().toISOString()),
        []
    )
    const startInputValue = useMemo(
        () => isoToDateInput(startDate),
        [startDate]
    )
    const endInputValue = useMemo(() => isoToDateInput(endDate), [endDate])
    const { startDateObj, endDateObj, onDayClick, onSetEndDateToToday } =
        useDateRangeSelectionController({
            startDate,
            endDate,
            onRangeChange,
        })

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
                            new Date(next).getTime() >
                                new Date(endDate).getTime()
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
                            new Date(startDate).getTime() >
                                new Date(next).getTime()
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
                onDayClick={onDayClick}
                onSetEndDateToToday={onSetEndDateToToday}
            />
        </div>
    )
}
