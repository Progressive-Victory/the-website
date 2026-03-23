'use client'

import { useInfoBlockContext } from '../Block'
import blockFieldStyles from './BlockField.module.css'
import styles from './SelectManyBlockField.module.css'
import { DropdownMenu } from '@/components/common'
import { User } from '@/contracts/data'
import { useRef, useState, type RefObject } from 'react'
import { FaPlus } from 'react-icons/fa6'

export interface SelectManyBlockFieldOption<
    T extends string | number = number,
> {
    value: T
    label: string
}

export interface SelectManyBlockFieldProps<T extends string | number = number> {
    getter: (user: User) => T[]
    setter: (user: User, values: T[]) => User
    options: SelectManyBlockFieldOption<T>[]
    boundaryRef?: RefObject<HTMLElement | null>
    emptyMessage?: string
}

export function SelectManyBlockField<T extends string | number = number>({
    getter,
    setter,
    options,
    boundaryRef,
    emptyMessage = 'None',
}: SelectManyBlockFieldProps<T>) {
    const { user, draft, editing, onDraftChange, setFieldMenuOpen } =
        useInfoBlockContext()
    const [menuOpen, setMenuOpen] = useState(false)
    const addButtonRef = useRef<HTMLButtonElement | null>(null)

    const labelOf = (val: T) =>
        options.find((o) => o.value === val)?.label ?? String(val)

    if (editing) {
        const selectedIds = getter(draft)
        const availableOptions = options.filter(
            (o) => !selectedIds.includes(o.value)
        )

        return (
            <div className={styles.list}>
                {availableOptions.length > 0 && (
                    <div className={styles.addControl}>
                        <button
                            ref={addButtonRef}
                            type="button"
                            className={styles.addButton}
                            aria-label="Add"
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            onClick={() => {
                                const next = !menuOpen
                                setMenuOpen(next)
                                setFieldMenuOpen(next)
                            }}
                        >
                            <FaPlus size={11} />
                        </button>
                        {menuOpen && (
                            <DropdownMenu
                                triggerRef={addButtonRef}
                                onClose={() => {
                                    setMenuOpen(false)
                                    setFieldMenuOpen(false)
                                }}
                                boundaryRef={boundaryRef}
                                label="Add"
                                role="menu"
                            >
                                {availableOptions.map((option) => (
                                    <DropdownMenu.Button
                                        key={option.value}
                                        label={option.label}
                                        onClick={() => {
                                            onDraftChange((u) =>
                                                setter(u, [
                                                    ...getter(u),
                                                    option.value,
                                                ])
                                            )
                                            setMenuOpen(false)
                                            setFieldMenuOpen(false)
                                        }}
                                    />
                                ))}
                            </DropdownMenu>
                        )}
                    </div>
                )}
                {selectedIds.map((id) => (
                    <button
                        key={id}
                        type="button"
                        className={`${styles.pill} ${styles.pillRemovable}`}
                        onClick={() =>
                            onDraftChange((u) =>
                                setter(
                                    u,
                                    getter(u).filter((i) => i !== id)
                                )
                            )
                        }
                    >
                        {labelOf(id)}
                    </button>
                ))}
            </div>
        )
    }

    const selectedIds = getter(user)

    if (selectedIds.length === 0) {
        return (
            <div className={blockFieldStyles.infoBlockFieldRow}>
                <span className={blockFieldStyles.infoBlockFieldLabel}>
                    {emptyMessage}
                </span>
            </div>
        )
    }

    const sortedLabels = selectedIds.map((id) => labelOf(id)).sort()

    return (
        <div className={styles.list}>
            {sortedLabels.map((name) => (
                <span key={name} className={styles.pill}>
                    {name}
                </span>
            ))}
        </div>
    )
}
