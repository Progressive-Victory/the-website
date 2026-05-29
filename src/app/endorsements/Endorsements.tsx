'use client'

import styles from './endorsement.module.css'
import { CANDIDATES, type CandidateConfig } from './endorsements.data'
import { ImageWithFallback } from '@/components/common'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useMemo, useState } from 'react'

type FilterType = 'national' | 'state' | 'pledge' | 'member'
type GalleryDisplayMode = 'sectioned' | 'flat'
type SectionGroupingMode = 'name' | 'state' | 'electionDate'
type SectionSortOrder = 'ascending' | 'descending'

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
    { label: 'National Initiative', value: 'national' },
    { label: 'State Initiative', value: 'state' },
    { label: 'PV Pledge', value: 'pledge' },
    { label: 'PV Member', value: 'member' },
]

const DISPLAY_OPTIONS: { label: string; value: GalleryDisplayMode }[] = [
    { label: 'Gallery View', value: 'flat' },
    { label: 'Section View', value: 'sectioned' },
]

const SECTION_OPTIONS: { label: string; value: SectionGroupingMode }[] = [
    { label: 'Name', value: 'name' },
    { label: 'State', value: 'state' },
    { label: 'Election Date', value: 'electionDate' },
]

const SECTION_SORT_OPTIONS: { label: string; value: SectionSortOrder }[] = [
    { label: 'Ascending', value: 'ascending' },
    { label: 'Descending', value: 'descending' },
]

const PAST_ELECTION_LABEL = 'Past Elections'

const CANDIDATE_STATE_BY_ID: Record<string, string> = {
    '1': 'Massachusetts',
    '2': 'Michigan',
    '3': 'California',
    '4': 'Illinois',
    '5': 'Maine',
    '6': 'Virginia',
    '7': 'North Carolina',
    '8': 'Florida',
    '9': 'New Hampshire',
    '10': 'Virginia',
    '11': 'New York',
    '12': 'Alaska',
    '13': 'Oklahoma',
    '14': 'Texas',
    '15': 'Utah',
    '16': 'New York',
    '17': 'California',
    '18': 'Missouri',
    '19': 'Texas',
    '20': 'New York',
    '21': 'Texas',
    '22': 'New York',
    '23': 'Maryland',
    '24': 'New Jersey',
    '25': 'Massachusetts',
    '26': 'Arizona',
    '27': 'Arizona',
    '28': 'Massachusetts',
    '29': 'Maryland',
    '30': 'Texas',
    '32': 'Washington',
    '33': 'Washington',
    '34': 'Colorado',
    '35': 'Maryland',
    '36': 'New Jersey',
    '37': 'Illinois',
    '38': 'North Carolina',
    '39': 'Florida',
    '40': 'Missouri',
    '41': 'Florida',
    '42': 'Alabama',
    '44': 'North Carolina',
    '45': 'South Dakota',
    '46': 'Nevada',
    '47': 'Kentucky',
    '48': 'Missouri',
    '49': 'Indiana',
}

const electionDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
})

const galleryLayoutTransition = {
    type: 'spring',
    stiffness: 280,
    damping: 28,
    mass: 0.9,
} as const

const waveListVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.028,
            delayChildren: 0.04,
        },
    },
    exit: {
        transition: {
            staggerChildren: 0.012,
            staggerDirection: -1,
        },
    },
} as const

const waveItemVariants = {
    hidden: {
        opacity: 0,
        x: 26,
        y: 16,
        scale: 0.94,
        filter: 'blur(3px)',
    },
    visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            stiffness: 260,
            damping: 24,
            mass: 0.82,
        },
    },
    exit: {
        opacity: 0,
        x: -10,
        y: -8,
        scale: 0.97,
        filter: 'blur(2px)',
        transition: {
            duration: 0.16,
            ease: [0.4, 0, 0.2, 1],
        },
    },
} as const

export function Endorsements() {
    const [filter, setFilter] = useState<FilterType | null>(null)
    const [displayMode, setDisplayMode] = useState<GalleryDisplayMode>('flat')
    const [sectionMode, setSectionMode] =
        useState<SectionGroupingMode>('electionDate')
    const [sectionSortOrder, setSectionSortOrder] =
        useState<SectionSortOrder>('ascending')

    const sortedCandidates = useMemo(() => {
        return [...CANDIDATES].sort((a, b) => {
            const aTime = a.electionDate?.getTime() ?? Infinity
            const bTime = b.electionDate?.getTime() ?? Infinity
            return aTime - bTime
        })
    }, [])

    const filteredCandidates = useMemo(() => {
        const predicates: Record<FilterType, (c: CandidateConfig) => boolean> =
            {
                national: (c) => c.initiativeType === 'national',
                state: (c) => c.initiativeType === 'state',
                pledge: (c) => c.showPvPledge,
                member: (c) => c.showPvMember,
            }

        if (filter === null) return sortedCandidates

        return sortedCandidates.filter(predicates[filter])
    }, [sortedCandidates, filter])

    return (
        <div className={styles.hero}>
            <FilterButtonRow
                filter={filter}
                setFilter={setFilter}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                sectionMode={sectionMode}
                setSectionMode={setSectionMode}
                sectionSortOrder={sectionSortOrder}
                setSectionSortOrder={setSectionSortOrder}
            />
            <CandidateGallery
                filteredCandidates={filteredCandidates}
                displayMode={displayMode}
                sectionMode={sectionMode}
                sectionSortOrder={sectionSortOrder}
            />
        </div>
    )
}

function FilterButtonRow({
    filter,
    setFilter,
    displayMode,
    setDisplayMode,
    sectionMode,
    setSectionMode,
    sectionSortOrder,
    setSectionSortOrder,
}: {
    filter: FilterType | null
    setFilter: (filter: FilterType | null) => void
    displayMode: GalleryDisplayMode
    setDisplayMode: (mode: GalleryDisplayMode) => void
    sectionMode: SectionGroupingMode
    setSectionMode: (mode: SectionGroupingMode) => void
    sectionSortOrder: SectionSortOrder
    setSectionSortOrder: (order: SectionSortOrder) => void
}) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    return (
        <div className={styles.buttonRowWrap}>
            <div className={styles.controlsPanel}>
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
                {displayMode === 'sectioned' && (
                    <DropdownGroup
                        dropdownId="grouping"
                        label="Section grouping"
                        options={SECTION_OPTIONS}
                        value={sectionMode}
                        onChange={setSectionMode}
                        isOpen={openDropdown === 'grouping'}
                        setIsOpen={(isOpen) =>
                            setOpenDropdown(isOpen ? 'grouping' : null)
                        }
                    />
                )}
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
            </div>
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
        <div className={styles.controlGroup}>
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
        </div>
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
        <div className={styles.controlGroup}>
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
        </div>
    )
}

function CandidateGallery({
    filteredCandidates,
    displayMode,
    sectionMode,
    sectionSortOrder,
}: {
    filteredCandidates: CandidateConfig[]
    displayMode: GalleryDisplayMode
    sectionMode: SectionGroupingMode
    sectionSortOrder: SectionSortOrder
}) {
    const groupedCandidates = useMemo(() => {
        const map = new Map<string, CandidateConfig[]>()

        for (const candidate of filteredCandidates) {
            const sectionLabel = getSectionLabel(candidate, sectionMode)
            const group = map.get(sectionLabel)
            if (group) {
                group.push(candidate)
            } else {
                map.set(sectionLabel, [candidate])
            }
        }

        return [...map.entries()].sort((a, b) =>
            compareSectionEntries(a, b, sectionMode, sectionSortOrder)
        )
    }, [filteredCandidates, sectionMode, sectionSortOrder])

    const orderedFlatCandidates = useMemo(() => {
        if (sectionSortOrder === 'ascending') return filteredCandidates

        return [...filteredCandidates].reverse()
    }, [filteredCandidates, sectionSortOrder])

    const animationKey = `${filterKey(displayMode, sectionMode, sectionSortOrder, filteredCandidates.length)}`

    if (displayMode === 'flat') {
        return (
            <LayoutGroup id="endorsements-gallery">
                <motion.div
                    layout
                    className={styles.galleryRoot}
                    transition={galleryLayoutTransition}
                >
                    <AnimatePresence mode="wait">
                        <motion.section
                            key={animationKey}
                            className={styles.gallerySection}
                            variants={waveListVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <header
                                className={`${styles.sectionHeader} ${styles.flatSectionHeader}`}
                                aria-hidden="true"
                            >
                                <h3 className={styles.sectionTitle}>Spacer</h3>
                                <div className={styles.sectionDivider} />
                            </header>

                            <motion.div
                                layout
                                className={`${styles.finderGrid} ${styles.finderGridLarge}`}
                                transition={galleryLayoutTransition}
                            >
                                {orderedFlatCandidates.map((candidate) => (
                                    <CandidateButtons
                                        key={candidate.id}
                                        candidate={candidate}
                                    />
                                ))}
                            </motion.div>
                        </motion.section>
                    </AnimatePresence>
                </motion.div>
            </LayoutGroup>
        )
    }

    return (
        <LayoutGroup id="endorsements-gallery">
            <motion.div
                layout
                className={styles.galleryRoot}
                transition={galleryLayoutTransition}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={animationKey}
                        variants={waveListVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {groupedCandidates.map(
                            ([sectionLabel, sectionCandidates]) => (
                                <motion.section
                                    key={sectionLabel}
                                    layout
                                    className={styles.gallerySection}
                                    transition={galleryLayoutTransition}
                                >
                                    <motion.header
                                        layout="position"
                                        className={styles.sectionHeader}
                                        transition={galleryLayoutTransition}
                                    >
                                        <h3 className={styles.sectionTitle}>
                                            {sectionLabel}
                                        </h3>
                                        <div
                                            className={styles.sectionDivider}
                                            aria-hidden="true"
                                        />
                                    </motion.header>

                                    <motion.div
                                        layout
                                        className={styles.finderGrid}
                                        transition={galleryLayoutTransition}
                                    >
                                        {sectionCandidates.map((candidate) => (
                                            <CandidateButtons
                                                key={candidate.id}
                                                candidate={candidate}
                                            />
                                        ))}
                                    </motion.div>
                                </motion.section>
                            )
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </LayoutGroup>
    )
}

function CandidateButtons({ candidate }: { candidate: CandidateConfig }) {
    const destination = getCandidateDestination(candidate)
    const formattedElectionDate = candidate.electionDate
        ? electionDateFormatter.format(candidate.electionDate)
        : null

    const tileContent = (
        <>
            <div className={styles.tileImageFrame}>
                <CandidateAvatar
                    imageSrc={candidate.image}
                    name={candidate.name}
                    size={92}
                    className={styles.tileImage}
                />
            </div>
            <div className={styles.tileMeta}>
                <div className={styles.tileNameRow}>
                    <p className={styles.tileName}>{candidate.name}</p>
                </div>
                {formattedElectionDate && (
                    <p className={styles.tileDate}>{formattedElectionDate}</p>
                )}
            </div>
        </>
    )

    if (!destination) {
        return (
            <motion.article
                layout
                className={styles.candidateTile}
                transition={galleryLayoutTransition}
                variants={waveItemVariants}
                whileHover={{ y: -4, scale: 1.03 }}
            >
                {tileContent}
            </motion.article>
        )
    }

    return (
        <motion.a
            layout
            href={destination}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.candidateTile}
            aria-label={`View details for ${candidate.name}`}
            transition={galleryLayoutTransition}
            variants={waveItemVariants}
            whileHover={{ y: -4, scale: 1.03 }}
        >
            {tileContent}
        </motion.a>
    )
}

function filterKey(
    displayMode: GalleryDisplayMode,
    sectionMode: SectionGroupingMode,
    sectionSortOrder: SectionSortOrder,
    count: number
) {
    return `${displayMode}-${sectionMode}-${sectionSortOrder}-${count}`
}

function CandidateAvatar({
    imageSrc,
    name,
    size,
    className,
}: {
    imageSrc: string
    name: string
    size: number
    className?: string
}) {
    return (
        <ImageWithFallback
            src={imageSrc}
            alt={`${name} profile image`}
            width={size}
            height={size}
            className={className}
        />
    )
}

function getFirstNameInitial(candidate: CandidateConfig): string {
    const [firstName] = candidate.name.trim().split(/\s+/)
    const initial = firstName?.charAt(0).toUpperCase()
    return initial && /[A-Z]/.test(initial) ? initial : '#'
}

function getCandidateDestination(
    candidate: CandidateConfig
): string | undefined {
    const learnMoreHref = candidate.learnMoreHref.trim()
    if (learnMoreHref) return learnMoreHref

    const handleHref = candidate.handleHref?.trim()
    if (!handleHref) return undefined

    return handleHref
}

function getSectionLabel(
    candidate: CandidateConfig,
    sectionMode: SectionGroupingMode
): string {
    if (sectionMode === 'state') {
        return CANDIDATE_STATE_BY_ID[candidate.id] ?? 'Unspecified'
    }

    if (sectionMode === 'electionDate') {
        if (!candidate.electionDate) {
            return 'No Election Date'
        }

        if (candidate.electionDate.getTime() < Date.now()) {
            return PAST_ELECTION_LABEL
        }

        return electionDateFormatter.format(candidate.electionDate)
    }

    return getFirstNameInitial(candidate)
}

function compareSectionEntries(
    [labelA, candidatesA]: [string, CandidateConfig[]],
    [labelB, candidatesB]: [string, CandidateConfig[]],
    sectionMode: SectionGroupingMode,
    sectionSortOrder: SectionSortOrder
): number {
    let comparison = 0

    if (sectionMode === 'electionDate') {
        if (labelA === PAST_ELECTION_LABEL || labelB === PAST_ELECTION_LABEL) {
            if (labelA === labelB) {
                const timeA =
                    candidatesA[0]?.electionDate?.getTime() ?? Infinity
                const timeB =
                    candidatesB[0]?.electionDate?.getTime() ?? Infinity
                comparison = timeA - timeB
            } else {
                comparison = labelA === PAST_ELECTION_LABEL ? 1 : -1
            }
        } else {
            const timeA = candidatesA[0]?.electionDate?.getTime() ?? Infinity
            const timeB = candidatesB[0]?.electionDate?.getTime() ?? Infinity
            comparison = timeA - timeB || labelA.localeCompare(labelB)
        }
    } else {
        if (sectionMode === 'name') {
            if (labelA === '#') return 1
            if (labelB === '#') return -1
        }

        if (sectionMode === 'state') {
            if (labelA === 'Unspecified') return 1
            if (labelB === 'Unspecified') return -1
        }

        comparison = labelA.localeCompare(labelB)
    }

    return sectionSortOrder === 'descending' ? comparison * -1 : comparison
}
