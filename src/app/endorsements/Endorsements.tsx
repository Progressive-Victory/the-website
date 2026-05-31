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
import { useMemo, useState } from 'react'

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

    const sortedCandidates = useMemo(() => {
        return [...CANDIDATES].sort((a, b) => {
            const aTime = a.electionDate?.getTime() ?? Infinity
            const bTime = b.electionDate?.getTime() ?? Infinity
            return aTime - bTime
        })
    }, [])

    const filteredCandidates = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return sortedCandidates.filter((candidate) => {
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
    }, [sortedCandidates, filter, searchQuery])

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
