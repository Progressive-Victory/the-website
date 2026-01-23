'use client'

import { ENDORSEMENTS, type Endorsement } from './endorsements.data'
import styles from '@/app/endorsements/endorsement.module.css'
import Image from 'next/image'

function formatRaceLine(e: Endorsement) {
    const location = e.district ? ` • ${e.district}` : ` • ${e.state}`
    const stage = e.stage ? ` • ${e.stage}` : ''
    return `${e.office}${location}${stage}`
}

export default function Endorsements() {
    return (
        <div className={styles.page}>
            {ENDORSEMENTS.map((e) => (
                <article key={e.id} className={styles.card}>
                    <div className={styles.cardInner}>
                        <div className={styles.photoWrap}>
                            <Image
                                src={e.imageSrc}
                                alt={e.candidateName}
                                fill
                                sizes="(min-width: 1024px) 160px, 128px"
                                style={{ objectFit: 'cover' }}
                            />
                            <div className={styles.photoOverlay} />
                        </div>

                        <div className={styles.content}>
                            <div className={styles.headerRow}>
                                <div>
                                    <div className={styles.name}>
                                        {e.candidateName}
                                    </div>
                                    <div className={styles.race}>
                                        {formatRaceLine(e)}
                                    </div>
                                </div>

                                {(e.PVMember || e.PvPledge) && (
                                    <div className={styles.badgeWrap}>
                                        {e.PVMember && (
                                            <span
                                                className={styles.badgeMember}
                                            >
                                                PV Member
                                            </span>
                                        )}
                                        {e.PvPledge && (
                                            <span
                                                className={styles.badgePledge}
                                            >
                                                PV Pledge
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={styles.meta}>
                                <span className={styles.date}>
                                    Election: {e.electionDate}
                                </span>
                            </div>

                            {e.quote && (
                                <div className={styles.quote}>{e.quote}</div>
                            )}

                            {e.issues?.length && (
                                <div className={styles.issuesWrap}>
                                    <div className={styles.issuesTitle}>
                                        Primary Issues
                                    </div>
                                    <div className={styles.issuesList}>
                                        {e.issues.map((issue) => (
                                            <span
                                                key={issue}
                                                className={styles.issues}
                                            >
                                                {issue}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </article>
            ))}
        </div>
    )
}
