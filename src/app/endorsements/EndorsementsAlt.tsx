'use client'

import { CANDIDATES, type CandidateConfig } from './endorsements.data'
import styles from '@/app/endorsements/endorsement.module.css'
import { Message } from '@/components/common'
import { BaseButton } from '@/components/common/buttons/Button'
import React, { useMemo } from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

function CandidateButtons({ candidate }: { candidate: CandidateConfig }) {
    const showAny =
        candidate.initiativeType !== undefined ||
        candidate.showPvPledge ||
        candidate.showPvMember

    if (!showAny) return null

    const initiativeClassName =
        candidate.initiativeType === 'state'
            ? styles.stateInitative
            : styles.primary

    return (
        <div className={styles.container}>
            {candidate.initiativeType === 'national' && (
                <BaseButton
                    label="National Initiative"
                    className={initiativeClassName}
                />
            )}

            {candidate.initiativeType === 'state' && (
                <BaseButton
                    label="State Initiative"
                    className={initiativeClassName}
                />
            )}

            {candidate.showPvPledge && (
                <BaseButton label="PV Pledge" className={styles.tertiary} />
            )}

            {candidate.showPvMember && (
                <BaseButton label="PV Member" className={styles.secondary} />
            )}
        </div>
    )
}
export function EndorsementAlt() {
    const sortedCandidates = useMemo(() => {
        return [...CANDIDATES].sort((a, b) => {
            const aTime = a.electionDate?.getTime() ?? Infinity
            const bTime = b.electionDate?.getTime() ?? Infinity
            return aTime - bTime
        })
    }, [])

    return (
        <div className={styles.hero}>
            <div className={styles.messages}>
                {sortedCandidates.map((candidate) => (
                    <Message
                        key={candidate.id}
                        className={styles.messageCard}
                        username="Progressive Victory"
                        nameColor="red"
                        text={candidate.messageText}
                        image={candidate.image}
                        avatar={avatarImage}
                        avatarRounded={false}
                        motionProps={{
                            initial: { rotate: 20, y: 50 },
                            animate: { rotate: 0, y: 0 },
                            transition: { delay: 0.15, duration: 0.65 },
                        }}
                        tiltProps={{
                            className: styles.orderLastXlFirst,
                            disabled: false,
                            strength: { amount: 1 },
                            rotation: { max: 10, z: 0 },
                            scale: { hover: 1.025 },
                        }}
                        botDivider={true}
                        ctaLabel="Learn More"
                        ctaHref={candidate.learnMoreHref}
                        botLeftContent={
                            <CandidateButtons candidate={candidate} />
                        }
                        showEllipsis={false}
                    />
                ))}
            </div>
        </div>
    )
}
