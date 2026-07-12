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
import { getRelevantElectionDate } from './endorsements.utils'
import { useDeferredValue, useMemo, useState } from 'react'

const SORTED_CANDIDATES: CandidateConfig[] = [...CANDIDATES].sort((a, b) => {
    const aTime = getRelevantElectionDate(a)?.getTime() ?? Infinity
    const bTime = getRelevantElectionDate(b)?.getTime() ?? Infinity
    return aTime - bTime
})

const FILTER_PREDICATES: Record<FilterType, (c: CandidateConfig) => boolean> = {
    national: (c) => c.initiativeType === 'national',
    state: (c) => c.initiativeType === 'state',
    pledge: (c) => c.endorsementType === 'PV Pledge',
    member: (c) => c.showPvMember,
}

const AVAILABLE_YEARS: number[] = (() => {
    const years = new Set<number>()
    for (const candidate of CANDIDATES) {
        if (candidate.primaryElection) {
            years.add(candidate.primaryElection.getFullYear())
        }
        if (candidate.generalElection) {
            years.add(candidate.generalElection.getFullYear())
        }
    }
    return Array.from(years).sort((a, b) => b - a)
})()

const DEFAULT_YEAR: number =
    AVAILABLE_YEARS.find((year) => year === 2026) ?? AVAILABLE_YEARS[0] ?? 2026

export function Endorsements() {
    const [filter, setFilter] = useState<FilterType | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [displayMode, setDisplayMode] = useState<GalleryDisplayMode>('flat')
    const [sectionMode, setSectionMode] =
        useState<SectionGroupingMode>('status')
    const [sectionSortOrder, setSectionSortOrder] =
        useState<SectionSortOrder>('ascending')
    const [year, setYear] = useState<number>(DEFAULT_YEAR)

    const deferredSearchQuery = useDeferredValue(searchQuery)

    const filteredCandidates = useMemo(() => {
        const query = deferredSearchQuery.trim().toLowerCase()

        return SORTED_CANDIDATES.filter((candidate) => {
            const primaryYear = candidate.primaryElection?.getFullYear()
            const generalYear = candidate.generalElection?.getFullYear()
            const matchesYear = primaryYear === year || generalYear === year

            if (!matchesYear) {
                return false
            }

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
    }, [filter, deferredSearchQuery, year])

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
                year={year}
                setYear={setYear}
                availableYears={AVAILABLE_YEARS}
            />
            <CandidateGallery
                filteredCandidates={filteredCandidates}
                filter={filter}
                displayMode={displayMode}
                sectionMode={sectionMode}
                sectionSortOrder={sectionSortOrder}
                year={year}
                searchQuery={deferredSearchQuery}
            />
        </div>
    )
}
