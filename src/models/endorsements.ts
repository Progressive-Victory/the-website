import { stateOptions } from './states'
import {
    ElectionStatus,
    Endorsement,
    EndorsementType,
    InitiativeType,
} from '@/contracts/data'

export const ELECTION_STATUS_LABELS: Record<ElectionStatus, string> = {
    [ElectionStatus.Elected]: 'Elected',
    [ElectionStatus.WonPrimary]: 'Won Primary',
    [ElectionStatus.UpcomingPrimary]: 'Upcoming Primary',
    [ElectionStatus.LostGeneral]: 'Lost General',
    [ElectionStatus.LostPrimary]: 'Lost Primary',
    [ElectionStatus.DroppedOut]: 'Dropped Out',
    [ElectionStatus.NoElection]: 'No Election',
}

export const ENDORSEMENT_TYPE_LABELS: Record<EndorsementType, string> = {
    [EndorsementType.PVPledge]: 'PV Pledge',
    [EndorsementType.Endorsement]: 'Endorsement',
    [EndorsementType.Recommendation]: 'Recommendation',
    [EndorsementType.Unendorsed]: 'Unendorsed',
    [EndorsementType.None]: 'None',
}

export const INITIATIVE_TYPE_LABELS: Record<InitiativeType, string> = {
    [InitiativeType.State]: 'State Initiative',
    [InitiativeType.National]: 'National Initiative',
    [InitiativeType.None]: 'None',
}

export const electionStatusOptions = [
    ElectionStatus.Elected,
    ElectionStatus.WonPrimary,
    ElectionStatus.UpcomingPrimary,
    ElectionStatus.LostGeneral,
    ElectionStatus.LostPrimary,
    ElectionStatus.DroppedOut,
    ElectionStatus.NoElection,
].map((value) => ({ value, label: ELECTION_STATUS_LABELS[value] }))

export const endorsementLevelOptions = [
    EndorsementType.PVPledge,
    EndorsementType.Endorsement,
    EndorsementType.Recommendation,
    EndorsementType.Unendorsed,
    EndorsementType.None,
].map((value) => ({ value, label: ENDORSEMENT_TYPE_LABELS[value] }))

export const initiativeLevelOptions = [
    InitiativeType.State,
    InitiativeType.National,
    InitiativeType.None,
].map((value) => ({ value, label: INITIATIVE_TYPE_LABELS[value] }))

export const ELECTION_STATUS_SORT_ORDER: Record<ElectionStatus, number> = {
    [ElectionStatus.Elected]: 0,
    [ElectionStatus.WonPrimary]: 1,
    [ElectionStatus.NoElection]: 2,
    [ElectionStatus.UpcomingPrimary]: 2,
    [ElectionStatus.LostGeneral]: 3,
    [ElectionStatus.LostPrimary]: 4,
    [ElectionStatus.DroppedOut]: 5,
}

/** Statuses where the outcome replaces the state as the candidate's subtitle. */
export const LOST_OR_DROPPED_STATUSES = new Set<ElectionStatus>([
    ElectionStatus.LostPrimary,
    ElectionStatus.LostGeneral,
    ElectionStatus.DroppedOut,
])

const stateNames = new Map(
    stateOptions.map((option) => [option.value, option.label])
)

export function getStateLabel(state: string): string {
    return stateNames.get(state) ?? state
}

export function getStartOfToday(): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.getTime()
}

/** The date a candidate is currently judged by: their next election, or the one that ended their run. */
export function getRelevantElectionDate(endorsement: Endorsement) {
    const { primaryElectionDate, generalElectionDate, electionStatus } =
        endorsement

    if (electionStatus === ElectionStatus.LostPrimary && primaryElectionDate)
        return primaryElectionDate

    const startOfToday = getStartOfToday()
    const primaryHasPassed =
        !!primaryElectionDate && primaryElectionDate.getTime() < startOfToday
    const generalIsUpcoming =
        !!generalElectionDate && generalElectionDate.getTime() >= startOfToday
    const advancedPastPrimary =
        electionStatus === ElectionStatus.WonPrimary ||
        electionStatus === ElectionStatus.Elected

    if (primaryHasPassed && generalIsUpcoming && advancedPastPrimary)
        return generalElectionDate

    return primaryElectionDate ?? generalElectionDate
}

export function compareEndorsementNames(a: Endorsement, b: Endorsement) {
    const nameComparison = a.name.localeCompare(b.name, undefined, {
        sensitivity: 'base',
    })

    return nameComparison !== 0 ? nameComparison : a.id - b.id
}
