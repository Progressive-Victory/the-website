import { type ElectionStatus } from './endorsements.data'
import {
    type FilterType,
    type GalleryDisplayMode,
    type SectionGroupingMode,
    type SectionSortOrder,
} from './endorsements.types'

export const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
    { label: 'National Initiative', value: 'national' },
    { label: 'State Initiative', value: 'state' },
    { label: 'PV Pledge', value: 'pledge' },
    { label: 'PV Member', value: 'member' },
]

export const DISPLAY_OPTIONS: { label: string; value: GalleryDisplayMode }[] = [
    { label: 'Gallery View', value: 'flat' },
    { label: 'Section View', value: 'sectioned' },
]

export const SECTION_OPTIONS: { label: string; value: SectionGroupingMode }[] =
    [
        { label: 'Status', value: 'status' },
        { label: 'Name', value: 'name' },
        { label: 'State', value: 'state' },
        { label: 'Date', value: 'electionDate' },
    ]

export const SECTION_SORT_OPTIONS: {
    label: string
    value: SectionSortOrder
}[] = [
    { label: 'Ascending', value: 'ascending' },
    { label: 'Descending', value: 'descending' },
]

export const PAST_ELECTION_LABEL = 'Past Elections'
export const UPCOMING_STATUS_LABEL = 'Upcoming'
export const UNSPECIFIED_STATE_LABEL = 'Unspecified'

export const LOST_OR_DROPPED_STATUSES = new Set<ElectionStatus>([
    'Lost Primary',
    'Lost General Election',
    'Dropped Out',
])

export const ELECTION_STATUS_SORT_ORDER: Record<ElectionStatus, number> = {
    Elected: 0,
    'Won Primary': 1,
    '': 2,
    'Lost General Election': 3,
    'Lost Primary': 4,
    'Dropped Out': 5,
}

export const electionDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
})
