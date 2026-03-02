'use client'

import styles from './page.module.css'
import { zActBlueDonationPacket } from '@/contracts/data'
import { zActBlueDonor } from '@/contracts/data/ActBlueDonor'
import {
    DonationTotal,
    TotalType,
    zDonationTotal,
} from '@/contracts/data/DonationTotals'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { FaDonate } from 'react-icons/fa'
import { FaDollarSign } from 'react-icons/fa6'

function formatCount(value?: number, prefix?: string) {
    if (value == null) return '—'
    return (prefix ?? '').concat(value.toLocaleString())
}

interface FundraisingCardProps {
    title: string
    description: string
    href?: string
    icon: React.ComponentType<{ size?: number }>
    count?: number
    prefix?: string
}

function FundraisingCard({
    title,
    description,
    href,
    icon: Icon,
    count,
    prefix,
}: FundraisingCardProps) {
    const children = (
        <>
            <div className={styles.cardTop}>
                <div className={styles.cardLeft}>
                    <div className={styles.iconPill} aria-hidden="true">
                        <Icon size={20} />
                    </div>

                    <div className={styles.cardTitle}>{title}</div>
                </div>

                <div className={styles.cardCount}>
                    {formatCount(count, prefix)}
                </div>
            </div>

            <div className={styles.cardDescription}>{description}</div>
        </>
    )

    return href ? (
        <Link href={href} className={styles.card} aria-label={`${title} panel`}>
            {children}
        </Link>
    ) : (
        <div className={styles.card} aria-label={`${title} panel`}>
            {children}
        </div>
    )
}

export default function Page() {
    const donors = usePaginatedSearch('/actblue/donors', zActBlueDonor, {
        search: { limit: 0 },
    })

    const contributions = usePaginatedSearch(
        '/actblue/contributions',
        zActBlueDonationPacket,
        { search: { limit: 0 } }
    )

    const { ready, onGet } = useFetch()

    const fullDonations = useQuery({
        queryKey: [`/actblue/contributions/total?type=${TotalType.ALL}`],
        queryFn: ready
            ? async () =>
                  onGet<DonationTotal>(
                      `/actblue/contributions/total?type=${TotalType.ALL}`,
                      zDonationTotal
                  )
            : skipToken,
        placeholderData: keepPreviousData,
    })

    const recurringDonations = useQuery({
        queryKey: [`/actblue/contributions/total?type=${TotalType.RECURRING}`],
        queryFn: ready
            ? async () =>
                  onGet<DonationTotal>(
                      `/actblue/contributions/total?type=${TotalType.RECURRING}`,
                      zDonationTotal
                  )
            : skipToken,
        placeholderData: keepPreviousData,
    })

    const oneTimeDonations = useQuery({
        queryKey: [`/actblue/contributions/total?type=${TotalType.ONE_TIME}`],
        queryFn: ready
            ? async () =>
                  onGet<DonationTotal>(
                      `/actblue/contributions/total?type=${TotalType.ONE_TIME}`,
                      zDonationTotal
                  )
            : skipToken,
        placeholderData: keepPreviousData,
    })

    return (
        <div className={styles.root}>
            <div className={styles.topBar}>
                <div className={styles.breadcrumbs}>
                    <span className={styles.crumbStrong}>Admin</span>
                    <span className={styles.crumbSep}>/</span>
                    <span className={styles.crumbWeak}>Fundraising</span>
                </div>
            </div>

            <div className={styles.header}>
                <h1 className={styles.heading}>Fundraising</h1>
                <p className={styles.subheading}>
                    Manage ActBlue donors and contribution records.
                </p>
            </div>

            <div className={styles.grid}>
                <FundraisingCard
                    title="Donors"
                    description="ActBlue donors, totals, and donor records."
                    href="/admin/panels/donors"
                    icon={FaDonate}
                    count={donors.query.data?.count}
                />

                <FundraisingCard
                    title="Contributions"
                    description="Contribution lineitems, payment info, and details."
                    href="/admin/panels/contributions"
                    icon={FaDollarSign}
                    count={contributions.query.data?.count}
                />

                <FundraisingCard
                    title="All Donations"
                    description="All donations received by PV, one-time or recurring."
                    href=""
                    icon={FaDollarSign}
                    count={fullDonations.data?.total}
                    prefix={'$'}
                />

                <FundraisingCard
                    title="All Recurring Donations"
                    description="All recurring donations received by PV"
                    icon={FaDollarSign}
                    count={recurringDonations.data?.total}
                    prefix={'$'}
                />

                <FundraisingCard
                    title="All One-Time Donations"
                    description="All one-time donations received by PV"
                    icon={FaDollarSign}
                    count={oneTimeDonations.data?.total}
                    prefix={'$'}
                />
            </div>
        </div>
    )
}
