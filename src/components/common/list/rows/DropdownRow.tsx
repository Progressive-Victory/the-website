'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import styles from './DropdownRow.module.css'
import fields from './fields.module.css'
import type { ListRowOption } from './types'
import {
    DropdownButton,
    DropdownOverlay,
    DropdownOverlayButton,
} from '@/components/common/dropdown'
import type { DropdownButtonProps } from '@/components/common/dropdown/DropdownButton'

export interface DropdownRowProps
    extends ListRowBaseProps, ListRowFieldProps<string | number> {
    options?: ListRowOption[]
    placeholder?: string
    triggerLabel?: string
    onTriggerClick?: DropdownButtonProps['onClick']
    menu?: DropdownButtonProps['menu']
}

export function DropdownRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    options,
    placeholder = 'Select',
    triggerLabel,
    onTriggerClick,
    menu,
    ...rowProps
}: DropdownRowProps) {
    const { value, onValueChange, invalid } = useListField<string | number>(
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
            isEmpty: (value) => value == null || value === '',
            editing: rowProps.editing,
        }
    )
    const selected = options?.find((option) => option.value === value)
    const defaultMenu: NonNullable<DropdownButtonProps['menu']> = ({
        closeDropdown,
    }) => (
        <DropdownOverlay
            onClose={closeDropdown}
            narrowLayoutMode="trigger"
            className={fields.dropdownOverlay}
            body={
                <div className={styles.options}>
                    {(options ?? []).map((option) => (
                        <DropdownOverlayButton
                            key={option.value}
                            checked={option.value === value}
                            onClick={() => {
                                onValueChange(option.value)
                                closeDropdown()
                            }}
                        >
                            {option.label}
                        </DropdownOverlayButton>
                    ))}
                </div>
            }
        />
    )

    return (
        <ListRow
            {...rowProps}
            invalid={invalid}
            value={value === '' ? undefined : (selected?.label ?? value)}
            emptyLabel={
                rowProps.emptyLabel ??
                (value === '' ? selected?.label : undefined)
            }
            editor={
                <DropdownButton
                    label={triggerLabel ?? selected?.label ?? placeholder}
                    className={fields.dropdownTrigger}
                    onClick={onTriggerClick}
                    menu={menu ?? defaultMenu}
                />
            }
        />
    )
}
