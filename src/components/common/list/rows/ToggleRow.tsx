'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import styles from './ToggleRow.module.css'
import { Switch } from '@/components/common/switch/Switch'

export interface ToggleRowProps
    extends ListRowBaseProps, ListRowFieldProps<boolean> {}

export function ToggleRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    ...rowProps
}: ToggleRowProps) {
    const { value, onValueChange, invalid } = useListField<boolean>(
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
            isEmpty: (value) => value == null,
            editing: rowProps.editing,
        }
    )
    return (
        <ListRow
            {...rowProps}
            invalid={invalid}
            value={
                value != null && (
                    <span className={styles.togglePill} data-enabled={value}>
                        {value ? 'Yes' : 'No'}
                    </span>
                )
            }
            editor={
                <Switch
                    type="long"
                    ariaLabel={
                        typeof rowProps.label === 'string'
                            ? rowProps.label
                            : 'Toggle'
                    }
                    checked={value === true}
                    onCheckedChange={(checked) => onValueChange?.(checked)}
                />
            }
        />
    )
}
