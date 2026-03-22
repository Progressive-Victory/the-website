'use client'

import styles from './page.module.css'
import { useEffect, useMemo, useState } from 'react'

interface CountdownParts {
    days: string
    hours: string
    minutes: string
    seconds: string
    isExpired: boolean
}

function buildCountdown(target: Date, now: Date): CountdownParts {
    const distance = target.getTime() - now.getTime()

    if (distance <= 0) {
        return {
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00',
            isExpired: true,
        }
    }

    const totalSeconds = Math.floor(distance / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return {
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isExpired: false,
    }
}

export default function ChooseYourFighterPage() {
    const [now, setNow] = useState(() => new Date())
    const countdown = useMemo(
        () => buildCountdown(new Date('2026-03-28T18:00:00-04:00'), now),
        [now]
    )

    useEffect(() => {
        const ticker = window.setInterval(() => {
            setNow(new Date())
        }, 1000)

        return () => window.clearInterval(ticker)
    }, [])

    return (
        <main className={styles.pageWrap}>
            <div className={styles.tv}>
                <div className={styles.tvScreenBezel}>
                    <div className={styles.tvScreen}>
                        <section className={styles.banner}>
                            <div
                                className={styles.bannerHalftone}
                                aria-hidden="true"
                            />
                            <p className={styles.kicker}>
                                Choose Your Fighters
                            </p>
                            <h1 className={styles.title}>
                                Something Is Approaching...
                            </h1>

                            <div className={styles.ticker} aria-live="polite">
                                <article className={styles.block}>
                                    <span
                                        key={`days-${countdown.days}`}
                                        className={styles.value}
                                    >
                                        {countdown.days}
                                    </span>
                                    <span className={styles.label}>Days</span>
                                </article>
                                <article className={styles.block}>
                                    <span
                                        key={`hours-${countdown.hours}`}
                                        className={styles.value}
                                    >
                                        {countdown.hours}
                                    </span>
                                    <span className={styles.label}>Hours</span>
                                </article>
                                <article className={styles.block}>
                                    <span
                                        key={`minutes-${countdown.minutes}`}
                                        className={styles.value}
                                    >
                                        {countdown.minutes}
                                    </span>
                                    <span className={styles.label}>
                                        Minutes
                                    </span>
                                </article>
                                <article className={styles.block}>
                                    <span
                                        key={`seconds-${countdown.seconds}`}
                                        className={styles.value}
                                    >
                                        {countdown.seconds}
                                    </span>
                                    <span className={styles.label}>
                                        Seconds
                                    </span>
                                </article>
                            </div>

                            <p className={styles.status}>
                                {countdown.isExpired ? (
                                    'The fight has begun!'
                                ) : (
                                    <a
                                        href="https://www.mobilize.us/progressivevictory/event/925367/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.statusLink}
                                    >
                                        Click Here to sign up!
                                    </a>
                                )}
                            </p>
                        </section>
                        <div className={styles.scanlines} aria-hidden="true" />
                        <div
                            className={styles.screenReflection}
                            aria-hidden="true"
                        />
                        <div className={styles.rollBand} aria-hidden="true" />
                        <div
                            className={styles.phosphorFringe}
                            aria-hidden="true"
                        />
                    </div>
                </div>
                <div className={styles.tvLowerFace} aria-hidden="true">
                    <div className={styles.tvSpeakerGrille} />
                    <div className={styles.tvRightControls}>
                        <span className={styles.tvBrand}>CYF</span>
                        <div className={styles.tvTunerKnob} />
                        <div className={styles.tvPowerLight} />
                    </div>
                </div>
            </div>
            <div className={styles.tvFeet} aria-hidden="true" />
        </main>
    )
}
