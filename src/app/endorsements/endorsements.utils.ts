import {
    NATIONWIDE_STATE_LABEL,
    PAST_ELECTION_LABEL,
    UNSPECIFIED_STATE_LABEL,
    UPCOMING_STATUS_LABEL,
    electionDateFormatter,
} from './endorsements.constants'
import {
    type SectionGroupingMode,
    type SectionSortOrder,
} from './endorsements.types'
import { ElectionStatus, type Endorsement } from '@/contracts/data'
import {
    ELECTION_STATUS_LABELS,
    ELECTION_STATUS_SORT_ORDER,
    LOST_OR_DROPPED_STATUSES,
    compareEndorsementNames,
    getRelevantElectionDate,
    getStartOfToday,
    getStateLabel,
} from '@/models'

/** Statuses that share the "Upcoming" section instead of showing their own label. Might Refactor Later */
const UPCOMING_STATUSES = new Set<ElectionStatus>([
    ElectionStatus.NoElection,
    ElectionStatus.UpcomingPrimary,
])

const STATUS_SECTION_SORT_VALUES = new Map<string, number>([
    ...Object.entries(ELECTION_STATUS_LABELS).map(
        ([status, label]) =>
            [
                label,
                ELECTION_STATUS_SORT_ORDER[Number(status) as ElectionStatus],
            ] as const
    ),
    [
        UPCOMING_STATUS_LABEL,
        ELECTION_STATUS_SORT_ORDER[ElectionStatus.NoElection],
    ],
])

export function getCandidateStateLabel(candidate: Endorsement): string {
    return getStateLabel(candidate.state) || UNSPECIFIED_STATE_LABEL
}

function getElectionStatusLabel(status: ElectionStatus): string {
    return UPCOMING_STATUSES.has(status)
        ? UPCOMING_STATUS_LABEL
        : ELECTION_STATUS_LABELS[status]
}

export function sortSectionCandidates(
    candidates: Endorsement[],
    sectionMode: SectionGroupingMode
): Endorsement[] {
    if (sectionMode !== 'name') {
        return candidates
    }

    return candidates.values().toArray().sort(compareEndorsementNames)
}

export function compareFlatCandidates(a: Endorsement, b: Endorsement): number {
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

    return compareEndorsementNames(a, b)
}

export function getFlatSubtitleText(candidate: Endorsement): string {
    return LOST_OR_DROPPED_STATUSES.has(candidate.electionStatus)
        ? ELECTION_STATUS_LABELS[candidate.electionStatus]
        : getCandidateStateLabel(candidate)
}

export function getSectionLabel(
    candidate: Endorsement,
    sectionMode: SectionGroupingMode
): string {
    switch (sectionMode) {
        case 'state':
            return getCandidateStateLabel(candidate)
        case 'status':
            return getElectionStatusLabel(candidate.electionStatus)
        case 'electionDate': {
            const relevantDate = getRelevantElectionDate(candidate)
            if (!relevantDate) {
                return 'No Election Date'
            }

            if (relevantDate.getTime() < getStartOfToday()) {
                return PAST_ELECTION_LABEL
            }

            return electionDateFormatter.format(relevantDate)
        }
        default:
            return getFirstNameInitial(candidate)
    }
}

export function compareSectionEntries(
    [labelA, candidatesA]: [string, Endorsement[]],
    [labelB, candidatesB]: [string, Endorsement[]],
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

    let comparison = 0

    if (sectionMode === 'electionDate') {
        const timeA = candidatesA[0]
            ? (getRelevantElectionDate(candidatesA[0])?.getTime() ?? Infinity)
            : Infinity
        const timeB = candidatesB[0]
            ? (getRelevantElectionDate(candidatesB[0])?.getTime() ?? Infinity)
            : Infinity
        comparison = timeA - timeB || labelA.localeCompare(labelB)
    } else {
        switch (sectionMode) {
            case 'name':
                if (labelA === '#') return 1
                if (labelB === '#') return -1
                comparison = labelA.localeCompare(labelB)
                break
            case 'state':
                if (labelA === NATIONWIDE_STATE_LABEL) return -1
                if (labelB === NATIONWIDE_STATE_LABEL) return 1
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
    return STATUS_SECTION_SORT_VALUES.get(sectionLabel) ?? 99
}

function getFirstNameInitial(candidate: Endorsement): string {
    const [firstName] = candidate.name.trim().split(/\s+/)
    const initial = firstName?.charAt(0).toUpperCase()
    return initial && /[A-Z]/.test(initial) ? initial : '#'
}
