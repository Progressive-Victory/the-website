export interface MiniCalendarDayState {
    dayStart: number
    inMonth: boolean
    disabled: boolean
    isStart: boolean
    isEnd: boolean
    hasConfirmedRange: boolean
    inRange: boolean
    inPreviewRange: boolean
    isHoverAfterStart: boolean
    isPreviewEdge: boolean
    isPreviewStartEdge: boolean
    isToday: boolean
}

export function createCalendarCells(month: Date): Date[] {
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

    return cells
}

export function getDayStartTs(day: Date) {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
}

export function normalizeMinDateTs(minDate?: Date) {
    if (!minDate) return null
    return new Date(
        minDate.getFullYear(),
        minDate.getMonth(),
        minDate.getDate(),
        0,
        0,
        0
    ).getTime()
}

export function normalizeMaxDateTs(maxDate?: Date) {
    if (!maxDate) return null
    return new Date(
        maxDate.getFullYear(),
        maxDate.getMonth(),
        maxDate.getDate(),
        23,
        59,
        59
    ).getTime()
}

export function getMiniCalendarDayState(params: {
    day: Date
    currentMonthIdx: number
    startTs: number | null
    endTs: number | null
    hoveredDayTs: number | null
    isRangeMode: boolean
    previewRangeStartTs: number | null
    previewRangeEndTs: number | null
    maxTs: number | null
    minTs: number | null
    isToday: (day: Date) => boolean
}): MiniCalendarDayState {
    const {
        day,
        currentMonthIdx,
        startTs,
        endTs,
        hoveredDayTs,
        isRangeMode,
        previewRangeStartTs,
        previewRangeEndTs,
        maxTs,
        minTs,
        isToday,
    } = params

    const dayStart = getDayStartTs(day)
    const inMonth = day.getMonth() === currentMonthIdx
    const disabled =
        (maxTs != null && dayStart > maxTs) ||
        (minTs != null && dayStart < minTs)
    const isStart = startTs != null && dayStart === startTs
    const isEnd = endTs != null && dayStart === endTs
    const hasConfirmedRange =
        isRangeMode && startTs != null && endTs != null && startTs !== endTs
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
        hoveredDayTs != null && startTs != null && hoveredDayTs > startTs
    const isPreviewEdge =
        isRangeMode &&
        startTs != null &&
        endTs == null &&
        hoveredDayTs != null &&
        dayStart === hoveredDayTs &&
        dayStart !== startTs
    const isPreviewStartEdge =
        isRangeMode &&
        startTs != null &&
        endTs == null &&
        hoveredDayTs != null &&
        isStart &&
        hoveredDayTs !== startTs

    return {
        dayStart,
        inMonth,
        disabled,
        isStart,
        isEnd,
        hasConfirmedRange,
        inRange,
        inPreviewRange,
        isHoverAfterStart,
        isPreviewEdge,
        isPreviewStartEdge,
        isToday: isToday(day),
    }
}
