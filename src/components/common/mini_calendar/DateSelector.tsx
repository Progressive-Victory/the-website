'use client'

import styles from './DateSelector.module.css'

interface DateSelectorProps {
    startDate: string
    endDate: string
    onStartDateChange: (isoDate: string) => void
    onEndDateChange: (isoDate: string) => void
}

function isoToDateInput(iso: string): string {
    if (!iso) return ''
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function dateInputToStartISO(value: string): string {
    if (!value) return ''
    const [y, mo, d] = value.split('-').map(Number)
    return new Date(y, mo - 1, d, 0, 0, 0).toISOString()
}

function dateInputToEndISO(value: string): string {
    if (!value) return ''
    const [y, mo, d] = value.split('-').map(Number)
    return new Date(y, mo - 1, d, 23, 59, 59).toISOString()
}

export default function DateSelector({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}: DateSelectorProps) {
    return (
        <div className={styles.dateRangeInputs}>
            <label className={styles.dateRangeInputLabel}>
                Start Date
                <input
                    type="date"
                    className={styles.dateRangeInput}
                    value={isoToDateInput(startDate)}
                    max={isoToDateInput(endDate) || undefined}
                    onChange={(e) =>
                        onStartDateChange(dateInputToStartISO(e.target.value))
                    }
                />
            </label>
            <label className={styles.dateRangeInputLabel}>
                End Date
                <input
                    type="date"
                    className={styles.dateRangeInput}
                    value={isoToDateInput(endDate)}
                    min={isoToDateInput(startDate) || undefined}
                    onChange={(e) =>
                        onEndDateChange(dateInputToEndISO(e.target.value))
                    }
                />
            </label>
        </div>
    )
}
