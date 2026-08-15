import styles from '../endorsement.module.css'
import { PAST_ELECTION_LABEL } from '../endorsements.constants'
import { type CandidateConfig } from '../endorsements.data'
import {
    galleryLayoutTransition,
    headingVariants,
    waveItemVariants,
    waveListVariants,
} from '../endorsements.motion'
import {
    type FilterType,
    type GalleryDisplayMode,
    type SectionGroupingMode,
    type SectionSortOrder,
} from '../endorsements.types'
import {
    compareFlatCandidates,
    compareSectionEntries,
    getSectionLabel,
    sortSectionCandidates,
} from '../endorsements.utils'
import { ElectionStatusBadge } from './ElectionStatusBadge'
import { PersonCard } from '@/components/common'
import { cn } from '@/util'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { memo } from 'react'

interface CandidateGalleryProps {
    filteredCandidates: CandidateConfig[]
    filter: FilterType | null
    displayMode: GalleryDisplayMode
    sectionMode: SectionGroupingMode
    sectionSortOrder: SectionSortOrder
    year: number
    searchQuery: string
    onSelectCandidate: (candidate: CandidateConfig) => void
}

export function CandidateGallery({
    filteredCandidates,
    filter,
    displayMode,
    sectionMode,
    sectionSortOrder,
    year,
    searchQuery,
    onSelectCandidate,
}: CandidateGalleryProps) {
    const candidateMap = new Map<string, CandidateConfig[]>()

    for (const candidate of filteredCandidates) {
        const sectionLabel = getSectionLabel(candidate, sectionMode)
        const group = candidateMap.get(sectionLabel)
        if (group) {
            group.push(candidate)
        } else {
            candidateMap.set(sectionLabel, [candidate])
        }
    }

    const groupedCandidates = candidateMap
        .entries()
        .toArray()
        .map(
            ([sectionLabel, sectionCandidates]) =>
                [
                    sectionLabel,
                    sortSectionCandidates(sectionCandidates, sectionMode),
                ] as [string, CandidateConfig[]]
        )
        .sort((a, b) =>
            compareSectionEntries(a, b, sectionMode, sectionSortOrder)
        )

    const orderedFlatCandidates = filteredCandidates
        .values()
        .toArray()
        .sort(compareFlatCandidates)

    const animationKey = `${displayMode}-${sectionMode}-${sectionSortOrder}-${filter ?? 'all'}-${year}-${searchQuery.trim().toLowerCase()}`
    const flatHeaderTitle = getFlatHeaderTitle(
        filter,
        orderedFlatCandidates.length
    )

    if (displayMode === 'flat') {
        return (
            <LayoutGroup id="endorsements-gallery">
                <motion.div
                    layout
                    className={styles.galleryRoot}
                    transition={galleryLayoutTransition}
                >
                    <AnimatePresence mode="wait">
                        <motion.section
                            key={animationKey}
                            className={styles.gallerySection}
                            variants={waveListVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.header
                                className={cn(
                                    styles.sectionHeader,
                                    styles.centeredSectionHeader
                                )}
                                variants={headingVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <div
                                    className={styles.sectionDividerLeft}
                                    aria-hidden="true"
                                />
                                <h3 className={styles.sectionTitle}>
                                    {flatHeaderTitle}
                                </h3>
                                <div
                                    className={styles.sectionDivider}
                                    aria-hidden="true"
                                />
                            </motion.header>

                            <motion.div
                                layout
                                className={cn(
                                    styles.finderGrid,
                                    styles.finderGridLarge
                                )}
                                transition={galleryLayoutTransition}
                            >
                                {orderedFlatCandidates.map((candidate) => (
                                    <CandidateCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        onSelect={() =>
                                            onSelectCandidate(candidate)
                                        }
                                    />
                                ))}
                            </motion.div>
                            <DisclaimerCard />
                        </motion.section>
                    </AnimatePresence>
                </motion.div>
            </LayoutGroup>
        )
    }

    return (
        <LayoutGroup id="endorsements-gallery">
            <motion.div
                layout
                className={styles.galleryRoot}
                transition={galleryLayoutTransition}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={animationKey}
                        variants={waveListVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Will Abstract to reduce nesting in next revision */}
                        {groupedCandidates.map(
                            ([sectionLabel, sectionCandidates], groupIndex) => {
                                const isPastElectionSection =
                                    sectionLabel === PAST_ELECTION_LABEL
                                const isLastGroup =
                                    groupIndex === groupedCandidates.length - 1

                                return (
                                    <motion.section
                                        key={sectionLabel}
                                        layout
                                        className={cn(
                                            styles.gallerySection,
                                            isPastElectionSection &&
                                                styles.pastElectionSection
                                        )}
                                        transition={galleryLayoutTransition}
                                    >
                                        <motion.header
                                            layout="position"
                                            className={cn(
                                                styles.sectionHeader,
                                                isPastElectionSection &&
                                                    styles.centeredSectionHeader
                                            )}
                                            transition={galleryLayoutTransition}
                                            variants={headingVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            {isPastElectionSection ? (
                                                <>
                                                    <div
                                                        className={
                                                            styles.sectionDividerLeft
                                                        }
                                                        aria-hidden="true"
                                                    />
                                                    <h3
                                                        className={
                                                            styles.sectionTitle
                                                        }
                                                    >
                                                        {sectionLabel}
                                                    </h3>
                                                    <div
                                                        className={
                                                            styles.sectionDivider
                                                        }
                                                        aria-hidden="true"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <h3
                                                        className={
                                                            styles.sectionTitle
                                                        }
                                                    >
                                                        {sectionLabel}
                                                    </h3>
                                                    <div
                                                        className={
                                                            styles.sectionDivider
                                                        }
                                                        aria-hidden="true"
                                                    />
                                                </>
                                            )}
                                        </motion.header>

                                        <motion.div
                                            layout
                                            className={styles.finderGrid}
                                            transition={galleryLayoutTransition}
                                        >
                                            {sectionCandidates.map(
                                                (candidate) => (
                                                    <CandidateCard
                                                        key={candidate.id}
                                                        candidate={candidate}
                                                        onSelect={() =>
                                                            onSelectCandidate(
                                                                candidate
                                                            )
                                                        }
                                                    />
                                                )
                                            )}
                                        </motion.div>
                                        {isLastGroup && <DisclaimerCard />}
                                    </motion.section>
                                )
                            }
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </LayoutGroup>
    )
}

function getFlatHeaderTitle(
    filter: FilterType | null,
    endorsementsCount: number
): string {
    if (filter === null) {
        return `All ${endorsementsCount} Endorsements`
    }

    if (filter === 'national') {
        return 'National Initiatives'
    }

    if (filter === 'state') {
        return 'State Initiatives'
    }

    if (filter === 'pledge') {
        return 'PV Pledge Endorsements'
    }

    return 'PV Members Running'
}

function CandidateCardImpl({
    candidate,
    onSelect,
}: {
    candidate: CandidateConfig
    onSelect: () => void
}) {
    const subtitleText = candidate.endorsementType
    const avatarFrameClassName =
        candidate.avatarBackgroundColor === 'blue'
            ? styles.tileImageFramePledge
            : styles.tileImageFrameNoPledge

    return (
        <motion.article
            layout
            transition={galleryLayoutTransition}
            variants={waveItemVariants}
            whileHover={{ y: -4, scale: 1.03 }}
            onClick={onSelect}
            style={{ cursor: 'pointer' }}
        >
            <PersonCard
                name={candidate.name}
                imageSrc={candidate.image}
                imageSize={92}
                subtitle={subtitleText ?? undefined}
                imageFrameClassName={avatarFrameClassName}
                badge={
                    <ElectionStatusBadge
                        electionStatus={candidate.electionStatus}
                    />
                }
            />
        </motion.article>
    )
}

const CandidateCard = memo(CandidateCardImpl)

function DisclaimerCard() {
    return (
        <motion.div
            className={styles.disclaimerCard}
            variants={waveItemVariants}
        >
            <p className={styles.disclaimerItem}>
                <strong>PV Pledge:</strong> The candidates we LOVE.
                <br />
                Candidates invited to take the PV Pledge personify our values
                and represent true political leaders who rise above the rest.
            </p>
            <p className={styles.disclaimerItem}>
                <strong>Endorsement:</strong> The candidates we LIKE.
                <br />
                When a candidate has the endorsed label, it means they align
                with our values and that we are proud to support them.
            </p>
            <p className={styles.disclaimerItem}>
                <strong>Recommendation:</strong> The candidates we TOLERATE.
                <br />
                We will support these candidates, but we won&apos;t pretend they
                are anything more than just better than the Republican. We still
                endorse them, but they tend not to appreciate how...
            </p>
        </motion.div>
    )
}
