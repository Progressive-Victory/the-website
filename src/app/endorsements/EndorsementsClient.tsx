// EndorsementsClient.tsx
'use client'

import styles from '@/app/styles/pages/EndorsementsPage.module.css'
import { ContentPageFrame, ContentSection } from '@/components/ContentSections'
import type React from 'react'
import { useMemo, useState } from 'react'

// EndorsementsClient.tsx

type EndorsementStage = 'Primary' | 'General' | 'Special' | 'Local'

type EndorsementOffice =
    | 'President'
    | 'US Senate'
    | 'US House'
    | 'Governor'
    | 'Statewide'
    | 'State Legislature'
    | 'Mayor'
    | 'Local'

type EndorsementStatus = 'Endorsed' | 'Recommended' | 'Watchlist'

type EndorsementProgram =
    | 'PV Endorsed'
    | 'National Initiative'
    | 'State Initiative'
    | 'PV Pledge'

type ElectionMonth =
    | 'January'
    | 'February'
    | 'March'
    | 'April'
    | 'May'
    | 'June'
    | 'July'
    | 'August'
    | 'September'
    | 'October'
    | 'November'
    | 'December'

interface Endorsement {
    id: string
    candidateName: string
    office: EndorsementOffice
    state: string
    district?: string
    stage: EndorsementStage
    status: EndorsementStatus
    programs?: EndorsementProgram[]
    headline: string
    description: string
    issues: string[]
    electionDate: string // ISO: "YYYY-MM-DD"
    links?: {
        website?: string
        donate?: string
        volunteer?: string
    }
}

const endorsementsSeed: Endorsement[] = [
    {
        id: 'demo-1',
        candidateName: 'Candidate Name',
        office: 'US House',
        state: 'NY',
        district: 'NY-00',
        stage: 'Primary',
        status: 'Endorsed',
        programs: ['PV Endorsed', 'National Initiative', 'PV Pledge'],
        headline: 'A grassroots fighter for working people.',
        description:
            'Short summary of why PV endorsed them—center contrast, coalition, and the plan to win. Keep it tight (2–3 lines).',
        issues: ['Labor', 'Housing', 'Healthcare', 'Climate'],
        electionDate: '2026-06-23',
        links: { website: '#', donate: '#', volunteer: '#' },
    },
    {
        id: 'demo-2',
        candidateName: 'Candidate Name',
        office: 'US Senate',
        state: 'PA',
        stage: 'General',
        status: 'Recommended',
        programs: ['State Initiative'],
        headline: 'Pro-union, pro-democracy, built for the state.',
        description:
            'Add details about alignment with PV priorities and a proven organizing path. Mention local credibility and turnout strategy.',
        issues: ['Union Jobs', 'Public Schools', 'Voting Rights'],
        electionDate: '2026-11-03',
        links: { website: '#', volunteer: '#' },
    },
    {
        id: 'demo-3',
        candidateName: 'Candidate Name',
        office: 'Mayor',
        state: 'MI',
        stage: 'Local',
        status: 'Watchlist',
        programs: ['PV Pledge'],
        headline: 'Early-stage race—monitoring field & viability.',
        description:
            'Use Watchlist for “not yet endorsed” but promising candidates. Note what PV needs to see: consolidation, fundraising, field plan, etc.',
        issues: ['Transit', 'Public Safety', 'Housing'],
        electionDate: '2026-08-04',
        links: { website: '#' },
    },
    {
        id: 'demo-4',
        candidateName: 'Candidate Name',
        office: 'Governor',
        state: 'WI',
        stage: 'Primary',
        status: 'Endorsed',
        programs: ['PV Endorsed', 'National Initiative'],
        headline: 'Built for turnout: union halls to campus gates.',
        description:
            'Placeholder copy emphasizing coalition-building and a disciplined field program with measurable targets.',
        issues: ['Labor', 'Healthcare', 'Reproductive Rights'],
        electionDate: '2026-08-11',
        links: { website: '#', donate: '#', volunteer: '#' },
    },
    {
        id: 'demo-5',
        candidateName: 'Candidate Name',
        office: 'State Legislature',
        state: 'AZ',
        district: 'HD-00',
        stage: 'Primary',
        status: 'Recommended',
        programs: ['State Initiative', 'PV Pledge'],
        headline: 'Neighborhood credibility + a plan to govern.',
        description:
            'Placeholder copy about winning the persuasion universe and protecting the margin with field discipline.',
        issues: ['Housing', 'Public Schools', 'Water'],
        electionDate: '2026-08-04',
        links: { website: '#', volunteer: '#' },
    },
    {
        id: 'demo-6',
        candidateName: 'Candidate Name',
        office: 'US House',
        state: 'CA',
        district: 'CA-00',
        stage: 'Primary',
        status: 'Watchlist',
        programs: ['National Initiative'],
        headline: 'High-upside race—tracking consolidation + spend.',
        description:
            'Placeholder copy: PV is monitoring the field and waiting for clarity on the best lane to win.',
        issues: ['Climate', 'Housing', 'Healthcare'],
        electionDate: '2026-03-03',
        links: { website: '#' },
    },
    {
        id: 'demo-7',
        candidateName: 'Candidate Name',
        office: 'Mayor',
        state: 'TX',
        stage: 'Local',
        status: 'Recommended',
        programs: ['PV Pledge'],
        headline: 'Popular locally, ready to scale citywide.',
        description:
            'Placeholder copy about strengthening public services and delivering tangible wins with competent management.',
        issues: ['Transit', 'Public Safety', 'City Services'],
        electionDate: '2026-05-02',
        links: { website: '#', donate: '#', volunteer: '#' },
    },
    {
        id: 'demo-8',
        candidateName: 'Candidate Name',
        office: 'US House',
        state: 'NC',
        district: 'NC-00',
        stage: 'General',
        status: 'Endorsed',
        programs: ['PV Endorsed', 'National Initiative', 'State Initiative'],
        headline: 'Frontline race with a real path to victory.',
        description:
            'Placeholder copy highlighting message discipline, volunteer scalability, and coalition math.',
        issues: ['Voting Rights', 'Healthcare', 'Jobs'],
        electionDate: '2026-11-03',
        links: { website: '#', donate: '#', volunteer: '#' },
    },
    {
        id: 'demo-9',
        candidateName: 'Candidate Name',
        office: 'Statewide',
        state: 'GA',
        stage: 'Primary',
        status: 'Recommended',
        programs: ['State Initiative'],
        headline: 'The strongest messenger for a growing coalition.',
        description:
            'Placeholder copy about persuasion targets and strengthening rural + suburban margins.',
        issues: ['Public Schools', 'Broadband', 'Healthcare'],
        electionDate: '2026-05-19',
        links: { website: '#', volunteer: '#' },
    },
    {
        id: 'demo-10',
        candidateName: 'Candidate Name',
        office: 'Local',
        state: 'IL',
        stage: 'Local',
        status: 'Watchlist',
        programs: ['PV Pledge'],
        headline: 'Local race—monitoring filing + field operation.',
        description:
            'Placeholder copy about looking for evidence of a durable volunteer pipeline and strong local partners.',
        issues: ['Housing', 'Public Safety', 'Public Health'],
        electionDate: '2026-04-07',
        links: { website: '#' },
    },
]

function uniq<T>(arr: T[]) {
    return Array.from(new Set(arr))
}

function monthNameFromISO(dateISO: string): ElectionMonth {
    const monthIndex = Number(dateISO.slice(5, 7)) - 1
    const months: ElectionMonth[] = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ]
    return months[Math.min(Math.max(monthIndex, 0), 11)]
}

function formatElectionDate(dateISO: string): string {
    const y = Number(dateISO.slice(0, 4))
    const m = Number(dateISO.slice(5, 7)) - 1
    const d = Number(dateISO.slice(8, 10))
    const dt = new Date(Date.UTC(y, m, d))
    return dt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    })
}

function Badge({
    children,
    tone,
}: {
    children: React.ReactNode
    tone: 'red' | 'blue' | 'neutral'
}) {
    const className =
        tone === 'red'
            ? styles.badgeRed
            : tone === 'blue'
              ? styles.badgeBlue
              : styles.badgeNeutral

    return <span className={`${styles.badge} ${className}`}>{children}</span>
}

function Chip({
    active,
    label,
    onClick,
}: {
    active: boolean
    label: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            className={`${styles.chip} ${active ? styles.chipActive : ''}`}
            onClick={onClick}
        >
            {label}
        </button>
    )
}

export default function EndorsementsClient() {
    const [query, setQuery] = useState('')
    const [office, setOffice] = useState<EndorsementOffice | 'All'>('All')
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    const [state, setState] = useState<string | 'All'>('All')
    const [stage, setStage] = useState<EndorsementStage | 'All'>('All')
    const [month, setMonth] = useState<ElectionMonth | 'All'>('All')

    const data = endorsementsSeed

    const offices = useMemo(
        () => ['All', ...uniq(data.map((d) => d.office))] as const,
        [data]
    )
    const states = useMemo(
        () => ['All', ...uniq(data.map((d) => d.state)).sort()] as const,
        [data]
    )
    const stages = useMemo(
        () => ['All', ...uniq(data.map((d) => d.stage))] as const,
        [data]
    )
    const months = useMemo(() => {
        const monthSet = uniq(data.map((d) => monthNameFromISO(d.electionDate)))
        const order: ElectionMonth[] = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ]
        const sorted = order.filter((m) => monthSet.includes(m))
        return ['All', ...sorted] as const
    }, [data])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()

        return data.filter((d) => {
            const dMonth = monthNameFromISO(d.electionDate)

            const matchesQuery =
                !q ||
                d.candidateName.toLowerCase().includes(q) ||
                d.office.toLowerCase().includes(q) ||
                d.state.toLowerCase().includes(q) ||
                (d.district ?? '').toLowerCase().includes(q) ||
                d.issues.some((i) => i.toLowerCase().includes(q)) ||
                (d.programs ?? []).some((p) => p.toLowerCase().includes(q)) ||
                d.electionDate.includes(q) ||
                formatElectionDate(d.electionDate).toLowerCase().includes(q) ||
                dMonth.toLowerCase().includes(q)

            const matchesOffice = office === 'All' || d.office === office
            const matchesState = state === 'All' || d.state === state
            const matchesStage = stage === 'All' || d.stage === stage
            const matchesMonth = month === 'All' || dMonth === month

            return (
                matchesQuery &&
                matchesOffice &&
                matchesState &&
                matchesStage &&
                matchesMonth
            )
        })
    }, [data, query, office, state, stage, month])

    return (
        <ContentPageFrame>
            {/* HERO */}
            <div className={styles.hero}>
                <div className={styles.flipbook} aria-hidden="true">
                    <div className={styles.flipbookFrame} />
                    <div className={styles.usSilhouette} />
                    <div className={styles.flipbookScanlines} />
                </div>

                <div className={styles.heroTopline}>
                    <span className={styles.ribbon}>2026</span>
                    <span className={styles.sparkline} />
                    <span className={styles.heroKicker}>
                        Progressive Victory Candidate Endorsements
                    </span>
                </div>

                <h1 className={styles.heroTitle}>
                    We back candidates who can{' '}
                    <span className={styles.heroEmphasis}>win</span> and{' '}
                    <span className={styles.heroEmphasis}>deliver</span>.
                </h1>

                <p className={styles.heroBody}>
                    Endorsements are built from values alignment, field
                    intelligence, and a hard-nosed plan for turnout. These are
                    the races where PV is putting community power to work.
                </p>

                <div className={styles.heroBadges}>
                    <Badge tone="red">PV Endorsed</Badge>
                    <Badge tone="red">National Initiative</Badge>
                    <Badge tone="red">State Initiative</Badge>
                    <Badge tone="red">PV Pledge</Badge>
                    <Badge tone="blue">PV Recommended</Badge>
                    <Badge tone="neutral">Watchlist</Badge>
                </div>

                <div className={styles.heroActions}>
                    <a className={styles.primaryCta} href="/volunteer">
                        Join the ground game
                    </a>
                    <a className={styles.secondaryCta} href="/donate">
                        Fund the fight
                    </a>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className={styles.filterBar}>
                <div className={styles.searchWrap}>
                    <label className={styles.label} htmlFor="endorsementSearch">
                        Search
                    </label>
                    <input
                        id="endorsementSearch"
                        className={styles.search}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search candidates, state, office, issues, initiatives, date…"
                    />
                </div>

                <div className={styles.filterGroup}>
                    <div className={styles.filterBlock}>
                        <div className={styles.label}>Office</div>
                        <div className={styles.chips}>
                            {offices.map((o) => (
                                <Chip
                                    key={o}
                                    label={o}
                                    active={office === o}
                                    onClick={() => setOffice(o as never)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterBlock}>
                        <div className={styles.label}>State</div>
                        <div className={styles.chips}>
                            {states.map((s) => (
                                <Chip
                                    key={s}
                                    label={s}
                                    active={state === s}
                                    onClick={() => setState(s)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterBlock}>
                        <div className={styles.label}>Stage</div>
                        <div className={styles.chips}>
                            {stages.map((st) => (
                                <Chip
                                    key={st}
                                    label={st}
                                    active={stage === st}
                                    onClick={() => setStage(st as never)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterBlock}>
                        <div className={styles.label}>Month</div>
                        <div className={styles.chips}>
                            {months.map((m) => (
                                <Chip
                                    key={m}
                                    label={m}
                                    active={month === m}
                                    onClick={() => setMonth(m as never)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* GRID */}
            <ContentSection title="ENDORSEMENTS">
                <div className={styles.resultsMeta}>
                    <span className={styles.count}>{filtered.length}</span>{' '}
                    results
                    {query.trim() ? (
                        <span className={styles.queryPill}>
                            Query: “{query.trim()}”
                        </span>
                    ) : null}
                </div>

                <div className={styles.grid}>
                    {filtered.map((d) => {
                        const location = d.district
                            ? `${d.state} • ${d.district}`
                            : d.state

                        const statusTone: 'red' | 'blue' | 'neutral' =
                            d.status === 'Endorsed'
                                ? 'red'
                                : d.status === 'Recommended'
                                  ? 'blue'
                                  : 'neutral'

                        const electionLabel = formatElectionDate(d.electionDate)

                        return (
                            <article key={d.id} className={styles.card}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardBadgeRow}>
                                        {(d.programs ?? []).map((p) => (
                                            <Badge key={p} tone="red">
                                                {p}
                                            </Badge>
                                        ))}

                                        <Badge tone={statusTone}>
                                            {d.status === 'Endorsed'
                                                ? 'Endorsed'
                                                : d.status === 'Recommended'
                                                  ? 'PV Recommended'
                                                  : 'Watchlist'}
                                        </Badge>
                                    </div>

                                    <div className={styles.meta}>
                                        <span className={styles.metaItem}>
                                            {d.office}
                                        </span>
                                        <span className={styles.dot}>•</span>
                                        <span className={styles.metaItem}>
                                            {location}
                                        </span>
                                        <span className={styles.dot}>•</span>
                                        <span className={styles.metaItem}>
                                            {d.stage}
                                        </span>
                                        <span className={styles.dot}>•</span>
                                        <span className={styles.metaItem}>
                                            Election {electionLabel}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.cardBodyGrid}>
                                    <div className={styles.candidateImageBox}>
                                        <div
                                            className={
                                                styles.candidateImagePlaceholder
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.imagePlaceholderLabel
                                                }
                                            >
                                                Candidate Photo
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.cardText}>
                                        <h3 className={styles.cardTitle}>
                                            {d.candidateName}
                                        </h3>
                                        <p className={styles.cardHeadline}>
                                            {d.headline}
                                        </p>
                                        <p className={styles.cardBody}>
                                            {d.description}
                                        </p>

                                        <div className={styles.tags}>
                                            {d.issues.slice(0, 6).map((t) => (
                                                <span
                                                    key={t}
                                                    className={styles.tag}
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>

                                        <div className={styles.cardActions}>
                                            {d.links?.website ? (
                                                <a
                                                    className={styles.cardLink}
                                                    href={d.links.website}
                                                >
                                                    Read more
                                                </a>
                                            ) : (
                                                <span />
                                            )}

                                            <div
                                                className={styles.actionCluster}
                                            >
                                                {d.links?.volunteer ? (
                                                    <a
                                                        className={
                                                            styles.cardButton
                                                        }
                                                        href={d.links.volunteer}
                                                    >
                                                        Volunteer
                                                    </a>
                                                ) : null}
                                                {d.links?.donate ? (
                                                    <a
                                                        className={
                                                            styles.cardButtonAlt
                                                        }
                                                        href={d.links.donate}
                                                    >
                                                        Donate
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={styles.cardGlow}
                                    aria-hidden="true"
                                />
                            </article>
                        )
                    })}
                </div>

                {filtered.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyTitle}>No matches.</div>
                        <div className={styles.emptyBody}>
                            Try a different search term, or clear filters to see
                            all endorsements.
                        </div>
                    </div>
                ) : null}
            </ContentSection>

            <ContentSection title="HOW PV ENDORSES">
                <div className={styles.principles}>
                    <div className={styles.principle}>
                        <div className={styles.principleTitle}>
                            Values + governing agenda
                        </div>
                        <div className={styles.principleBody}>
                            We prioritize candidates aligned with a bold,
                            material agenda: labor power, housing, healthcare,
                            and democracy protections.
                        </div>
                    </div>

                    <div className={styles.principle}>
                        <div className={styles.principleTitle}>
                            Path to victory
                        </div>
                        <div className={styles.principleBody}>
                            Endorsements include a real plan to win—field
                            strength, coalition math, and turnout.
                        </div>
                    </div>

                    <div className={styles.principle}>
                        <div className={styles.principleTitle}>
                            Movement infrastructure
                        </div>
                        <div className={styles.principleBody}>
                            We invest where organizing can scale: repeatable
                            volunteer roles, strong local partners, and
                            measurable goals.
                        </div>
                    </div>
                </div>
            </ContentSection>

            <ContentSection title="DISCLAIMER">
                <div className={styles.disclaimer}>
                    <p>
                        Endorsements are updated throughout the 2026 cycle as
                        filing deadlines, primaries, and special elections
                        occur. “PV Recommended” indicates strong alignment and
                        viability, while “Watchlist” indicates we are monitoring
                        the race.
                    </p>
                    <p className={styles.disclaimerSmall}>
                        If you’re a campaign seeking endorsement consideration,
                        email{' '}
                        <a
                            className={styles.inlineLink}
                            href="mailto:hello@progressivevictory.win"
                        >
                            hello@progressivevictory.win
                        </a>
                        .
                    </p>
                </div>
            </ContentSection>
        </ContentPageFrame>
    )
}
