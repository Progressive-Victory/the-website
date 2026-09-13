'use client'

import { CandidateDetails } from './components/CandidateDetails'
import { CandidateGallery } from './components/CandidateGallery'
import { FilterButtonRow } from './components/FilterButtonRow'
import styles from './endorsement.module.css'
import {
    type FilterType,
    type GalleryDisplayMode,
    type SectionGroupingMode,
    type SectionSortOrder,
} from './endorsements.types'
import { ContentPageFrame } from '@/components/content_sections/ContentSections'
import {
    EndorsementType,
    InitiativeType,
    type Endorsement,
} from '@/contracts/data'
import { getRelevantElectionDate, getStateLabel } from '@/models'
import { useEndorsementQueries } from '@/queries'
import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useMemo, useState } from 'react'

const FILTER_PREDICATES: Record<FilterType, (c: Endorsement) => boolean> = {
    national: (c) => c.initiativeLevel === InitiativeType.National,
    state: (c) => c.initiativeLevel === InitiativeType.State,
    pledge: (c) => c.endorsementLevel === EndorsementType.PVPledge,
    member: (c) => c.isPvMember,
}

// Will update to not hardcode 2026 in next revision
const DEFAULT_YEAR = 2026

export function Endorsements() {
    const { ready, getEndorsements } = useEndorsementQueries()

    const endorsementsQuery = useQuery({
        queryKey: ['endorsements'],
        queryFn: ({ signal }) => getEndorsements({ signal }),
        enabled: ready,
    })

    const sortedCandidates = useMemo(
        () =>
            (endorsementsQuery.data ?? [])
                .filter((candidate) => candidate.endorsementPublished)
                .sort((a, b) => {
                    const aTime =
                        getRelevantElectionDate(a)?.getTime() ?? Infinity
                    const bTime =
                        getRelevantElectionDate(b)?.getTime() ?? Infinity
                    return aTime - bTime
                }),
        [endorsementsQuery.data]
    )

    const availableYears = useMemo(() => {
        const years = new Set<number>()
        for (const candidate of sortedCandidates) {
            if (candidate.primaryElectionDate) {
                years.add(candidate.primaryElectionDate.getUTCFullYear())
            }
            if (candidate.generalElectionDate) {
                years.add(candidate.generalElectionDate.getUTCFullYear())
            }
        }
        return Array.from(years).sort((a, b) => b - a)
    }, [sortedCandidates])

    const defaultYear =
        availableYears.find((year) => year === DEFAULT_YEAR) ??
        availableYears[0] ??
        DEFAULT_YEAR

    const [filter, setFilter] = useState<FilterType | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [displayMode, setDisplayMode] = useState<GalleryDisplayMode>('flat')
    const [sectionMode, setSectionMode] =
        useState<SectionGroupingMode>('status')
    const [sectionSortOrder, setSectionSortOrder] =
        useState<SectionSortOrder>('ascending')
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
    const [selectedCandidate, setSelectedCandidate] =
        useState<Endorsement | null>(null)

    const year = selectedYear ?? defaultYear

    const deferredSearchQuery = useDeferredValue(searchQuery)

    const query = deferredSearchQuery.trim().toLowerCase()

    const filteredCandidates = sortedCandidates.filter((candidate) => {
        const primaryYear = candidate.primaryElectionDate?.getUTCFullYear()
        const generalYear = candidate.generalElectionDate?.getUTCFullYear()
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
            getStateLabel(candidate.state).toLowerCase().includes(query) ||
            (candidate.handle?.toLowerCase().includes(query) ?? false)
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
                        setYear={setSelectedYear}
                        availableYears={availableYears}
                    />
                    {endorsementsQuery.error && (
                        <p className={styles.subheading}>
                            We couldn&apos;t load our endorsements right now.
                            Please try again later.
                        </p>
                    )}
                    {endorsementsQuery.isSuccess && (
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
                    )}
                </div>
            </ContentPageFrame>
        </>
    )
}
