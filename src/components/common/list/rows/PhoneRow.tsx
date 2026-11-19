'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import fields from './fields.module.css'
import {
    formatPhoneDisplay,
    isValidPhone,
} from '@/components/common/forms/PhoneField'

export interface PhoneRowProps
    extends ListRowBaseProps, ListRowFieldProps<string> {
    placeholder?: string
}

export function PhoneRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    placeholder = '2345556789',
    ...rowProps
}: PhoneRowProps) {
    const required = rowProps.indicator === 'required'
    const { value, onValueChange, invalid } = useListField<string>(
        {
            value: valueProp,
            onValueChange: onValueChangeProp,
            field,
            getter,
            setter,
            validator:
                validator ??
                ((value) => (value?.trim() ? isValidPhone(value) : !required)),
        },
        {
            required,
            isEmpty: (value) => !value?.trim(),
            editing: rowProps.editing,
        }
    )
    const digits = (value ?? '').replace(/^\+1/, '').replace(/\D/g, '')

    return (
        <ListRow
            {...rowProps}
            invalid={invalid}
            value={value ? formatPhoneDisplay(value) : undefined}
            editor={(labelId) => (
                <input
                    type="tel"
                    aria-labelledby={labelId}
                    value={digits}
                    placeholder={placeholder}
                    maxLength={10}
                    onChange={(event) => {
                        const next = event.target.value
                            .replace(/\D/g, '')
                            .slice(0, 10)
                        onValueChange?.(next.length === 10 ? `+1${next}` : next)
                    }}
                    className={fields.textField}
                />
            )}
        />
    )
}
