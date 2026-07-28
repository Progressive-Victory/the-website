import { type CandidateConfig } from '../endorsements.data'
import styles from './CandidateDetails.module.css'
import { ImageWithFallback } from '@/components/common'
import { HStack, ZStack } from '@/components/layout'
import { useEffect } from 'react'

interface CandidateDetailsProps {
    candidate: CandidateConfig | null
    onClose: () => void
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
            <HStack
                align="middle"
                gap={0}
                className={styles.container}
                onClick={(e) => e.stopPropagation()}
            >
                <ZStack align="center" className={styles.avatarWrap}>
                    <ImageWithFallback
                        src="/images/endorsement_images/background_blue.png"
                        alt=""
                        width={120}
                        height={120}
                        className={styles.avatarBg}
                    />
                    <ImageWithFallback
                        src={candidate.image}
                        alt={`${candidate.name} profile image`}
                        width={120}
                        height={120}
                        className={styles.avatar}
                    />
                </ZStack>
                <h2 className={styles.name}>{candidate.name}</h2>
                {candidate.state}
                {candidate.electionStatus}
                {candidate.jurisdiction}
                {candidate.primaryElection?.toLocaleDateString()}
                {candidate.generalElection?.toLocaleDateString()}
                {candidate.endorsementDate?.toLocaleDateString()}
                {candidate.endorsementReason}
                {candidate.incumbent ? 'Incumbent' : 'Challenger'}
                {candidate.handle}
                {candidate.handleHref}
                {candidate.bodyText}
                {candidate.websiteHref}
                {candidate.donateHref}
                {candidate.initiativeType}
                {candidate.endorsementType}
                {candidate.showPvMember ? 'PV Member' : 'Not PV Member'}
                {/* {candidate.avatarBackgroundColor} */}
                {/* {candidate.relatedCandidateId} */}
            </HStack>
        </ZStack>
    )
}

//     id: string
//     name: string
//     state: string
//     electionStatus: ElectionStatus
//     jurisdiction?: string
//     primaryElection?: Date
//     generalElection?: Date
//     endorsementDate?: Date
//     endorsementReason?: string
//     incumbent?: boolean

//     handle: string
//     handleHref?: string
//     bodyText: string

//     image: string
//     websiteHref: string
//     donateHref?: string

//     initiativeType: InitiativeType
//     endorsementType: EndorsementType
//     showPvMember: boolean
//     avatarBackgroundColor: AvatarBackgroundColor
//     relatedCandidateId?: string
