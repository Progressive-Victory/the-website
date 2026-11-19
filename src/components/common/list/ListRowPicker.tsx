import styles from './ListRow.module.css'
import type { ListRowOption } from './ListRowDropdown'
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
            className={cn(styles.dropdownTrigger, triggerClassName)}
            menu={({ closeDropdown }) => (
                <DropdownOverlay
                    onClose={closeDropdown}
                    narrowLayoutMode="trigger"
                    className={cn(styles.dropdownOverlay, styles.pickerOverlay)}
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
                            className={styles.pickerWheel}
                        />
                    }
                />
            )}
        />
    )
}
