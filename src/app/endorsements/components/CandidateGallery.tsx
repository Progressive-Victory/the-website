import styles from '../endorsement.module.css'
import { PAST_ELECTION_LABEL } from '../endorsements.constants'
import { type CandidateConfig, type ElectionStatus } from '../endorsements.data'
import {
    galleryLayoutTransition,
    headingVariants,
    waveItemVariants,
    waveListVariants,
} from '../endorsements.motion'
import {
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
import { ImageWithFallback } from '@/components/common'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { type ReactNode, useMemo } from 'react'

interface CandidateGalleryProps {
    filteredCandidates: CandidateConfig[]
    displayMode: GalleryDisplayMode
    sectionMode: SectionGroupingMode
    sectionSortOrder: SectionSortOrder
}

export function CandidateGallery({
    filteredCandidates,
    displayMode,
    sectionMode,
    sectionSortOrder,
}: CandidateGalleryProps) {
    const groupedCandidates = useMemo(() => {
        const map = new Map<string, CandidateConfig[]>()

        for (const candidate of filteredCandidates) {
            const sectionLabel = getSectionLabel(candidate, sectionMode)
            const group = map.get(sectionLabel)
            if (group) {
                group.push(candidate)
            } else {
                map.set(sectionLabel, [candidate])
            }
        }

        return [...map.entries()]
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
    }, [filteredCandidates, sectionMode, sectionSortOrder])

    const orderedFlatCandidates = useMemo(() => {
        return [...filteredCandidates].sort(compareFlatCandidates)
    }, [filteredCandidates])

    const animationKey = `${displayMode}-${sectionMode}-${sectionSortOrder}-${filteredCandidates.length}`

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
                                className={`${styles.sectionHeader} ${styles.flatSectionHeader}`}
                                aria-hidden="true"
                                variants={headingVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <h3 className={styles.sectionTitle}>Spacer</h3>
                                <div className={styles.sectionDivider} />
                            </motion.header>

                            <motion.div
                                layout
                                className={`${styles.finderGrid} ${styles.finderGridLarge}`}
                                transition={galleryLayoutTransition}
                            >
                                {orderedFlatCandidates.map((candidate) => (
                                    <CandidateCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        displayMode={displayMode}
                                        sectionMode={sectionMode}
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
                                        className={
                                            isPastElectionSection
                                                ? `${styles.gallerySection} ${styles.pastElectionSection}`
                                                : styles.gallerySection
                                        }
                                        transition={galleryLayoutTransition}
                                    >
                                        <motion.header
                                            layout="position"
                                            className={
                                                isPastElectionSection
                                                    ? `${styles.sectionHeader} ${styles.centeredSectionHeader}`
                                                    : styles.sectionHeader
                                            }
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
                                                        displayMode={
                                                            displayMode
                                                        }
                                                        sectionMode={
                                                            sectionMode
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

function CandidateCard({
    candidate,
    displayMode,
    sectionMode,
}: {
    candidate: CandidateConfig
    displayMode: GalleryDisplayMode
    sectionMode: SectionGroupingMode
}) {
    const destination = getCandidateDestination(candidate)
    const statusBadgeClassName = getElectionStatusBadgeClassName(
        candidate.electionStatus
    )
    const statusBadgeIcon = getElectionStatusBadgeIcon(candidate.electionStatus)
    const subtitleText = getCandidateSubtitleText(
        candidate,
        displayMode,
        sectionMode
    )

    const tileContent = (
        <>
            <div className={styles.tileImageFrame}>
                <CandidateAvatar
                    imageSrc={candidate.image}
                    name={candidate.name}
                    size={92}
                    className={styles.tileImage}
                />
                {statusBadgeClassName && (
                    <span
                        className={`${styles.tileStatusBadge} ${statusBadgeClassName}`}
                        aria-label={`Election status: ${candidate.electionStatus}`}
                    >
                        <span aria-hidden="true">{statusBadgeIcon}</span>
                        <span
                            className={styles.tileStatusTooltip}
                            aria-hidden="true"
                        >
                            {candidate.electionStatus}
                        </span>
                    </span>
                )}
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

    if (!destination) {
        return (
            <motion.article
                layout
                className={styles.candidateTile}
                transition={galleryLayoutTransition}
                variants={waveItemVariants}
                whileHover={{ y: -4, scale: 1.03 }}
            >
                {tileContent}
            </motion.article>
        )
    }

    return (
        <motion.a
            layout
            href={destination}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.candidateTile}
            aria-label={`View details for ${candidate.name}`}
            transition={galleryLayoutTransition}
            variants={waveItemVariants}
            whileHover={{ y: -4, scale: 1.03 }}
        >
            {tileContent}
        </motion.a>
    )
}

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

function getCandidateDestination(
    candidate: CandidateConfig
): string | undefined {
    const learnMoreHref = candidate.learnMoreHref.trim()
    if (learnMoreHref) return learnMoreHref

    const handleHref = candidate.handleHref?.trim()
    if (!handleHref) return undefined

    return handleHref
}

function getElectionStatusBadgeClassName(
    electionStatus: ElectionStatus
): string | null {
    if (electionStatus === 'Won Primary') {
        return styles.tileStatusWonPrimary
    }

    if (electionStatus === 'Elected') {
        return styles.tileStatusElected
    }

    if (
        electionStatus === 'Lost Primary' ||
        electionStatus === 'Lost General Election'
    ) {
        return styles.tileStatusLost
    }

    if (electionStatus === 'Dropped Out') {
        return styles.tileStatusDroppedOut
    }

    return null
}

function getElectionStatusBadgeIcon(electionStatus: ElectionStatus): ReactNode {
    if (electionStatus === 'Won Primary') {
        return (
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path
                    d="M4.5 10.5l3.5 3.5 7-7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        )
    }

    if (electionStatus === 'Elected') {
        return '★'
    }

    if (
        electionStatus === 'Lost Primary' ||
        electionStatus === 'Lost General Election'
    ) {
        return '✕'
    }

    if (electionStatus === 'Dropped Out') {
        return '−'
    }

    return null
}
