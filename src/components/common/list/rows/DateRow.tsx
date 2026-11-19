'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import fields from './fields.module.css'
import { dateService } from '@/services'

const dateFormats = {
    numeric: { year: 'numeric', month: '2-digit', day: '2-digit' },
    short: { dateStyle: 'short' },
    medium: { dateStyle: 'medium' },
    long: { dateStyle: 'long' },
    full: { dateStyle: 'full' },
} satisfies Record<string, Intl.DateTimeFormatOptions>

export type ListRowDateFormat =
    keyof typeof dateFormats | Intl.DateTimeFormatOptions

function toDateInputValue(date?: Date | null) {
    return dateService.isValid(date) ? date!.toISOString().split('T')[0] : ''
}

function formatDate(date: Date | null | undefined, format: ListRowDateFormat) {
    if (!dateService.isValid(date)) return undefined
    const options = typeof format === 'string' ? dateFormats[format] : format
    return Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(
        date!
    )
}

export interface DateRowProps
    extends ListRowBaseProps, ListRowFieldProps<Date | null> {
    dateFormat?: ListRowDateFormat
}

export function DateRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    dateFormat = 'medium',
    ...rowProps
}: DateRowProps) {
    const { value, onValueChange, invalid } = useListField<Date | null>(
        {
            value: valueProp,
            onValueChange: onValueChangeProp,
            field,
            getter,
            setter,
            validator,
        },
        {
            required: rowProps.indicator === 'required',
            isEmpty: (value) => !dateService.isValid(value),
            editing: rowProps.editing,
        }
    )
    const dateInputValue = toDateInputValue(value)

    return (
        <ListRow
            {...rowProps}
            invalid={invalid}
            value={formatDate(value, dateFormat)}
            editor={(labelId) => (
                <input
                    type="date"
                    aria-labelledby={labelId}
                    value={dateInputValue}
                    data-empty={!dateInputValue}
                    onChange={(event) =>
                        onValueChange?.(
                            event.target.value
                                ? new Date(event.target.value)
                                : null
                        )
                    }
                    className={fields.textField}
                />
            )}
        />
    )
}
