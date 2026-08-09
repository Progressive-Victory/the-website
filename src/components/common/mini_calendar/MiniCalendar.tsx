'use client'

import styles from './MiniCalendar.module.css'
import {
    createCalendarCells,
    getDayStartTs,
    getMiniCalendarDayState,
    normalizeMaxDateTs,
    normalizeMinDateTs,
} from './miniCalendar.helpers'
import { cn } from '@/util'
import { useState } from 'react'
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

export interface MiniCalendarProps {
    month: Date
    onMonthChange: (next: Date) => void
    startDate: Date | null
    endDate: Date | null
    maxDate?: Date
    minDate?: Date
    onDayClick: (day: Date) => void
    mode?: 'single' | 'range'
    stretch?: boolean
    onSetEndDateToToday?: () => void
}

export function MiniCalendar({
    month,
    onMonthChange,
    startDate,
    endDate,
    maxDate,
    minDate,
    onDayClick,
    mode = 'range',
    stretch = false,
    onSetEndDateToToday,
}: MiniCalendarProps) {
    const [hoveredDayTs, setHoveredDayTs] = useState<number | null>(null)
    const year = month.getFullYear()
    const monthIdx = month.getMonth()
    const firstOfMonth = new Date(year, monthIdx, 1)
    const cells = createCalendarCells(month)

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

    const isRangeMode = mode === 'range'
    const hasPreviewSelection = isRangeMode && startTs != null && endTs == null
    const previewRangeStartTs =
        hasPreviewSelection && hoveredDayTs != null
            ? Math.min(startTs, hoveredDayTs)
            : null
    const previewRangeEndTs =
        hasPreviewSelection && hoveredDayTs != null
            ? Math.max(startTs, hoveredDayTs)
            : null

    const maxTs = normalizeMaxDateTs(maxDate)
    const minTs = normalizeMinDateTs(minDate)

    const monthLabel = firstOfMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })

    const rootClass = [
        styles.miniCalendar,
        stretch ? styles.miniCalendarStretch : '',
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className={rootClass}>
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
                <div className={styles.miniCalendarHeaderRight}>
                    {startDate && !endDate && onSetEndDateToToday && (
                        <button
                            type="button"
                            className={styles.miniCalendarSetTodayBtn}
                            onClick={onSetEndDateToToday}
                            title="Set end date to today"
                            aria-label="Set end date to today"
                        >
                            <FiCalendar size={14} />
                        </button>
                    )}
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
                    const state = getMiniCalendarDayState({
                        day,
                        currentMonthIdx: monthIdx,
                        startTs,
                        endTs,
                        hoveredDayTs,
                        isRangeMode,
                        previewRangeStartTs,
                        previewRangeEndTs,
                        maxTs,
                        minTs,
                        isToday: (value) => isSameDay(value, new Date()),
                    })

                    const classNames = [styles.miniCalendarDay]
                    if (!state.inMonth)
                        classNames.push(styles.miniCalendarDayMuted)
                    if (state.disabled)
                        classNames.push(styles.miniCalendarDayDisabled)
                    if (state.inPreviewRange)
                        classNames.push(styles.miniCalendarDayHoverRange)
                    if (state.hasConfirmedRange && state.isStart)
                        classNames.push(styles.miniCalendarDayRangeStart)
                    if (state.hasConfirmedRange && state.isEnd)
                        classNames.push(styles.miniCalendarDayRangeEnd)
                    if (state.isPreviewStartEdge)
                        classNames.push(
                            state.isHoverAfterStart
                                ? styles.miniCalendarDayHoverStartLeft
                                : styles.miniCalendarDayHoverStartRight
                        )
                    if (state.isPreviewEdge)
                        classNames.push(
                            state.isHoverAfterStart
                                ? styles.miniCalendarDayHoverEdgeRight
                                : styles.miniCalendarDayHoverEdgeLeft
                        )
                    if (state.isStart || state.isEnd)
                        classNames.push(styles.miniCalendarDaySelected)
                    if (state.inRange)
                        classNames.push(styles.miniCalendarDayInRange)
                    if (state.isToday && !state.isStart && !state.isEnd)
                        classNames.push(styles.miniCalendarDayToday)

                    return (
                        <button
                            key={idx}
                            type="button"
                            className={cn(...classNames)}
                            disabled={state.disabled}
                            onMouseEnter={() => {
                                if (!hasPreviewSelection || state.disabled) {
                                    setHoveredDayTs(null)
                                    return
                                }
                                setHoveredDayTs(getDayStartTs(day))
                            }}
                            onClick={() => onDayClick(day)}
                            tabIndex={state.inMonth ? 0 : -1}
                        >
                            {day.getDate()}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
