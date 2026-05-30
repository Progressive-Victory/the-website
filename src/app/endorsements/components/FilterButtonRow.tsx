import styles from '../endorsement.module.css'
import {
    DISPLAY_OPTIONS,
    FILTER_OPTIONS,
    SECTION_OPTIONS,
    SECTION_SORT_OPTIONS,
} from '../endorsements.constants'
import {
    type FilterType,
    type GalleryDisplayMode,
    type SectionGroupingMode,
    type SectionSortOrder,
} from '../endorsements.types'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface FilterButtonRowProps {
    filter: FilterType | null
    setFilter: (filter: FilterType | null) => void
    displayMode: GalleryDisplayMode
    setDisplayMode: (mode: GalleryDisplayMode) => void
    sectionMode: SectionGroupingMode
    setSectionMode: (mode: SectionGroupingMode) => void
    sectionSortOrder: SectionSortOrder
    setSectionSortOrder: (order: SectionSortOrder) => void
}

export function FilterButtonRow({
    filter,
    setFilter,
    displayMode,
    setDisplayMode,
    sectionMode,
    setSectionMode,
    sectionSortOrder,
    setSectionSortOrder,
}: FilterButtonRowProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const controlsPanelRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (!openDropdown) return

            const target = event.target as Node
            if (controlsPanelRef.current?.contains(target)) return

            setOpenDropdown(null)
        }

        document.addEventListener('pointerdown', handlePointerDown)

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
        }
    }, [openDropdown])

    return (
        <div className={styles.buttonRowWrap}>
            <motion.div
                layout
                className={styles.controlsPanel}
                ref={controlsPanelRef}
                transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 30,
                    mass: 0.72,
                }}
            >
                <TagsDropdownGroup
                    dropdownId="filter"
                    label="Tags"
                    options={FILTER_OPTIONS}
                    value={filter}
                    onChange={setFilter}
                    isOpen={openDropdown === 'filter'}
                    setIsOpen={(isOpen) =>
                        setOpenDropdown(isOpen ? 'filter' : null)
                    }
                />
                <DropdownGroup
                    dropdownId="layout"
                    label="Layout"
                    options={DISPLAY_OPTIONS}
                    value={displayMode}
                    onChange={setDisplayMode}
                    isOpen={openDropdown === 'layout'}
                    setIsOpen={(isOpen) =>
                        setOpenDropdown(isOpen ? 'layout' : null)
                    }
                />
                <AnimatePresence initial={false} mode="popLayout">
                    {displayMode === 'sectioned' && (
                        <motion.div
                            layout
                            key="grouping-control"
                            initial={{ opacity: 0, x: 14 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 14 }}
                            transition={{
                                duration: 0.2,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <DropdownGroup
                                dropdownId="grouping"
                                label="Sort"
                                options={SECTION_OPTIONS}
                                value={sectionMode}
                                onChange={setSectionMode}
                                isOpen={openDropdown === 'grouping'}
                                setIsOpen={(isOpen) =>
                                    setOpenDropdown(isOpen ? 'grouping' : null)
                                }
                            />
                        </motion.div>
                    )}
                    {displayMode === 'sectioned' && (
                        <motion.div
                            layout
                            key="order-control"
                            initial={{ opacity: 0, x: 14 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 14 }}
                            transition={{
                                duration: 0.2,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <DropdownGroup
                                dropdownId="order"
                                label="Order"
                                options={SECTION_SORT_OPTIONS}
                                value={sectionSortOrder}
                                onChange={setSectionSortOrder}
                                isOpen={openDropdown === 'order'}
                                setIsOpen={(isOpen) =>
                                    setOpenDropdown(isOpen ? 'order' : null)
                                }
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

function getOptionLabel<T extends string>(
    options: { label: string; value: T }[],
    value: T
) {
    return options.find((option) => option.value === value)?.label ?? value
}

function DropdownGroup<T extends string>({
    dropdownId,
    label,
    options,
    value,
    onChange,
    isOpen,
    setIsOpen,
}: {
    dropdownId: string
    label: string
    options: { label: string; value: T }[]
    value: T
    onChange: (value: T) => void
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}) {
    const selectedLabel = getOptionLabel(options, value)

    return (
        <motion.div layout className={styles.controlGroup}>
            <p className={styles.controlLabel}>{label}</p>
            <div className={styles.dropdownControl}>
                <button
                    type="button"
                    className={styles.dropdownTrigger}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-controls={`${dropdownId}-menu`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className={styles.dropdownTriggerText}>
                        {selectedLabel}
                    </span>
                    <span
                        className={
                            isOpen
                                ? `${styles.dropdownChevron} ${styles.dropdownChevronOpen}`
                                : styles.dropdownChevron
                        }
                        aria-hidden="true"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 20 20"
                            fill="none"
                        >
                            <path
                                d="M5 7.5l5 5 5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </button>
                {isOpen && (
                    <div
                        id={`${dropdownId}-menu`}
                        className={styles.dropdownMenu}
                        role="listbox"
                        aria-label={label}
                    >
                        {options.map((option) => {
                            const isActive = value === option.value

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    className={
                                        isActive
                                            ? `${styles.dropdownOption} ${styles.dropdownOptionActive}`
                                            : styles.dropdownOption
                                    }
                                    onClick={() => {
                                        onChange(option.value)
                                        setIsOpen(false)
                                    }}
                                >
                                    <span className={styles.dropdownOptionText}>
                                        {option.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

function TagsDropdownGroup<T extends string>({
    dropdownId,
    label,
    options,
    value,
    onChange,
    isOpen,
    setIsOpen,
}: {
    dropdownId: string
    label: string
    options: { label: string; value: T }[]
    value: T | null
    onChange: (value: T | null) => void
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}) {
    const selectedLabel = value ? getOptionLabel(options, value) : 'Show All'

    return (
        <motion.div layout className={styles.controlGroup}>
            <p className={styles.controlLabel}>{label}</p>
            <div className={styles.dropdownControl}>
                <button
                    type="button"
                    className={styles.dropdownTrigger}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-controls={`${dropdownId}-menu`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className={styles.dropdownTriggerText}>
                        {selectedLabel}
                    </span>
                    <span
                        className={
                            isOpen
                                ? `${styles.dropdownChevron} ${styles.dropdownChevronOpen}`
                                : styles.dropdownChevron
                        }
                        aria-hidden="true"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 20 20"
                            fill="none"
                        >
                            <path
                                d="M5 7.5l5 5 5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </button>
                {isOpen && (
                    <div
                        id={`${dropdownId}-menu`}
                        className={styles.dropdownMenu}
                        role="listbox"
                        aria-label={label}
                    >
                        {options.map((option) => {
                            const isActive = value === option.value

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    className={
                                        isActive
                                            ? `${styles.dropdownOption} ${styles.dropdownOptionActive}`
                                            : styles.dropdownOption
                                    }
                                    onClick={() => {
                                        onChange(isActive ? null : option.value)
                                        setIsOpen(false)
                                    }}
                                >
                                    <span className={styles.dropdownOptionText}>
                                        {option.label}
                                    </span>
                                    <span
                                        className={
                                            isActive
                                                ? `${styles.dropdownCheckmark} ${styles.dropdownCheckmarkVisible}`
                                                : styles.dropdownCheckmark
                                        }
                                        aria-hidden="true"
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                        >
                                            <path
                                                d="M4.5 10.5l3.5 3.5 7-7"
                                                stroke="currentColor"
                                                strokeWidth="2.2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
