import {
    ELECTION_STATUS_SORT_ORDER,
    LOST_OR_DROPPED_STATUSES,
    PAST_ELECTION_LABEL,
    UNSPECIFIED_STATE_LABEL,
    UPCOMING_STATUS_LABEL,
    electionDateFormatter,
} from './endorsements.constants'
import { type CandidateConfig, type ElectionStatus } from './endorsements.data'
import {
    type GalleryDisplayMode,
    type SectionGroupingMode,
    type SectionSortOrder,
} from './endorsements.types'

export function getCandidateStateLabel(candidate: CandidateConfig): string {
    return candidate.state || UNSPECIFIED_STATE_LABEL
}

function getStartOfToday(): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.getTime()
}

export function compareCandidateNames(
    a: CandidateConfig,
    b: CandidateConfig
): number {
    const nameComparison = a.name.localeCompare(b.name, undefined, {
        sensitivity: 'base',
    })

    if (nameComparison !== 0) {
        return nameComparison
    }

    return a.id.localeCompare(b.id)
}

export function sortSectionCandidates(
    candidates: CandidateConfig[],
    sectionMode: SectionGroupingMode
): CandidateConfig[] {
    if (sectionMode !== 'name') {
        return candidates
    }

    return candidates.values().toArray().sort(compareCandidateNames)
}

export function compareFlatCandidates(
    a: CandidateConfig,
    b: CandidateConfig
): number {
    const statusOrderA = ELECTION_STATUS_SORT_ORDER[a.electionStatus]
    const statusOrderB = ELECTION_STATUS_SORT_ORDER[b.electionStatus]
    const statusComparison = statusOrderA - statusOrderB

    if (statusComparison !== 0) {
        return statusComparison
    }

    const stateComparison = getCandidateStateLabel(a).localeCompare(
        getCandidateStateLabel(b),
        undefined,
        {
            sensitivity: 'base',
        }
    )

    if (stateComparison !== 0) {
        return stateComparison
    }

    return compareCandidateNames(a, b)
}

export function getFlatSubtitleText(candidate: CandidateConfig): string {
    return LOST_OR_DROPPED_STATUSES.has(candidate.electionStatus)
        ? candidate.electionStatus
        : getCandidateStateLabel(candidate)
}

export function getCandidateSubtitleText(
    candidate: CandidateConfig,
    displayMode: GalleryDisplayMode,
    sectionMode: SectionGroupingMode
): string | null {
    const formattedElectionDate = candidate.electionDate
        ? electionDateFormatter.format(candidate.electionDate)
        : null
    const isPastElectionCandidate =
        !!candidate.electionDate &&
        candidate.electionDate.getTime() < getStartOfToday()

    if (displayMode === 'flat') {
        return getFlatSubtitleText(candidate)
    }

    if (
        sectionMode === 'name' ||
        (sectionMode === 'electionDate' && !isPastElectionCandidate)
    ) {
        return getCandidateStateLabel(candidate)
    }

    return formattedElectionDate
}

export function getSectionLabel(
    candidate: CandidateConfig,
    sectionMode: SectionGroupingMode
): string {
    switch (sectionMode) {
        case 'state':
            return getCandidateStateLabel(candidate)
        case 'status':
            return candidate.electionStatus || UPCOMING_STATUS_LABEL
        case 'electionDate':
            if (!candidate.electionDate) {
                return 'No Election Date'
            }

            if (candidate.electionDate.getTime() < getStartOfToday()) {
                return PAST_ELECTION_LABEL
            }

            return electionDateFormatter.format(candidate.electionDate)
        default:
            return getFirstNameInitial(candidate)
    }
}

export function compareSectionEntries(
    [labelA, candidatesA]: [string, CandidateConfig[]],
    [labelB, candidatesB]: [string, CandidateConfig[]],
    sectionMode: SectionGroupingMode,
    sectionSortOrder: SectionSortOrder
): number {
    if (
        sectionMode === 'electionDate' &&
        labelA !== labelB &&
        (labelA === PAST_ELECTION_LABEL || labelB === PAST_ELECTION_LABEL)
    ) {
        return labelA === PAST_ELECTION_LABEL ? 1 : -1
    }

    let comparison

    if (sectionMode === 'electionDate') {
        const timeA = candidatesA[0]?.electionDate?.getTime() ?? Infinity
        const timeB = candidatesB[0]?.electionDate?.getTime() ?? Infinity
        comparison = timeA - timeB || labelA.localeCompare(labelB)
    } else {
        switch (sectionMode) {
            case 'name':
                if (labelA === '#') return 1
                if (labelB === '#') return -1
                comparison = labelA.localeCompare(labelB)
                break
            case 'state':
                if (labelA === UNSPECIFIED_STATE_LABEL) return 1
                if (labelB === UNSPECIFIED_STATE_LABEL) return -1
                comparison = labelA.localeCompare(labelB)
                break
            case 'status': {
                const orderA = getElectionStatusSortValue(labelA)
                const orderB = getElectionStatusSortValue(labelB)
                comparison = orderA - orderB || labelA.localeCompare(labelB)
                break
            }
            default:
                comparison = labelA.localeCompare(labelB)
                break
        }
    }

    return sectionSortOrder === 'descending' ? comparison * -1 : comparison
}

export function getElectionStatusSortValue(sectionLabel: string): number {
    if (sectionLabel === UPCOMING_STATUS_LABEL) {
        return ELECTION_STATUS_SORT_ORDER['']
    }

    return ELECTION_STATUS_SORT_ORDER[sectionLabel as ElectionStatus] ?? 99
}

function getFirstNameInitial(candidate: CandidateConfig): string {
    const [firstName] = candidate.name.trim().split(/\s+/)
    const initial = firstName?.charAt(0).toUpperCase()
    return initial && /[A-Z]/.test(initial) ? initial : '#'
}
