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

function buildTargetDate(reference: Date): Date {
    const currentYear = reference.getFullYear()
    const currentYearTarget = new Date(`${currentYear}-03-20T19:00:00-04:00`)

    if (reference.getTime() <= currentYearTarget.getTime()) {
        return currentYearTarget
    }

    return new Date(`${currentYear + 1}-03-20T19:00:00-04:00`)
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

export default function UnitedWeFightPage() {
    const [now, setNow] = useState(() => new Date())
    const targetDate = useMemo(() => buildTargetDate(now), [now])
    const countdown = useMemo(
        () => buildCountdown(targetDate, now),
        [targetDate, now]
    )

    useEffect(() => {
        const ticker = window.setInterval(() => {
            setNow(new Date())
        }, 1000)

        return () => window.clearInterval(ticker)
    }, [])

    return (
        <main className={styles.pageWrap}>
            <section className={styles.banner}>
                <div className={styles.bannerHalftone} aria-hidden="true" />
                <p className={styles.kicker}>Choose Your Fighters</p>
                <h1 className={styles.title}>Something Is Approaching...</h1>

                <div className={styles.ticker} aria-live="polite">
                    <article className={styles.block}>
                        <span key={`days-${countdown.days}`} className={styles.value}>
                            {countdown.days}
                        </span>
                        <span className={styles.label}>Days</span>
                    </article>
                    <article className={styles.block}>
                        <span key={`hours-${countdown.hours}`} className={styles.value}>
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
                        <span className={styles.label}>Minutes</span>
                    </article>
                    <article className={styles.block}>
                        <span
                            key={`seconds-${countdown.seconds}`}
                            className={styles.value}
                        >
                            {countdown.seconds}
                        </span>
                        <span className={styles.label}>Seconds</span>
                    </article>
                </div>

                <p className={styles.status}>
                    {countdown.isExpired
                        ? 'The fight has begun!'
                        : 'Announcement Soon'}
                </p>
            </section>
        </main>
    )
}
