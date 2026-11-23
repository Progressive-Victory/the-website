'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import fields from './fields.module.css'

export interface TextRowProps
    extends ListRowBaseProps, ListRowFieldProps<string> {
    placeholder?: string
}

export function TextRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    placeholder = 'Placeholder',
    ...rowProps
}: TextRowProps) {
    const { value, onValueChange, invalid } = useListField<string>(
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
            isEmpty: (value) => !value?.trim(),
            editing: rowProps.editing,
        }
    )
    return (
        <ListRow
            {...rowProps}
            invalid={invalid}
            value={value}
            editor={(labelId) => (
                <input
                    type="text"
                    aria-labelledby={labelId}
                    value={value ?? ''}
                    placeholder={placeholder}
                    onChange={(event) => onValueChange?.(event.target.value)}
                    className={fields.textField}
                />
            )}
        />
    )
}
