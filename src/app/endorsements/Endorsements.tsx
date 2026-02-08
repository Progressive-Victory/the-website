'use client'

import { CANDIDATES, type CandidateConfig } from './endorsements.data'
import styles from '@/app/endorsements/endorsement.module.css'
import { Message } from '@/components/common'
import { BaseButton } from '@/components/common/buttons/Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import React, { useEffect, useMemo, useState } from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

type FilterType = 'national' | 'state' | 'pledge' | 'member' | 'all'

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
    const [filter, setFilter] = useState<FilterType>('all')
    const [hasAnimatedIn, setHasAnimatedIn] = useState(false)
    useEffect(() => {
        setHasAnimatedIn(true)
    }, [])

    const sortedCandidates = useMemo(() => {
        return [...CANDIDATES].sort((a, b) => {
            const aTime = a.electionDate?.getTime() ?? Infinity
            const bTime = b.electionDate?.getTime() ?? Infinity
            return aTime - bTime
        })
    }, [])

    const filteredCandidates = useMemo(() => {
        return sortedCandidates.filter((candidate) => {
            if (filter === 'all') return true
            if (filter === 'national')
                return candidate.initiativeType === 'national'
            if (filter === 'state') return candidate.initiativeType === 'state'
            if (filter === 'pledge') return candidate.showPvPledge
            if (filter === 'member') return candidate.showPvMember
            return true
        })
    }, [sortedCandidates, filter])

    return (
        <div className={styles.hero}>
            <div
                style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                }}
            >
                <BaseButton
                    label="National Initiative"
                    onClick={() => setFilter('national')}
                    className={
                        filter === 'national'
                            ? styles.filterButtonActive
                            : buttonStyles.minimalProminent
                    }
                />

                <BaseButton
                    label="State Initiative"
                    onClick={() => setFilter('state')}
                    className={
                        filter === 'state'
                            ? styles.filterButtonActive
                            : buttonStyles.minimalProminent
                    }
                />

                <BaseButton
                    label="PV Pledge"
                    onClick={() => setFilter('pledge')}
                    className={
                        filter === 'pledge'
                            ? styles.filterButtonActive
                            : buttonStyles.minimalProminent
                    }
                />

                <BaseButton
                    label="PV Member"
                    onClick={() => setFilter('member')}
                    className={
                        filter === 'member'
                            ? styles.filterButtonActive
                            : buttonStyles.minimalProminent
                    }
                />

                <BaseButton
                    label="Show All"
                    onClick={() => setFilter('all')}
                    className={
                        filter === 'all'
                            ? styles.filterButtonActive
                            : buttonStyles.minimalProminent
                    }
                />
            </div>

            <div className={styles.messages}>
                {filteredCandidates.map((candidate) => (
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
                            initial: hasAnimatedIn
                                ? false
                                : { rotate: 20, y: 50 },
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
