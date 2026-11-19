'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import styles from './ButtonToggleRow.module.css'

export interface ButtonToggleRowProps
    extends ListRowBaseProps, ListRowFieldProps<boolean> {
    enableLabel?: string
    disableLabel?: string
    enabledValueLabel?: string
    disabledValueLabel?: string
}

export function ButtonToggleRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    enableLabel = 'Enable',
    disableLabel = 'Disable',
    enabledValueLabel = 'Yes',
    disabledValueLabel = 'No',
    ...rowProps
}: ButtonToggleRowProps) {
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
                    <span className={styles.valuePill} data-enabled={value}>
                        {value ? enabledValueLabel : disabledValueLabel}
                    </span>
                )
            }
            editor={
                <button
                    type="button"
                    aria-pressed={value === true}
                    data-action={value ? 'disable' : 'enable'}
                    className={styles.button}
                    onClick={() => onValueChange(value !== true)}
                >
                    {value ? disableLabel : enableLabel}
                </button>
            }
        />
    )
}
