'use client'

import styles from './page.module.css'
import { zActBlueDonationPacket } from '@/contracts/data'
import { zActBlueDonor } from '@/contracts/data/ActBlueDonor'
import { usePaginatedSearch } from '@/util/hooks'
import Link from 'next/link'
import { FaDonate } from 'react-icons/fa'
import { FaDollarSign } from 'react-icons/fa6'

function formatCount(value?: number) {
    if (value == null) return '—'
    return value.toLocaleString()
}

interface FundraisingCardProps {
    title: string
    description: string
    href: string
    icon: React.ComponentType<{ size?: number }>
    count?: number
}

function FundraisingCard({
    title,
    description,
    href,
    icon: Icon,
    count,
}: FundraisingCardProps) {
    return (
        <Link href={href} className={styles.card} aria-label={`${title} panel`}>
            <div className={styles.cardTop}>
                <div className={styles.cardLeft}>
                    <div className={styles.iconPill} aria-hidden="true">
                        <Icon size={20} />
                    </div>

                    <div className={styles.cardTitle}>{title}</div>
                </div>

                <div className={styles.cardCount}>{formatCount(count)}</div>
            </div>

            <div className={styles.cardDescription}>{description}</div>
        </Link>
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
            </div>
        </div>
    )
}
