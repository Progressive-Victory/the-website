'use client'

import styles from './endorsementFilters.module.css'
import { FilterTag } from '@/app/admin/layout/FilterTags'
import { DropdownOverlay, DropdownOverlayButton } from '@/components/common'
import {
    ElectionStatus,
    Endorsement,
    EndorsementType,
    InitiativeType,
} from '@/contracts/data'
import { stateOptions } from '@/models'
import { useMemo, useState } from 'react'
import {
    FaCalendarAlt,
    FaClipboard,
    FaCog,
    FaEye,
    FaEyeSlash,
    FaMapMarkerAlt,
    FaThumbsDown,
    FaThumbsUp,
    FaUsers,
    FaUserTie,
    FaVoteYea,
} from 'react-icons/fa'
import { FaClipboardUser } from 'react-icons/fa6'

export const initiativeLevelOptions = [
    { value: InitiativeType.National, label: 'National Initiative' },
    { value: InitiativeType.State, label: 'State Initiative' },
    { value: InitiativeType.None, label: 'No Initiative' },
]

export const endorsementLevelOptions = [
    { value: EndorsementType.PVPledge, label: 'PV Pledge' },
    { value: EndorsementType.Endorsement, label: 'Endorsement' },
    { value: EndorsementType.Recommendation, label: 'Recommendation' },
    { value: EndorsementType.Unendorsed, label: 'Unendorsed' },
    { value: EndorsementType.None, label: 'No Endorsement' },
]

const endorsementLevelFilterLabels = new Map([
    [EndorsementType.Endorsement, 'Endorsed'],
    [EndorsementType.Recommendation, 'Recommended'],
    [EndorsementType.None, 'Not Endorsed'],
])

const endorsementLevelFilterOptions = endorsementLevelOptions.map((option) => ({
    ...option,
    label: endorsementLevelFilterLabels.get(option.value) ?? option.label,
}))

export const electionStatusOptions = [
    { value: ElectionStatus.Elected, label: 'Elected' },
    { value: ElectionStatus.WonPrimary, label: 'Won Primary' },
    { value: ElectionStatus.UpcomingPrimary, label: 'Upcoming' },
    { value: ElectionStatus.LostGeneral, label: 'Lost General' },
    { value: ElectionStatus.LostPrimary, label: 'Lost Primary' },
    { value: ElectionStatus.DroppedOut, label: 'Dropped Out' },
    { value: ElectionStatus.NoElection, label: 'No Election' },
]

const stateNames = new Map(
    stateOptions.map((option) => [option.value, option.label])
)

const thumbsDownLevels = new Set([
    EndorsementType.Recommendation,
    EndorsementType.Unendorsed,
    EndorsementType.None,
])

const yesNoOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
]

const publishedOptions = [
    { value: true, label: 'Published' },
    { value: false, label: 'Not Published' },
]

function YesNoMenu({
    selected,
    onSelect,
}: {
    selected: boolean | null
    onSelect: (value: boolean) => void
}) {
    return (
        <div className={styles.nestedFilterMenu}>
            {yesNoOptions.map((option) => (
                <DropdownOverlayButton
                    key={option.label}
                    checked={selected === option.value}
                    onClick={() => onSelect(option.value)}
                >
                    {option.label}
                </DropdownOverlayButton>
            ))}
        </div>
    )
}

function getElectionYears(endorsement: Endorsement) {
    return [endorsement.primaryElectionDate, endorsement.generalElectionDate]
        .filter((date): date is Date => date != null)
        .map((date) => date.getUTCFullYear())
}

interface EndorsementFilters {
    state: string | null
    year: number | null
    isPvMember: boolean | null
    isIncumbent: boolean | null
    isPublished: boolean | null
    endorsementLevel: EndorsementType | null
    electionStatus: ElectionStatus | null
    initiativeLevel: InitiativeType | null
}

function matchesFilterTag(
    endorsement: Endorsement,
    tag: string,
    filters: EndorsementFilters
) {
    switch (tag) {
        case 'endorsement_level':
            return (
                filters.endorsementLevel === null ||
                endorsement.endorsementLevel === filters.endorsementLevel
            )
        case 'endorsement_status':
            return (
                filters.electionStatus === null ||
                endorsement.electionStatus === filters.electionStatus
            )
        case 'published':
            return (
                filters.isPublished === null ||
                endorsement.endorsementPublished === filters.isPublished
            )
        case 'initiative_level':
            return (
                filters.initiativeLevel === null ||
                endorsement.initiativeLevel === filters.initiativeLevel
            )
        case 'all':
            if (
                filters.isPvMember !== null &&
                endorsement.isPvMember !== filters.isPvMember
            )
                return false
            if (
                filters.isIncumbent !== null &&
                endorsement.incumbent !== filters.isIncumbent
            )
                return false
            if (filters.state !== null && endorsement.state !== filters.state)
                return false
            if (
                filters.year !== null &&
                !getElectionYears(endorsement).includes(filters.year)
            )
                return false
            return true
        default:
            return true
    }
}

function optionDropdown<T>(
    options: { value: T; label: string }[],
    selected: T | null,
    onSelect: (value: T | null) => void
): FilterTag['dropdownOverlay'] {
    return function OptionDropdown({ closeDropdown }) {
        return (
            <DropdownOverlay
                label="Filter by"
                onClose={closeDropdown}
                narrowLayoutMode="trigger"
                style={{ left: 0, right: 'auto' }}
                body={
                    <div className={styles.filterMenu}>
                        <DropdownOverlayButton
                            checked={selected === null}
                            onClick={() => {
                                onSelect(null)
                                closeDropdown()
                            }}
                        >
                            All
                        </DropdownOverlayButton>
                        {options.map((option) => (
                            <DropdownOverlayButton
                                key={String(option.value)}
                                checked={selected === option.value}
                                onClick={() => {
                                    onSelect(option.value)
                                    closeDropdown()
                                }}
                            >
                                {option.label}
                            </DropdownOverlayButton>
                        ))}
                    </div>
                }
            />
        )
    }
}

export function useEndorsementFilters(endorsements: Endorsement[]) {
    const [activeTag, setActiveTag] = useState('all')
    const [selectedState, setSelectedState] = useState<string | null>(null)
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
    const [selectedIsPvMember, setSelectedIsPvMember] = useState<
        boolean | null
    >(null)
    const [selectedIsIncumbent, setSelectedIsIncumbent] = useState<
        boolean | null
    >(null)
    const [selectedEndorsementLevel, setSelectedEndorsementLevel] =
        useState<EndorsementType | null>(null)
    const [selectedElectionStatus, setSelectedElectionStatus] =
        useState<ElectionStatus | null>(null)
    const [selectedIsPublished, setSelectedIsPublished] = useState<
        boolean | null
    >(null)
    const [selectedInitiativeLevel, setSelectedInitiativeLevel] =
        useState<InitiativeType | null>(null)

    const electionYears = useMemo(() => {
        const years = new Set<number>()
        for (const endorsement of endorsements)
            for (const year of getElectionYears(endorsement)) years.add(year)
        return [...years].sort((a, b) => b - a)
    }, [endorsements])

    const selectedStateLabel = stateNames.get(selectedState ?? '')
    const selectedMemberLabel =
        selectedIsPvMember === null
            ? null
            : selectedIsPvMember
              ? 'Members'
              : 'Non-Members'
    const selectedIncumbentLabel =
        selectedIsIncumbent === null
            ? null
            : selectedIsIncumbent
              ? 'Incumbents'
              : 'Challengers'
    const selectedFilterLabel =
        [
            selectedStateLabel,
            selectedYear,
            selectedMemberLabel,
            selectedIncumbentLabel,
        ]
            .filter(Boolean)
            .join(' · ') || 'More'

    let selectedFilterIcon = <FaCog />
    if (selectedState) selectedFilterIcon = <FaMapMarkerAlt />
    else if (selectedYear) selectedFilterIcon = <FaCalendarAlt />
    else if (selectedIsPvMember !== null)
        selectedFilterIcon = <FaClipboardUser />
    else if (selectedIsIncumbent !== null) selectedFilterIcon = <FaUserTie />

    const tags: FilterTag[] = [
        {
            key: 'endorsement_level',
            label:
                endorsementLevelFilterOptions.find(
                    (option) => option.value === selectedEndorsementLevel
                )?.label ?? 'All Endorsements',
            icon:
                selectedEndorsementLevel !== null &&
                thumbsDownLevels.has(selectedEndorsementLevel) ? (
                    <FaThumbsDown />
                ) : (
                    <FaThumbsUp />
                ),
            color: '#5997E0',
            width: '11.65rem',
            activeRedirect: 'all',
            scrollLeft: 'members',
            scrollRight: 'all',
            dropdownOverlay: optionDropdown(
                endorsementLevelFilterOptions,
                selectedEndorsementLevel,
                setSelectedEndorsementLevel
            ),
        },
        {
            key: 'endorsement_status',
            label:
                electionStatusOptions.find(
                    (option) => option.value === selectedElectionStatus
                )?.label ?? 'Election Status',
            icon: <FaVoteYea />,
            color: '#62A46C',

            width: '11.65rem',
            activeRedirect: 'all',
            scrollLeft: 'endorsement_level',
            scrollRight: 'all',
            dropdownOverlay: optionDropdown(
                electionStatusOptions,
                selectedElectionStatus,
                setSelectedElectionStatus
            ),
        },
        {
            key: 'initiative_level',
            label:
                initiativeLevelOptions.find(
                    (option) => option.value === selectedInitiativeLevel
                )?.label ?? 'Initiatives',
            icon: <FaClipboard />,
            color: '#7674B3',
            width: '11.65rem',
            activeRedirect: 'all',
            scrollLeft: 'endorsement_level',
            scrollRight: 'all',
            dropdownOverlay: optionDropdown(
                initiativeLevelOptions,
                selectedInitiativeLevel,
                setSelectedInitiativeLevel
            ),
        },
        {
            key: 'published',
            label:
                publishedOptions.find(
                    (option) => option.value === selectedIsPublished
                )?.label ?? 'Visibility',
            icon: selectedIsPublished === false ? <FaEyeSlash /> : <FaEye />,
            color: '#C65882',
            width: '11.65rem',
            activeRedirect: 'all',
            scrollLeft: 'endorsement_level',
            scrollRight: 'all',
            dropdownOverlay: optionDropdown(
                publishedOptions,
                selectedIsPublished,
                setSelectedIsPublished
            ),
        },
        {
            key: 'all',
            label: selectedFilterLabel,
            icon: selectedFilterIcon,
            color: '#3A3A3C',
            width: '8.4rem',
            activeRedirect: 'endorsement_level',
            scrollLeft: 'endorsement_level',
            scrollRight: 'all',
            dropdownOverlay: ({ closeDropdown }) => (
                <DropdownOverlay
                    label="Filter by"
                    onClose={closeDropdown}
                    narrowLayoutMode="trigger"
                    body={
                        <div className={styles.filterMenu}>
                            <DropdownOverlayButton
                                icon={<FaUsers />}
                                checked={
                                    selectedState === null &&
                                    selectedYear === null &&
                                    selectedIsPvMember === null &&
                                    selectedIsIncumbent === null
                                }
                                onClick={() => {
                                    setSelectedState(null)
                                    setSelectedYear(null)
                                    setSelectedIsPvMember(null)
                                    setSelectedIsIncumbent(null)
                                    closeDropdown()
                                }}
                            >
                                All Items
                            </DropdownOverlayButton>
                            <DropdownOverlayButton
                                icon={<FaClipboardUser />}
                                selected={selectedIsPvMember !== null}
                                menu={({ closeMenu }) => (
                                    <YesNoMenu
                                        selected={selectedIsPvMember}
                                        onSelect={(value) => {
                                            setSelectedIsPvMember(value)
                                            closeMenu()
                                            closeDropdown()
                                        }}
                                    />
                                )}
                            >
                                PV Member
                            </DropdownOverlayButton>
                            <DropdownOverlayButton
                                icon={<FaUserTie />}
                                selected={selectedIsIncumbent !== null}
                                menu={({ closeMenu }) => (
                                    <YesNoMenu
                                        selected={selectedIsIncumbent}
                                        onSelect={(value) => {
                                            setSelectedIsIncumbent(value)
                                            closeMenu()
                                            closeDropdown()
                                        }}
                                    />
                                )}
                            >
                                Incumbent
                            </DropdownOverlayButton>
                            <DropdownOverlayButton
                                icon={<FaMapMarkerAlt />}
                                selected={selectedState !== null}
                                menu={({ closeMenu }) => (
                                    <div className={styles.nestedFilterMenu}>
                                        {stateOptions.map((state) => (
                                            <DropdownOverlayButton
                                                key={state.value}
                                                checked={
                                                    selectedState ===
                                                    state.value
                                                }
                                                onClick={() => {
                                                    setSelectedYear(null)
                                                    setSelectedState(
                                                        state.value
                                                    )
                                                    closeMenu()
                                                    closeDropdown()
                                                }}
                                            >
                                                {state.label}
                                            </DropdownOverlayButton>
                                        ))}
                                    </div>
                                )}
                            >
                                State
                            </DropdownOverlayButton>
                            <DropdownOverlayButton
                                icon={<FaCalendarAlt />}
                                selected={selectedYear !== null}
                                menu={({ closeMenu }) => (
                                    <div className={styles.nestedFilterMenu}>
                                        {electionYears.map((year) => (
                                            <DropdownOverlayButton
                                                key={year}
                                                checked={selectedYear === year}
                                                onClick={() => {
                                                    setSelectedState(null)
                                                    setSelectedYear(year)
                                                    closeMenu()
                                                    closeDropdown()
                                                }}
                                            >
                                                {year}
                                            </DropdownOverlayButton>
                                        ))}
                                    </div>
                                )}
                            >
                                Year
                            </DropdownOverlayButton>
                        </div>
                    }
                />
            ),
        },
    ]

    const filteredEndorsements = endorsements.filter((endorsement) =>
        matchesFilterTag(endorsement, activeTag, {
            state: selectedState,
            year: selectedYear,
            isPvMember: selectedIsPvMember,
            isIncumbent: selectedIsIncumbent,
            endorsementLevel: selectedEndorsementLevel,
            electionStatus: selectedElectionStatus,
            isPublished: selectedIsPublished,
            initiativeLevel: selectedInitiativeLevel,
        })
    )

    return { tags, activeTag, setActiveTag, filteredEndorsements }
}
