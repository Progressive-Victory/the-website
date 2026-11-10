import { DropdownOverlayButton } from '../dropdown'
import styles from './YesNoMenu.module.css'

const yesNoOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
] as const

export function YesNoMenu({
    selected,
    onSelect,
}: {
    selected: boolean | null
    onSelect: (value: boolean | null) => void
}) {
    return (
        <div className={styles.menu}>
            {yesNoOptions.map((option) => (
                <DropdownOverlayButton
                    key={option.label}
                    checked={selected === option.value}
                    onCheckedChange={(checked) =>
                        onSelect(checked ? option.value : null)
                    }
                >
                    {option.label}
                </DropdownOverlayButton>
            ))}
        </div>
    )
}
