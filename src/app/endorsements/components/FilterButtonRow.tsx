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
import { cn } from '@/util'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import {
    type FocusEvent,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

interface FilterButtonRowProps {
    filter: FilterType | null
    setFilter: (filter: FilterType | null) => void
    displayMode: GalleryDisplayMode
    setDisplayMode: (mode: GalleryDisplayMode) => void
    sectionMode: SectionGroupingMode
    setSectionMode: (mode: SectionGroupingMode) => void
    sectionSortOrder: SectionSortOrder
    setSectionSortOrder: (order: SectionSortOrder) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
    year: number
    setYear: (year: number) => void
    availableYears: number[]
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
    searchQuery,
    setSearchQuery,
    year,
    setYear,
    availableYears,
}: FilterButtonRowProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [skipLayoutAnim, setSkipLayoutAnim] = useState(false)
    const [singleColumnLayout, setSingleColumnLayout] = useState(false)
    const [showSearchLabel, setShowSearchLabel] = useState(false)
    const [searchExpandedWidth, setSearchExpandedWidth] = useState<
        number | null
    >(null)
    const [mobileSearchWidth, setMobileSearchWidth] = useState<number | null>(
        null
    )
    const controlsPanelRef = useRef<HTMLDivElement | null>(null)
    const controlsRowRef = useRef<HTMLDivElement | null>(null)
    const leftMostControlRef = useRef<HTMLDivElement | null>(null)
    const searchControlRef = useRef<HTMLDivElement | null>(null)
    const searchToggleButtonRef = useRef<HTMLButtonElement | null>(null)
    const searchInputRef = useRef<HTMLInputElement | null>(null)

    const yearOptions = availableYears.map((y) => ({
        label: String(y),
        value: String(y),
    }))

    function computeSearchExpandedWidth() {
        const leftMostControl = leftMostControlRef.current
        const searchButton = searchToggleButtonRef.current

        if (!leftMostControl || !searchButton) {
            return null
        }

        const leftRect = leftMostControl.getBoundingClientRect()
        const buttonRect = searchButton.getBoundingClientRect()

        return Math.max(buttonRect.width, buttonRect.right - leftRect.left)
    }

    function computeMobileLayout() {
        const row = controlsRowRef.current
        const searchControl = searchControlRef.current
        if (!row || !searchControl) {
            return {
                width: null as number | null,
                singleColumn: false,
                maxPerRow: 0,
            }
        }
        const items = Array.from(row.children).filter(
            (child) => child !== searchControl
        ) as HTMLElement[]
        if (items.length === 0)
            return { width: null, singleColumn: false, maxPerRow: 0 }

        const rows = new Map<
            number,
            { left: number; right: number; count: number }
        >()
        for (const item of items) {
            const rect = item.getBoundingClientRect()
            if (rect.width === 0) continue
            const key = Math.round(rect.top)
            const existing = rows.get(key)
            if (existing) {
                existing.left = Math.min(existing.left, rect.left)
                existing.right = Math.max(existing.right, rect.right)
                existing.count += 1
            } else {
                rows.set(key, {
                    left: rect.left,
                    right: rect.right,
                    count: 1,
                })
            }
        }

        let widest = 0
        let maxPerRow = 0
        for (const { left, right, count } of rows.values()) {
            widest = Math.max(widest, right - left)
            maxPerRow = Math.max(maxPerRow, count)
        }

        return {
            width: widest > 0 ? widest : null,
            singleColumn: maxPerRow === 1,
            maxPerRow,
        }
    }

    const searchIsExpanded = isMobile || isSearchOpen
    const hideFiltersForSearch = isSearchOpen && !isMobile

    const openSearch = () => {
        if (isMobile) return

        setOpenDropdown(null)
        setSearchExpandedWidth(computeSearchExpandedWidth())
        setIsSearchOpen(true)
    }

    const closeSearch = () => {
        if (isMobile) return

        setIsSearchOpen(false)

        const activeElement = document.activeElement
        if (
            activeElement instanceof HTMLElement &&
            searchControlRef.current?.contains(activeElement)
        ) {
            activeElement.blur()
        }
    }

    useEffect(() => {
        if (!isSearchOpen || isMobile) return

        searchInputRef.current?.focus()
    }, [isSearchOpen, isMobile])

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 1023px)')

        const syncMobileState = () => {
            const mobile = mediaQuery.matches
            setIsMobile((prev) => {
                if (prev !== mobile) {
                    setSkipLayoutAnim(true)
                    window.requestAnimationFrame(() => {
                        window.requestAnimationFrame(() => {
                            setSkipLayoutAnim(false)
                        })
                    })
                }
                return mobile
            })
            if (mobile) {
                setIsSearchOpen(false)
            }
        }

        syncMobileState()

        mediaQuery.addEventListener('change', syncMobileState)
        window.addEventListener('resize', syncMobileState)

        return () => {
            mediaQuery.removeEventListener('change', syncMobileState)
            window.removeEventListener('resize', syncMobileState)
        }
    }, [])

    useLayoutEffect(() => {
        if (!isMobile) {
            setMobileSearchWidth(null)
            setSingleColumnLayout(false)
            setShowSearchLabel(false)
            return
        }

        const row = controlsRowRef.current
        if (!row) return

        const measure = () => {
            const next = computeMobileLayout()
            if (next.width != null) {
                setMobileSearchWidth(next.width)
            }
            setSingleColumnLayout(next.singleColumn)
            setShowSearchLabel(
                next.singleColumn ||
                    (displayMode === 'sectioned' && next.maxPerRow === 2)
            )
        }

        measure()
        const rafId = window.requestAnimationFrame(measure)

        const resizeObserver = new ResizeObserver(measure)
        resizeObserver.observe(row)
        const items = Array.from(row.children) as HTMLElement[]
        for (const item of items) {
            if (item !== searchControlRef.current) {
                resizeObserver.observe(item)
            }
        }

        window.addEventListener('resize', measure)

        return () => {
            window.cancelAnimationFrame(rafId)
            resizeObserver.disconnect()
            window.removeEventListener('resize', measure)
        }
    }, [isMobile, displayMode])

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (!openDropdown && !isSearchOpen) return

            const target = event.target as Node
            if (controlsPanelRef.current?.contains(target)) return

            setOpenDropdown(null)
            setIsSearchOpen(false)
        }

        document.addEventListener('pointerdown', handlePointerDown)

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
        }
    }, [openDropdown, isSearchOpen])

    function handleSearchBlur(event: FocusEvent<HTMLDivElement>) {
        if (!isSearchOpen) return

        const nextFocusedElement = event.relatedTarget as Node | null
        if (
            nextFocusedElement &&
            event.currentTarget.contains(nextFocusedElement)
        ) {
            return
        }

        closeSearch()
    }

    return (
        <div className={styles.buttonRowWrap}>
            <motion.div
                layout
                className={styles.controlsPanel}
                ref={controlsPanelRef}
                transition={
                    skipLayoutAnim
                        ? { duration: 0 }
                        : {
                              type: 'spring',
                              stiffness: 380,
                              damping: 32,
                              mass: 0.7,
                          }
                }
            >
                <LayoutGroup id="filter-controls">
                    <motion.div
                        layout
                        className={[
                            styles.controlsPanelDefault,
                            hideFiltersForSearch
                                ? styles.controlsPanelCovered
                                : '',
                            displayMode === 'sectioned'
                                ? styles.controlsPanelSectionedMobile
                                : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        ref={controlsRowRef}
                        transition={
                            skipLayoutAnim
                                ? { duration: 0 }
                                : {
                                      type: 'spring',
                                      stiffness: 380,
                                      damping: 32,
                                      mass: 0.7,
                                  }
                        }
                    >
                        <motion.div
                            layout
                            animate={
                                hideFiltersForSearch
                                    ? {
                                          opacity: 0,
                                          scale: 0.985,
                                          filter: 'blur(3px)',
                                      }
                                    : {
                                          opacity: 1,
                                          scale: 1,
                                          filter: 'blur(0px)',
                                      }
                            }
                            transition={{
                                layout: {
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 32,
                                    mass: 0.7,
                                },
                                duration: 0.22,
                                ease: [0.2, 0, 0, 1],
                            }}
                        >
                            <div
                                ref={leftMostControlRef}
                                className={styles.leftMostControlAnchor}
                            >
                                <TagsDropdownGroup
                                    dropdownId="filter"
                                    label="Tags"
                                    options={FILTER_OPTIONS}
                                    value={filter}
                                    onChange={setFilter}
                                    isOpen={openDropdown === 'filter'}
                                    setIsOpen={(isOpen) =>
                                        setOpenDropdown(
                                            isOpen ? 'filter' : null
                                        )
                                    }
                                    requiredSection={{
                                        label: 'Year',
                                        value: String(year),
                                        options: yearOptions,
                                        onChange: (value) =>
                                            setYear(Number(value)),
                                    }}
                                />
                            </div>
                        </motion.div>
                        <motion.div
                            layout
                            animate={
                                hideFiltersForSearch
                                    ? {
                                          opacity: 0,
                                          scale: 0.985,
                                          filter: 'blur(3px)',
                                      }
                                    : {
                                          opacity: 1,
                                          scale: 1,
                                          filter: 'blur(0px)',
                                      }
                            }
                            transition={{
                                layout: {
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 32,
                                    mass: 0.7,
                                },
                                duration: 0.24,
                                ease: [0.2, 0, 0, 1],
                                delay: hideFiltersForSearch ? 0.012 : 0,
                            }}
                        >
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
                        </motion.div>
                        <AnimatePresence initial={false} mode="popLayout">
                            {displayMode === 'sectioned' && (
                                <motion.div
                                    layout
                                    key="grouping-control"
                                    style={
                                        isMobile
                                            ? undefined
                                            : {
                                                  originX: 1,
                                                  originY: 0.5,
                                              }
                                    }
                                    initial={
                                        isMobile
                                            ? {
                                                  opacity: 0,
                                                  scale: 0.95,
                                                  filter: 'blur(4px)',
                                              }
                                            : {
                                                  opacity: 0,
                                                  scaleY: 0.6,
                                                  y: 12,
                                                  width: '0.05rem',
                                                  filter: 'blur(8px)',
                                              }
                                    }
                                    animate={
                                        hideFiltersForSearch
                                            ? {
                                                  opacity: 0,
                                                  scale: 0.985,
                                                  filter: 'blur(3px)',
                                              }
                                            : isMobile
                                              ? {
                                                    opacity: 1,
                                                    scale: 1,
                                                    filter: 'blur(0px)',
                                                }
                                              : {
                                                    opacity: 1,
                                                    scaleY: 1,
                                                    y: 0,
                                                    width: 'auto',
                                                    filter: 'blur(0px)',
                                                }
                                    }
                                    exit={
                                        isMobile
                                            ? {
                                                  opacity: 0,
                                                  scale: 0.95,
                                                  filter: 'blur(4px)',
                                              }
                                            : {
                                                  opacity: 0,
                                                  scaleY: 0.6,
                                                  y: 12,
                                                  width: '0.05rem',
                                                  filter: 'blur(8px)',
                                              }
                                    }
                                    transition={
                                        isMobile
                                            ? {
                                                  duration: 0.2,
                                                  ease: [0.2, 0, 0, 1],
                                              }
                                            : {
                                                  type: 'spring',
                                                  stiffness: 380,
                                                  damping: 24,
                                                  mass: 0.6,
                                                  delay: 0.04,
                                                  width: {
                                                      type: 'spring',
                                                      stiffness: 340,
                                                      damping: 26,
                                                      mass: 0.65,
                                                      delay: 0.06,
                                                  },
                                              }
                                    }
                                >
                                    <DropdownGroup
                                        dropdownId="grouping"
                                        label="Sort"
                                        options={SECTION_OPTIONS}
                                        value={sectionMode}
                                        onChange={setSectionMode}
                                        isOpen={openDropdown === 'grouping'}
                                        setIsOpen={(isOpen) =>
                                            setOpenDropdown(
                                                isOpen ? 'grouping' : null
                                            )
                                        }
                                    />
                                </motion.div>
                            )}
                            {displayMode === 'sectioned' && (
                                <motion.div
                                    layout
                                    key="order-control"
                                    style={
                                        isMobile
                                            ? undefined
                                            : {
                                                  originX: 0,
                                                  originY: 0.5,
                                              }
                                    }
                                    initial={
                                        isMobile
                                            ? {
                                                  opacity: 0,
                                                  scale: 0.95,
                                                  filter: 'blur(4px)',
                                              }
                                            : {
                                                  opacity: 0,
                                                  scaleY: 0.6,
                                                  y: 12,
                                                  width: '0.05rem',
                                                  filter: 'blur(8px)',
                                              }
                                    }
                                    animate={
                                        hideFiltersForSearch
                                            ? {
                                                  opacity: 0,
                                                  scale: 0.985,
                                                  filter: 'blur(3px)',
                                              }
                                            : isMobile
                                              ? {
                                                    opacity: 1,
                                                    scale: 1,
                                                    filter: 'blur(0px)',
                                                }
                                              : {
                                                    opacity: 1,
                                                    scaleY: 1,
                                                    y: 0,
                                                    width: 'auto',
                                                    filter: 'blur(0px)',
                                                }
                                    }
                                    exit={
                                        isMobile
                                            ? {
                                                  opacity: 0,
                                                  scale: 0.95,
                                                  filter: 'blur(4px)',
                                              }
                                            : {
                                                  opacity: 0,
                                                  scaleY: 0.6,
                                                  y: 12,
                                                  width: '0.05rem',
                                                  filter: 'blur(8px)',
                                              }
                                    }
                                    transition={
                                        isMobile
                                            ? {
                                                  duration: 0.2,
                                                  ease: [0.2, 0, 0, 1],
                                              }
                                            : {
                                                  type: 'spring',
                                                  stiffness: 380,
                                                  damping: 24,
                                                  mass: 0.6,
                                                  delay: 0.04,
                                                  width: {
                                                      type: 'spring',
                                                      stiffness: 340,
                                                      damping: 26,
                                                      mass: 0.65,
                                                      delay: 0.06,
                                                  },
                                              }
                                    }
                                >
                                    <DropdownGroup
                                        dropdownId="order"
                                        label="Order"
                                        options={SECTION_SORT_OPTIONS}
                                        value={sectionSortOrder}
                                        onChange={setSectionSortOrder}
                                        isOpen={openDropdown === 'order'}
                                        setIsOpen={(isOpen) =>
                                            setOpenDropdown(
                                                isOpen ? 'order' : null
                                            )
                                        }
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={false}
                            layout="position"
                            ref={searchControlRef}
                            className={[
                                styles.searchControl,
                                searchIsExpanded && !isMobile
                                    ? styles.searchControlExpanded
                                    : '',
                                singleColumnLayout || showSearchLabel
                                    ? styles.searchControlStacked
                                    : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            transition={{
                                layout: {
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 32,
                                    mass: 0.7,
                                },
                            }}
                            onPointerDownCapture={() => setOpenDropdown(null)}
                            onBlur={handleSearchBlur}
                        >
                            {showSearchLabel && (
                                <p
                                    className={cn(
                                        styles.controlLabel,
                                        styles.searchControlLabel
                                    )}
                                >
                                    Search
                                </p>
                            )}
                            <motion.div
                                initial={false}
                                className={styles.searchMorph}
                                animate={{
                                    width: isMobile
                                        ? mobileSearchWidth
                                            ? `${mobileSearchWidth}px`
                                            : 'var(--search-control-size)'
                                        : isSearchOpen && searchExpandedWidth
                                          ? `${searchExpandedWidth}px`
                                          : 'var(--search-control-size)',
                                }}
                                transition={
                                    skipLayoutAnim
                                        ? { duration: 0 }
                                        : {
                                              type: 'spring',
                                              stiffness: 360,
                                              damping: 34,
                                              mass: 0.68,
                                          }
                                }
                            >
                                <button
                                    ref={searchToggleButtonRef}
                                    type="button"
                                    className={cn(
                                        styles.searchToggleButton,
                                        !isMobile &&
                                            isSearchOpen &&
                                            styles.searchToggleButtonClose
                                    )}
                                    onPointerDown={(event) => {
                                        if (!isMobile && isSearchOpen) {
                                            event.preventDefault()
                                        }
                                    }}
                                    onClick={() => {
                                        setOpenDropdown(null)

                                        if (isMobile) {
                                            if (searchQuery) {
                                                setSearchQuery('')
                                            } else {
                                                searchInputRef.current?.focus()
                                            }
                                            return
                                        }

                                        if (isSearchOpen) {
                                            closeSearch()
                                        } else {
                                            openSearch()
                                        }
                                    }}
                                    aria-label={
                                        isMobile
                                            ? searchQuery
                                                ? 'Clear search'
                                                : 'Search endorsements'
                                            : isSearchOpen
                                              ? 'Close search'
                                              : 'Open search'
                                    }
                                >
                                    <span
                                        className={styles.searchIconWrap}
                                        aria-hidden="true"
                                    >
                                        <svg
                                            className={cn(
                                                styles.searchIcon,
                                                isMobile ||
                                                    (!isSearchOpen &&
                                                        styles.searchIconVisible)
                                            )}
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                cx="11"
                                                cy="11"
                                                r="7"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                            <path
                                                d="M20 20l-4.1-4.1"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <svg
                                            className={cn(
                                                styles.searchIcon,
                                                !isMobile &&
                                                    isSearchOpen &&
                                                    styles.searchIconVisible
                                            )}
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <path
                                                d="M6 6l12 12M18 6L6 18"
                                                stroke="currentColor"
                                                strokeWidth="2.2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {searchIsExpanded && (
                                        <motion.input
                                            ref={searchInputRef}
                                            type="text"
                                            className={styles.searchInput}
                                            value={searchQuery}
                                            onChange={(event) =>
                                                setSearchQuery(
                                                    event.target.value
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === 'Escape') {
                                                    closeSearch()
                                                    return
                                                }

                                                if (event.key === 'Enter') {
                                                    searchInputRef.current?.blur()
                                                }
                                            }}
                                            placeholder="Search"
                                            aria-label="Search endorsements"
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8 }}
                                            transition={{ duration: 0.16 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </LayoutGroup>
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
                        className={cn(
                            styles.dropdownChevron,
                            isOpen && styles.dropdownChevronOpen
                        )}
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
                                    className={cn(
                                        styles.dropdownOption,
                                        isActive && styles.dropdownOptionActive
                                    )}
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

interface TagsDropdownGroupProps<T extends string> {
    dropdownId: string
    label: string
    options: { label: string; value: T }[]
    value: T | null
    onChange: (value: T | null) => void
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    requiredSection?: {
        label: string
        value: string
        options: { label: string; value: string }[]
        onChange: (value: string) => void
    }
}

function TagsDropdownGroup<T extends string>({
    dropdownId,
    label,
    options,
    value,
    onChange,
    isOpen,
    setIsOpen,
    requiredSection,
}: TagsDropdownGroupProps<T>) {
    const selectedTagLabel = value ? getOptionLabel(options, value) : 'Show All'
    const selectedRequiredLabel = requiredSection
        ? getOptionLabel(requiredSection.options, requiredSection.value)
        : null
    const selectedLabel = selectedRequiredLabel
        ? `${selectedTagLabel} · ${selectedRequiredLabel}`
        : selectedTagLabel

    const handleRequiredSectionPress = (optionValue: string) => {
        if (requiredSection && requiredSection.value !== optionValue) {
            requiredSection.onChange(optionValue)
        }
    }

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
                        className={cn(
                            styles.dropdownChevron,
                            isOpen && styles.dropdownChevronOpen
                        )}
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
                        {requiredSection && (
                            <p className={styles.dropdownSectionLabel}>
                                {requiredSection.label}
                            </p>
                        )}
                        {requiredSection?.options.map((option) => {
                            const isActive =
                                requiredSection.value === option.value

                            return (
                                <button
                                    key={`year-${option.value}`}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    className={cn(
                                        styles.dropdownOption,
                                        isActive && styles.dropdownOptionActive
                                    )}
                                    onClick={() =>
                                        handleRequiredSectionPress(option.value)
                                    }
                                >
                                    <span className={styles.dropdownOptionText}>
                                        {option.label}
                                    </span>
                                    <span
                                        className={cn(
                                            styles.dropdownCheckmark,
                                            isActive &&
                                                styles.dropdownCheckmarkVisible
                                        )}
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
                        {requiredSection && (
                            <div
                                className={styles.dropdownDivider}
                                aria-hidden="true"
                            />
                        )}
                        {requiredSection && (
                            <p className={styles.dropdownSectionLabel}>
                                {label}
                            </p>
                        )}
                        {options.map((option) => {
                            const isActive = value === option.value

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    className={cn(
                                        styles.dropdownOption,
                                        isActive && styles.dropdownOptionActive
                                    )}
                                    onClick={() => {
                                        onChange(isActive ? null : option.value)
                                        setIsOpen(false)
                                    }}
                                >
                                    <span className={styles.dropdownOptionText}>
                                        {option.label}
                                    </span>
                                    <span
                                        className={cn(
                                            styles.dropdownCheckmark,
                                            isActive &&
                                                styles.dropdownCheckmarkVisible
                                        )}
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
