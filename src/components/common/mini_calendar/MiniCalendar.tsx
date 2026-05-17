'use client'

import { useState } from 'react'
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import styles from './MiniCalendar.module.css'

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
    const minTs = minDate
        ? new Date(
              minDate.getFullYear(),
              minDate.getMonth(),
              minDate.getDate(),
              0,
              0,
              0
          ).getTime()
        : null

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
                    const dayStart = new Date(
                        day.getFullYear(),
                        day.getMonth(),
                        day.getDate()
                    ).getTime()
                    const inMonth = day.getMonth() === monthIdx
                    const disabled =
                        (maxTs != null && dayStart > maxTs) ||
                        (minTs != null && dayStart < minTs)
                    const isStart = startTs != null && dayStart === startTs
                    const isEnd = endTs != null && dayStart === endTs
                    const hasConfirmedRange =
                        isRangeMode &&
                        startTs != null &&
                        endTs != null &&
                        startTs !== endTs
                    const inRange =
                        isRangeMode &&
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
