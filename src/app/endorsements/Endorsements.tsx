'use client'

import { CandidateGallery } from './components/CandidateGallery'
import { FilterButtonRow } from './components/FilterButtonRow'
import styles from './endorsement.module.css'
import { CANDIDATES, type CandidateConfig } from './endorsements.data'
import {
    type FilterType,
    type GalleryDisplayMode,
    type SectionGroupingMode,
    type SectionSortOrder,
} from './endorsements.types'
import { useDeferredValue, useMemo, useState } from 'react'

const SORTED_CANDIDATES: CandidateConfig[] = [...CANDIDATES].sort((a, b) => {
    const aTime = a.electionDate?.getTime() ?? Infinity
    const bTime = b.electionDate?.getTime() ?? Infinity
    return aTime - bTime
})

const FILTER_PREDICATES: Record<FilterType, (c: CandidateConfig) => boolean> = {
    national: (c) => c.initiativeType === 'national',
    state: (c) => c.initiativeType === 'state',
    pledge: (c) => c.endorsementType === 'PV Pledge',
    member: (c) => c.showPvMember,
}

export function Endorsements() {
    const [filter, setFilter] = useState<FilterType | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [displayMode, setDisplayMode] = useState<GalleryDisplayMode>('flat')
    const [sectionMode, setSectionMode] =
        useState<SectionGroupingMode>('status')
    const [sectionSortOrder, setSectionSortOrder] =
        useState<SectionSortOrder>('ascending')

    const deferredSearchQuery = useDeferredValue(searchQuery)

    const filteredCandidates = useMemo(() => {
        const query = deferredSearchQuery.trim().toLowerCase()

        return SORTED_CANDIDATES.filter((candidate) => {
            const matchesTagFilter =
                filter === null ? true : FILTER_PREDICATES[filter](candidate)

            if (!matchesTagFilter) {
                return false
            }

            if (!query) {
                return true
            }

            return (
                candidate.name.toLowerCase().includes(query) ||
                candidate.state.toLowerCase().includes(query) ||
                candidate.handle.toLowerCase().includes(query)
            )
        })
    }, [filter, deferredSearchQuery])

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
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <CandidateGallery
                filteredCandidates={filteredCandidates}
                filter={filter}
                displayMode={displayMode}
                sectionMode={sectionMode}
                sectionSortOrder={sectionSortOrder}
            />
        </div>
    )
}
