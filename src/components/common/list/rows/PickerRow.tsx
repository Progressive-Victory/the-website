'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import styles from './PickerRow.module.css'
import fields from './fields.module.css'
import type { ListRowOption } from './types'
import { DropdownButton, DropdownOverlay } from '@/components/common/dropdown'
import { PickerWheel } from '@/components/common/picker_wheel/PickerWheel'
import { cn } from '@/util'

interface PickerEditorProps {
    value?: string | number | null
    options: ListRowOption[]
    placeholder?: string
    visibleCount?: number
    triggerLabel?: string
    triggerClassName?: string
    onValueChange?: (value: string | number) => void
}

export function PickerEditor({
    value,
    options,
    placeholder = 'Select',
    visibleCount,
    triggerLabel,
    triggerClassName,
    onValueChange,
}: PickerEditorProps) {
    const selected = options.find((option) => option.value === value)

    return (
        <DropdownButton
            label={triggerLabel ?? selected?.label ?? placeholder}
            className={cn(fields.dropdownTrigger, triggerClassName)}
            menu={({ closeDropdown }) => (
                <DropdownOverlay
                    onClose={closeDropdown}
                    narrowLayoutMode="trigger"
                    className={cn(fields.dropdownOverlay, styles.overlay)}
                    body={
                        <PickerWheel
                            aria-label={placeholder}
                            options={options}
                            value={value}
                            onChange={(next) => onValueChange?.(next)}
                            onPick={(picked) => {
                                if (picked !== value) onValueChange?.(picked)
                                closeDropdown()
                            }}
                            visibleCount={visibleCount}
                            className={styles.wheel}
                        />
                    }
                />
            )}
        />
    )
}

export interface PickerRowProps
    extends ListRowBaseProps, ListRowFieldProps<string | number> {
    options: ListRowOption[]
    placeholder?: string
    visibleCount?: number
}

export function PickerRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    options,
    placeholder,
    visibleCount,
    ...rowProps
}: PickerRowProps) {
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
    const selected = options.find((option) => option.value === value)
    return (
        <ListRow
            {...rowProps}
            invalid={invalid}
            value={value === '' ? undefined : selected?.label}
            emptyLabel={
                rowProps.emptyLabel ??
                (value === '' ? selected?.label : undefined)
            }
            editor={
                <PickerEditor
                    value={value}
                    options={options}
                    placeholder={placeholder}
                    visibleCount={visibleCount}
                    onValueChange={onValueChange}
                />
            }
        />
    )
}
