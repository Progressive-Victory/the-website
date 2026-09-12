'use client'

import styles from './EditableSelectTag.module.css'
import tags from './Tags.module.css'
import { DropdownButton, DropdownOverlay } from '@/components/common'
import { cn } from '@/util'
import { FiChevronDown } from 'react-icons/fi'

const selectVariants = {
    compact: {
        tag: undefined,
        trigger: styles.editSelectTag,
        label: styles.editSelectLabel,
        chevron: styles.editSelectChevron,
    },
    wide: {
        tag: tags.tagWide,
        trigger: styles.editPackageShippedTag,
        label: styles.editPackageShippedLabel,
        chevron: styles.editPackageShippedChevron,
    },
} as const

export interface EditableSelectTagProps<T extends string> {
    ariaLabel: string
    variant: keyof typeof selectVariants
    value: T | null
    options: readonly T[]
    optionClass: Record<T, string>
    dirty: boolean
    onSelect: (value: T | null) => void
    allowClear?: boolean
    menuLabel?: string
}

export const EditableSelectTag = <T extends string>({
    ariaLabel,
    variant,
    value,
    options,
    optionClass,
    dirty,
    onSelect,
    allowClear = false,
    menuLabel,
}: EditableSelectTagProps<T>) => {
    const variantClasses = selectVariants[variant]
    const choices: (T | null)[] = allowClear ? [null, ...options] : [...options]

    return (
        <DropdownButton
            buttonVariant="plain"
            aria-label={ariaLabel}
            className={cn(
                tags.tag,
                variantClasses.tag,
                variantClasses.trigger,
                value == null ? tags.tagGray : optionClass[value],
                dirty && styles.editSelectDirty
            )}
            menu={({ closeDropdown }) => (
                <DropdownOverlay
                    label={menuLabel}
                    onClose={closeDropdown}
                    className={styles.editSelectOverlay}
                    bodyClassName={styles.editSelectMenu}
                    style={{ left: 0, right: 'auto' }}
                    body={choices.map((choice) => (
                        <button
                            key={choice ?? 'none'}
                            type="button"
                            aria-pressed={choice === value}
                            className={styles.editSelectOption}
                            onClick={() => {
                                onSelect(choice)
                                closeDropdown()
                            }}
                        >
                            <span
                                className={cn(
                                    tags.tag,
                                    variantClasses.tag,
                                    choice == null
                                        ? tags.tagGray
                                        : optionClass[choice]
                                )}
                            >
                                {choice ?? 'N/A'}
                            </span>
                        </button>
                    ))}
                />
            )}
        >
            <span className={variantClasses.label}>{value ?? 'N/A'}</span>
            <FiChevronDown
                className={variantClasses.chevron}
                strokeWidth={3}
                aria-hidden="true"
            />
        </DropdownButton>
    )
}
