import { type CandidateConfig } from '../endorsements.data'
import styles from './CandidateDetails.module.css'
import { ElectionStatusBadge } from './ElectionStatusBadge'
import { ImageWithFallback } from '@/components/common'
import { HStack, VStack, ZStack } from '@/components/layout'
import { useEffect } from 'react'
import {
    FaDonate,
    FaGlobe,
    FaTwitter,
    FaInstagram,
    FaFacebook,
    FaYoutube,
    FaTiktok,
    FaLink,
} from 'react-icons/fa'

interface CandidateDetailsProps {
    candidate: CandidateConfig | null
    onClose: () => void
}

interface CandidateQuoteProps {
    handle: string
    handleHref?: string
    bodyText: string
}

function getSocialIcon(url: string) {
    if (url.includes('twitter.com') || url.includes('x.com'))
        return <FaTwitter />
    if (url.includes('instagram.com')) return <FaInstagram />
    if (url.includes('facebook.com')) return <FaFacebook />
    if (url.includes('youtube.com')) return <FaYoutube />
    if (url.includes('tiktok.com')) return <FaTiktok />
    return <FaLink />
}

function getSocialPlatformName(url: string) {
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter'
    if (url.includes('instagram.com')) return 'Instagram'
    if (url.includes('facebook.com')) return 'Facebook'
    if (url.includes('youtube.com')) return 'YouTube'
    if (url.includes('tiktok.com')) return 'TikTok'
    return 'Social'
}

function CandidateQuote({ handle, handleHref, bodyText }: CandidateQuoteProps) {
    return (
        <p className={styles.quote}>
            {handleHref ? (
                <a
                    href={handleHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.handleLink}
                >
                    @{handle}
                </a>
            ) : (
                <span className={styles.handleLink}>{handle}</span>
            )}{' '}
            {bodyText}
        </p>
    )
}

export function CandidateDetails({
    candidate,
    onClose,
}: CandidateDetailsProps) {
    useEffect(() => {
        if (!candidate) return
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [candidate])

    if (!candidate) return null

    return (
        <ZStack align="center" className={styles.background} onClick={onClose}>
            <VStack
                align="left"
                gap={1.5}
                className={styles.container}
                onClick={(e) => e.stopPropagation()}
            >
                <HStack align="top" gap={1.25} className={styles.header}>
                    <ZStack align="center" className={styles.avatarWrap}>
                        <ImageWithFallback
                            src="/images/endorsement_images/background_blue.png"
                            alt=""
                            width={100}
                            height={100}
                            className={styles.avatarBg}
                        />
                        <ImageWithFallback
                            src={candidate.image}
                            alt={`${candidate.name} profile image`}
                            width={100}
                            height={100}
                            className={styles.avatar}
                        />
                    </ZStack>
                    <VStack align="left" gap={0.25}>
                        <HStack
                            align="center"
                            gap={0.5}
                            className={styles.nameRow}
                        >
                            <h1 className={styles.name}>{candidate.name}</h1>
                            <ElectionStatusBadge
                                electionStatus={candidate.electionStatus}
                            />
                        </HStack>
                        <HStack
                            align="center"
                            gap={0.5}
                            className={styles.tagRow}
                        >
                            <span className={styles.badge}>
                                {candidate.endorsementType}
                            </span>
                            {candidate.initiativeType === 'national' && (
                                <span className={styles.candidateTag}>
                                    National Initiative
                                </span>
                            )}
                            {candidate.initiativeType === 'state' && (
                                <span className={styles.candidateTag}>
                                    State Initiative
                                </span>
                            )}
                            {candidate.showPvMember && (
                                <span className={styles.candidateTag}>
                                    PV Member
                                </span>
                            )}
                        </HStack>
                        <HStack
                            align="center"
                            gap={0.5}
                            className={styles.socialRow}
                        >
                            {candidate.donateHref && (
                                <a
                                    href={candidate.donateHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialLink}
                                    title="Donate"
                                >
                                    <FaDonate />
                                </a>
                            )}
                            {candidate.websiteHref && (
                                <a
                                    href={candidate.websiteHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialLink}
                                    title="Website"
                                >
                                    <FaGlobe />
                                </a>
                            )}
                            {candidate.handleHref && (
                                <a
                                    href={candidate.handleHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialLink}
                                    title={getSocialPlatformName(
                                        candidate.handleHref
                                    )}
                                >
                                    {getSocialIcon(candidate.handleHref)}
                                </a>
                            )}
                        </HStack>
                    </VStack>
                </HStack>

                <VStack align="left" gap={0.75} className={styles.quoteBox}>
                    <HStack
                        align="center"
                        gap={1.25}
                        className={styles.infoRow}
                    >
                        <VStack
                            align="left"
                            gap={0}
                            className={styles.infoItem}
                        >
                            <span className={styles.infoLabel}>State</span>
                            <span className={styles.infoValue}>
                                {candidate.state}
                            </span>
                        </VStack>
                        {candidate.jurisdiction && (
                            <VStack
                                align="left"
                                gap={0}
                                className={styles.infoItem}
                            >
                                <span className={styles.infoLabel}>
                                    Jurisdiction
                                </span>
                                <span className={styles.infoValue}>
                                    {candidate.jurisdiction}
                                </span>
                            </VStack>
                        )}
                        {candidate.primaryElection && (
                            <VStack
                                align="left"
                                gap={0}
                                className={styles.infoItem}
                            >
                                <span className={styles.infoLabel}>
                                    Primary
                                </span>
                                <span className={styles.infoValue}>
                                    {candidate.primaryElection.toLocaleDateString()}
                                </span>
                            </VStack>
                        )}
                        {candidate.generalElection && (
                            <VStack
                                align="left"
                                gap={0}
                                className={styles.infoItem}
                            >
                                <span className={styles.infoLabel}>
                                    General
                                </span>
                                <span className={styles.infoValue}>
                                    {candidate.generalElection.toLocaleDateString()}
                                </span>
                            </VStack>
                        )}
                    </HStack>
                    <hr className={styles.divider} />
                    <CandidateQuote
                        handle={candidate.handle}
                        handleHref={candidate.handleHref}
                        bodyText={candidate.bodyText}
                    />
                </VStack>
            </VStack>
        </ZStack>
    )
}
