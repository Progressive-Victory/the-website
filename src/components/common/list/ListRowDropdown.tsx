import styles from './ListRow.module.css'
import {
    DropdownButton,
    DropdownOverlay,
    DropdownOverlayButton,
} from '@/components/common/dropdown'

export interface ListRowOption {
    value: string | number
    label: string
}

interface DropdownEditorProps {
    value?: string | number | null
    options: ListRowOption[]
    placeholder?: string
    onValueChange?: (value: string | number) => void
}

export function DropdownEditor({
    value,
    options,
    placeholder = 'Select',
    onValueChange,
}: DropdownEditorProps) {
    const selected = options.find((option) => option.value === value)

    return (
        <DropdownButton
            label={selected?.label ?? placeholder}
            className={styles.dropdownTrigger}
            menu={({ closeDropdown }) => (
                <DropdownOverlay
                    label={placeholder}
                    onClose={closeDropdown}
                    narrowLayoutMode="trigger"
                    className={styles.dropdownOverlay}
                    body={
                        <div className={styles.dropdownOptions}>
                            {options.map((option) => (
                                <DropdownOverlayButton
                                    key={option.value}
                                    checked={option.value === value}
                                    onClick={() => {
                                        onValueChange?.(option.value)
                                        closeDropdown()
                                    }}
                                >
                                    {option.label}
                                </DropdownOverlayButton>
                            ))}
                        </div>
                    }
                />
            )}
        />
    )
}
