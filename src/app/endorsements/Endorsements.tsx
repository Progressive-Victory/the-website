'use client'

import { CandidateCarousel } from './components/CandidateCarousel'
import { CandidateDetails } from './components/CandidateDetails'
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
import { ContentPageFrame } from '@/components/content_sections/ContentSections'
import { useDeferredValue, useState } from 'react'

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

export function Endorsements() {
    const years = new Set<number>()
    for (const candidate of CANDIDATES) {
        if (candidate.primaryElection) {
            years.add(candidate.primaryElection.getFullYear())
        }
        if (candidate.generalElection) {
            years.add(candidate.generalElection.getFullYear())
        }
    }
    const availableYears = Array.from(years).sort((a, b) => b - a)

    const defaultYear =
        // Will update to not hardcode 2026 in next revision
        availableYears.find((year) => year === 2026) ??
        availableYears[0] ??
        2026

    const [filter, setFilter] = useState<FilterType | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [displayMode, setDisplayMode] = useState<GalleryDisplayMode>('flat')
    const [sectionMode, setSectionMode] =
        useState<SectionGroupingMode>('status')
    const [sectionSortOrder, setSectionSortOrder] =
        useState<SectionSortOrder>('ascending')
    const [year, setYear] = useState(defaultYear)
    const [selectedCandidate, setSelectedCandidate] =
        useState<CandidateConfig | null>(null)

    const deferredSearchQuery = useDeferredValue(searchQuery)

    const query = deferredSearchQuery.trim().toLowerCase()

    const filteredCandidates = SORTED_CANDIDATES.filter((candidate) => {
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

    return (
        <>
            <CandidateDetails
                candidate={selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
            />
            <ContentPageFrame
                heading={
                    <div className={styles.headingWrap}>
                        <p className={styles.heading}>
                            Endorsements{' '}
                            {/* Will update to not hardcode 2026 in next revision */}
                            <span className={styles.headingHighlight}>
                                for 2026
                            </span>
                        </p>
                        <p className={styles.subheading}>
                            Learn about each of the candidates we are
                            supporting.
                        </p>
                        {/* <p className={styles.subheading}>
                            Learn more about our endorsement criteria.
                        </p> */}

                        {/* <p className={styles.subheading}>
                            During the Primary, we focus on fighting
                            Establishment Democrats by supporting the left most
                            viable candidate that aligns with our values.
                        </p>
                        <p className={styles.subheading}>
                            During the General we focus on fighting Republicans
                            and support even the candidates we don&apos;t like
                            if it means protecting our country from fascism.
                        </p> */}
                    </div>
                }
            >
                <div className={styles.hero}>
                    {/* <CandidateCarousel
                        gap={175}
                        candidates={filteredCandidates.filter(
                            (c) =>
                                c.endorsementType === 'PV Pledge' &&
                                (c.electionStatus === '' ||
                                    c.electionStatus === 'Elected' ||
                                    c.electionStatus === 'Won Primary')
                        )}
                    /> */}
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
                        availableYears={availableYears}
                    />
                    <CandidateGallery
                        filteredCandidates={filteredCandidates}
                        filter={filter}
                        displayMode={displayMode}
                        sectionMode={sectionMode}
                        sectionSortOrder={sectionSortOrder}
                        year={year}
                        searchQuery={deferredSearchQuery}
                        onSelectCandidate={setSelectedCandidate}
                    />
                </div>
            </ContentPageFrame>
        </>
    )
}
