'use client'

import { CANDIDATES, type CandidateConfig } from './endorsements.data'
import styles from '@/app/endorsements/endorsement.module.css'
import { Message } from '@/components/common'
import { BaseButton } from '@/components/common/buttons/Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import cardStyles from '@/components/common/twitter_card_element/Card.module.css'
import React, { useMemo, useState } from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

type FilterType = 'national' | 'state' | 'pledge' | 'member' | 'all'

export function Endorsements() {
    const [filter, setFilter] = useState<FilterType>('all')

    const sortedCandidates = useMemo(() => {
        return [...CANDIDATES].sort((a, b) => {
            const aTime = a.electionDate?.getTime() ?? Infinity
            const bTime = b.electionDate?.getTime() ?? Infinity
            return aTime - bTime
        })
    }, [])

    const filteredCandidates = useMemo(() => {
        const predicates: Record<FilterType, (c: CandidateConfig) => boolean> =
            {
                all: () => true,
                national: (c) => c.initiativeType === 'national',
                state: (c) => c.initiativeType === 'state',
                pledge: (c) => c.showPvPledge,
                member: (c) => c.showPvMember,
            }

        return sortedCandidates.filter(predicates[filter])
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
                {filteredCandidates.map((candidate) => {
                    const handle = candidate.handle.startsWith('@')
                        ? candidate.handle
                        : `@${candidate.handle}`

                    const body = (
                        <>
                            {candidate.handleHref ? (
                                <a
                                    href={candidate.handleHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cardStyles.textHighlight}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {handle}
                                </a>
                            ) : (
                                <span className={cardStyles.textHighlight}>
                                    {handle}
                                </span>
                            )}

                            <span className={cardStyles.textPart}>
                                {candidate.bodyText}
                            </span>
                        </>
                    )

                    return (
                        <Message
                            key={candidate.id}
                            className={styles.messageCard}
                            username="Progressive Victory"
                            nameColor="red"
                            body={body}
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
                            ctaTarget="_blank"
                            ctaRel="noopener noreferrer"
                            botLeftContent={
                                <CandidateButtons candidate={candidate} />
                            }
                            showEllipsis={false}
                        />
                    )
                })}
            </div>
        </div>
    )
}

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
