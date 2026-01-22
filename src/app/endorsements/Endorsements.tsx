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
            <div className={styles.list}>
                {ENDORSEMENTS.map((e) => (
                    <article key={e.id} className={styles.card}>
                        <div className={styles.photoWrap}>
                            <Image
                                src={
                                    e.imageSrc ??
                                    '/images/placeholder-candidate.png'
                                }
                                alt={e.imageAlt ?? e.candidateName}
                                fill
                                sizes="(min-width: 768px) 160px, 96px"
                                className={styles.photo}
                            />
                        </div>

                        <div className={styles.body}>
                            <div className={styles.header}>
                                <div className={styles.title}>
                                    <p className={styles.name}>
                                        {e.candidateName}
                                    </p>
                                    <p className={styles.race}>
                                        {formatRaceLine(e)}
                                    </p>
                                </div>

                                {(e.PVMember || e.PvPledge) && (
                                    <div className={styles.badges}>
                                        {e.PVMember && (
                                            <span
                                                className={`${styles.badge} ${styles.badgeMember}`}
                                            >
                                                PV Member
                                            </span>
                                        )}
                                        {e.PvPledge && (
                                            <span
                                                className={`${styles.badge} ${styles.badgePledge}`}
                                            >
                                                PV Pledge
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={styles.meta}>
                                <p className={styles.date}>
                                    Election: {e.electionDate}
                                </p>
                            </div>

                            <p className={styles.summary}>{e.quote}</p>

                            {e.issues?.length ? (
                                <div className={styles.issues}>
                                    <p className={styles.issuesLabel}>
                                        Primary Issues
                                    </p>
                                    <div className={styles.tags}>
                                        {e.issues.map((issue) => (
                                            <span
                                                key={issue}
                                                className={styles.tag}
                                            >
                                                {issue}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}
