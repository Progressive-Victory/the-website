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
    getCandidateSubtitleText,
    getSectionLabel,
    sortSectionCandidates,
} from '../endorsements.utils'
import { ElectionStatusBadge } from './ElectionStatusBadge'
import { ImageWithFallback } from '@/components/common'
import { cn } from '@/util'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { memo } from 'react'

//TODO break out each candidate button into its own component
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
                                    className={styles.sectionDivider}
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
                        {groupedCandidates.map(
                            ([sectionLabel, sectionCandidates]) => {
                                const isPastElectionSection =
                                    sectionLabel === PAST_ELECTION_LABEL

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
                                                            styles.sectionDivider
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
    const subtitleText = getCandidateSubtitleText(candidate)
    const avatarFrameClassName =
        candidate.avatarBackgroundColor === 'blue'
            ? styles.tileImageFramePledge
            : styles.tileImageFrameNoPledge

    const tileContent = (
        <>
            <div className={cn(styles.tileImageFrame, avatarFrameClassName)}>
                <CandidateAvatar
                    imageSrc={candidate.image}
                    name={candidate.name}
                    size={92}
                    className={styles.tileImage}
                />
                <ElectionStatusBadge
                    electionStatus={candidate.electionStatus}
                />
            </div>
            <div className={styles.tileMeta}>
                <div className={styles.tileNameRow}>
                    <p className={styles.tileName}>{candidate.name}</p>
                </div>
                {subtitleText && (
                    <p className={styles.tileDate}>{subtitleText}</p>
                )}
            </div>
        </>
    )

    return (
        <motion.article
            layout
            className={styles.candidateTile}
            transition={galleryLayoutTransition}
            variants={waveItemVariants}
            whileHover={{ y: -4, scale: 1.03 }}
            onClick={onSelect}
            style={{ cursor: 'pointer' }}
        >
            {tileContent}
        </motion.article>
    )
}

const CandidateCard = memo(CandidateCardImpl)

function CandidateAvatar({
    imageSrc,
    name,
    size,
    className,
}: {
    imageSrc: string
    name: string
    size: number
    className?: string
}) {
    return (
        <ImageWithFallback
            src={imageSrc}
            alt={`${name} profile image`}
            width={size}
            height={size}
            className={className}
        />
    )
}
