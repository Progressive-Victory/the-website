import styles from './MultiSelect.module.css'
import { cn } from '@/util'
import { useClickAway } from '@/util/hooks'
import { useRef, useState } from 'react'
import { FaPlus } from 'react-icons/fa6'

export interface MultiSelectOption {
    value: string | number
    label: string
}

export interface MultiSelectProps {
    name: string
    options: MultiSelectOption[]
    selected: (string | number)[]
    readonly?: boolean
    disabled?: boolean
    onUpdate: (selected: (string | number)[]) => void
}

export function MultiSelect({
    name,
    options,
    selected,
    readonly,
    disabled,
    onUpdate,
}: MultiSelectProps) {
    const [menuOpen, setMenuOpen] = useState(false)

    const buttonRef = useRef<HTMLButtonElement>(null)
    const menuRef = useClickAway<HTMLDivElement>((target) => {
        const contains = buttonRef.current?.contains(target)
        if (!contains) setMenuOpen(false)
    })

    const optionMap = new Map(
        options.map((option) => [option.value, option.label])
    )

    const available = (() => {
        const availableMap = new Map(optionMap.entries())
        for (const value of selected) availableMap.delete(value)
        return Array.from(availableMap.entries())
    })()

    const handleToggleMenu = () => {
        setMenuOpen((open) => !open)
    }

    const handleAdd = (value: string | number) => {
        onUpdate([...selected, value])
        setMenuOpen(false)
    }

    const handleRemove = (value: string | number) => {
        onUpdate(selected.filter((selection) => selection !== value))
    }

    return (
        <>
            {selected.map((value) => (
                <button
                    type="button"
                    id={`remove-${value}`}
                    key={`remove-${value}`}
                    className={cn(
                        styles.option,
                        !readonly && styles.removeButton
                    )}
                    disabled={!!disabled || readonly}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemove(value)
                    }}
                >
                    {optionMap.get(value)}
                </button>
            ))}
            {!selected.length && readonly && <span>None</span>}

            {available.length > 0 && (
                <div className={styles.menuBase}>
                    {!readonly && (
                        <button
                            type="button"
                            ref={buttonRef}
                            className={styles.menuButton}
                            disabled={disabled}
                            title={`Add ${name}`}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleToggleMenu()
                            }}
                        >
                            <FaPlus size={11} />
                        </button>
                    )}
                    {menuOpen && (
                        <div ref={menuRef} className={styles.menu}>
                            {available.map(([value, label]) => (
                                <button
                                    type="button"
                                    id={`add-${value}`}
                                    key={`add-${value}`}
                                    className={styles.addButton}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleAdd(value)
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
