import { endOfDayISO, isSameDay, startOfDayISO } from './dateRange.helpers'
import { useMemo } from 'react'

interface UseDateRangeSelectionControllerParams {
    startDate: string
    endDate: string
    onRangeChange: (startDate: string, endDate: string) => void
}

export function useDateRangeSelectionController({
    startDate,
    endDate,
    onRangeChange,
}: UseDateRangeSelectionControllerParams) {
    const startDateObj = useMemo(
        () => (startDate ? new Date(startDate) : null),
        [startDate]
    )

    const hasStart = Boolean(startDate)
    const hasEnd = Boolean(endDate)

    const onDayClick = (day: Date) => {
        const dayStartIso = startOfDayISO(day)
        const dayEndIso = endOfDayISO(day)

        if (!hasStart || (hasStart && hasEnd)) {
            if (!hasStart && isSameDay(day, new Date())) {
                onRangeChange(dayStartIso, dayEndIso)
                return
            }

            onRangeChange(dayStartIso, '')
            return
        }

        const startTs = startDateObj?.getTime() ?? 0
        if (new Date(dayStartIso).getTime() < startTs) {
            const priorStartDate =
                startDateObj ?? (startDate ? new Date(startDate) : null)
            if (!priorStartDate) {
                onRangeChange(dayStartIso, '')
                return
            }

            onRangeChange(dayStartIso, endOfDayISO(priorStartDate))
            return
        }

        onRangeChange(startDate, dayEndIso)
    }

    const onSetEndDateToToday = () => {
        if (!startDate) return
        onRangeChange(startDate, endOfDayISO(new Date()))
    }

    return {
        startDateObj,
        endDateObj: endDate ? new Date(endDate) : null,
        hasStart,
        hasEnd,
        onDayClick,
        onSetEndDateToToday,
    }
}
