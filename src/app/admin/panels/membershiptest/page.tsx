'use client'

import styles from './page.module.css'
import { DropdownButton, DropdownOverlay } from '@/components/common'
import { Table, ColumnEntry } from '@/components/common/table'
import {
    MembershipsResponsePacket,
    zMembershipsResponsePacket,
    zPaginatedResponse,
} from '@/contracts/responses'
import { cn } from '@/util'
import { useFetch } from '@/util/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { FiCheck, FiX } from 'react-icons/fi'
import { IoEllipsisVerticalCircleOutline } from 'react-icons/io5'

interface MembershipRow {
    id: string
    donorName?: string
    userName?: string
    discordUsername?: string
    customField?: string
    membershipEmail?: string
    donorEmail?: string
    userEmail?: string
    donorAddress?: string
    userAddress?: string
    donorPhone?: string
    userPhone?: string
    membershipTier?: string
    contributionCount?: number
    isRecurring?: boolean
    duesPayingMember?: boolean
    membershipBenefitEligible?: boolean
    membershipCardStatus?: number
    membershipMerchStatus?: number
    nameConfirmed?: boolean
    addressConfirmed?: boolean
}

const formatPhone = (phone?: string) => {
    if (!phone) return '—'
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return phone
}

const NameTag = ({ name }: { name?: string }) =>
    name ? (
        <span className={cn(styles.tag, styles.tagWide, styles.tagGray)}>
            {name}
        </span>
    ) : (
        <span className={cn(styles.tag, styles.tagWide, styles.tagGhost)}>
            Unfilled
        </span>
    )

const NameMenu = ({
    row,
    closeDropdown,
}: {
    row: MembershipRow
    closeDropdown: () => void
}) => (
    <DropdownOverlay
        label="Names"
        onClose={closeDropdown}
        className={styles.nameOverlay}
        bodyClassName={styles.nameOverlayBody}
        style={{ left: 'auto', right: 0 }}
        body={
            <>
                <div className={styles.nameSourceRow}>
                    <span className={styles.nameSourceLabel}>User</span>
                    <NameTag name={row.userName} />
                </div>
                <div className={styles.nameSourceRow}>
                    <span className={styles.nameSourceLabel}>Donor</span>
                    <NameTag name={row.donorName} />
                </div>
            </>
        }
    />
)

const buildColumns = (): ColumnEntry<MembershipRow>[] => [
    {
        key: 'rowNumber',
        header: '#',
        width: '3rem',
        render: (_m: MembershipRow, index: number) => index + 1,
    },
    {
        key: 'donorName',
        header: 'Donor Name',
        width: '11rem',
        sortValue: (m: MembershipRow) => m.donorName ?? '',
        render: (m: MembershipRow) => m.donorName ?? '—',
    },
    {
        key: 'userName',
        header: 'User Name',
        width: '11rem',
        allowOverflow: true,
        sortValue: (m: MembershipRow) => m.userName ?? '',
        render: (m: MembershipRow) => (
            <span className={cn(styles.nameCell, styles.nameCellSplit)}>
                <span>{m.userName ?? '—'}</span>
                {m.userName &&
                    (m.nameConfirmed ? (
                        <FiCheck
                            className={styles.nameVerified}
                            strokeWidth={3}
                        />
                    ) : (
                        <FiX
                            className={styles.nameUnverified}
                            strokeWidth={3}
                        />
                    ))}
                <span className={styles.cellDropdown}>
                    <DropdownButton
                        buttonVariant="plain"
                        className={styles.cellDropdownButton}
                        aria-label="Name details"
                        menu={({ closeDropdown }) => (
                            <NameMenu row={m} closeDropdown={closeDropdown} />
                        )}
                    >
                        <IoEllipsisVerticalCircleOutline size="1.25em" />
                    </DropdownButton>
                </span>
            </span>
        ),
    },
    {
        key: 'discordUsername',
        header: 'Discord Username',
        width: '11rem',
        sortValue: (m: MembershipRow) => m.discordUsername ?? '',
        render: (m: MembershipRow) =>
            m.discordUsername ? `@${m.discordUsername}` : '—',
    },
    {
        key: 'customField',
        header: 'Custom Field',
        width: '14rem',
        sortValue: (m: MembershipRow) => m.customField ?? '',
        render: (m: MembershipRow) => m.customField ?? '—',
    },
    {
        key: 'donorAddress',
        header: 'Donor Address',
        width: '40rem',
        sortValue: (m: MembershipRow) => m.donorAddress ?? '',
        render: (m: MembershipRow) => m.donorAddress ?? '—',
    },
    {
        key: 'userAddress',
        header: 'User Address',
        width: '40rem',
        sortValue: (m: MembershipRow) => m.userAddress ?? '',
        render: (m: MembershipRow) => {
            return (
                <span className={styles.nameCell}>
                    {m.userAddress ?? '—'}
                    {m.userAddress &&
                        (m.addressConfirmed ? (
                            <FiCheck
                                className={styles.nameVerified}
                                strokeWidth={3}
                            />
                        ) : (
                            <FiX
                                className={styles.nameUnverified}
                                strokeWidth={3}
                            />
                        ))}
                </span>
            )
        },
    },
    {
        key: 'membershipEmail',
        header: 'Membership Email',
        width: '13rem',
        sortValue: (m: MembershipRow) => m.membershipEmail ?? '',
        render: (m: MembershipRow) => m.membershipEmail ?? '—',
    },
    {
        key: 'donorEmail',
        header: 'Donor Email',
        width: '13rem',
        sortValue: (m: MembershipRow) => m.donorEmail ?? '',
        render: (m: MembershipRow) => m.donorEmail ?? '—',
    },
    {
        key: 'userEmail',
        header: 'User Email',
        width: '13rem',
        sortValue: (m: MembershipRow) => m.userEmail ?? '',
        render: (m: MembershipRow) => m.userEmail ?? '—',
    },
    {
        key: 'donorPhone',
        header: 'Donor Phone',
        width: '10rem',
        sortValue: (m: MembershipRow) => m.donorPhone ?? '',
        render: (m: MembershipRow) => formatPhone(m.donorPhone),
    },
    {
        key: 'userPhone',
        header: 'User Phone',
        width: '10rem',
        sortValue: (m: MembershipRow) => m.userPhone ?? '',
        render: (m: MembershipRow) => formatPhone(m.userPhone),
    },
    {
        key: 'membershipTier',
        header: 'Tier',
        width: '11rem',
        sortValue: (m: MembershipRow) => m.membershipTier ?? '',
        render: (m: MembershipRow) => m.membershipTier ?? '—',
    },
    {
        key: 'contributionCount',
        header: 'Contributions',
        width: '7rem',
        sortValue: (m: MembershipRow) => m.contributionCount ?? -1,
        render: (m: MembershipRow) => m.contributionCount ?? '—',
    },
    {
        key: 'isRecurring',
        header: 'Recurring',
        width: '6rem',
        sortValue: (m: MembershipRow) => m.isRecurring ?? -1,
        render: (m: MembershipRow) =>
            m.isRecurring == null ? '—' : m.isRecurring ? 'Yes' : 'No',
    },
    {
        key: 'duesPayingMember',
        header: 'Dues Paying Member',
        width: '7rem',
        sortValue: (m: MembershipRow) => (m.duesPayingMember ? 1 : 0),
        render: (m: MembershipRow) => (
            <span className={styles.nameCell}>
                {m.duesPayingMember ? 'Yes' : 'No'}
            </span>
        ),
    },
    {
        key: 'membershipBenefitEligible',
        header: 'Eligible',
        width: '6rem',
        sortValue: (m: MembershipRow) => m.membershipBenefitEligible ?? -1,
        render: (m: MembershipRow) =>
            m.membershipBenefitEligible == null
                ? '—'
                : m.membershipBenefitEligible
                  ? 'Yes'
                  : 'No',
    },
    {
        key: 'membershipCardStatus',
        header: 'Card Status',
        width: '8rem',
        sortValue: (m: MembershipRow) => m.membershipCardStatus ?? 0,
        render: (m: MembershipRow) =>
            m.membershipCardStatus != null
                ? String(m.membershipCardStatus)
                : '—',
    },
    {
        key: 'membershipMerchStatus',
        header: 'Merch Status',
        width: '8rem',
        sortValue: (m: MembershipRow) => m.membershipMerchStatus ?? 0,
        render: (m: MembershipRow) =>
            m.membershipMerchStatus != null
                ? String(m.membershipMerchStatus)
                : '—',
    },
]

const mapPacketToRow = (
    packet: MembershipsResponsePacket,
    index: number
): MembershipRow => {
    const donor = packet.donor
    const user = packet.user

    const donorName = [donor.firstname, donor.lastname]
        .filter(Boolean)
        .join(' ')
    const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    const discordUsername = user?.discordUsers?.[0]?.username ?? ''
    const customField = packet.customField?.answer ?? ''
    const membershipEmail = donor.membershipData?.donorEmail ?? ''
    const donorEmail = donor.email ?? ''
    const userEmail = user?.email ?? ''
    const donorPhone = donor.phone ?? ''
    const userPhone = user?.phone ?? ''
    const donorAddress = [
        donor.addr1,
        [donor.city, [donor.state, donor.zip].filter(Boolean).join(' ')]
            .filter(Boolean)
            .join(', '),
        donor.country,
    ]
        .filter(Boolean)
        .join(', ')
    const userAddress = [
        [user?.address?.addressLine1, user?.address?.addressLine2]
            .filter(Boolean)
            .join(', '),
        [
            user?.address?.city,
            [user?.address?.state, user?.address?.zip]
                .filter(Boolean)
                .join(' '),
        ]
            .filter(Boolean)
            .join(', '),
        user?.address?.county,
    ]
        .filter(Boolean)
        .join(', ')
    const membershipTier = packet.customField?.label ?? '—'
    const contributionCount = donor.contributions?.length
    const isRecurring = donor.contributions?.some(
        (contribution) => contribution.isRecurring
    )

    return {
        id: `${user?.id ?? donor.userId ?? donor.email}-${index}`,
        donorName: donorName || undefined,
        userName: userName || undefined,
        discordUsername: discordUsername || undefined,
        customField: customField || undefined,
        membershipEmail: membershipEmail || undefined,
        donorEmail: donorEmail || undefined,
        userEmail: userEmail || undefined,
        donorPhone: donorPhone || undefined,
        userPhone: userPhone || undefined,
        donorAddress: donorAddress || undefined,
        userAddress: userAddress || undefined,
        membershipTier: membershipTier || undefined,
        contributionCount,
        isRecurring,
        duesPayingMember:
            donor.membershipData?.duesPayingMember ??
            user?.duesPayingMember ??
            false,
        membershipBenefitEligible:
            donor.membershipData?.membershipBenefitEligible ??
            user?.membershipBenefitEligible ??
            undefined,
        membershipCardStatus:
            donor.membershipData?.membershipCardStatus ??
            user?.membershipCardStatus ??
            undefined,
        membershipMerchStatus:
            donor.membershipData?.membershipMerchStatus ??
            user?.membershipMerchStatus ??
            undefined,
        nameConfirmed: Boolean(user?.nameConfirmed),
        addressConfirmed: Boolean(user?.addressConfirmed),
    }
}

export default function Page() {
    const { ready, onGet } = useFetch()
    const columns = buildColumns()
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const membershipsQuery = useInfiniteQuery({
        queryKey: ['/actblue/memberships', { limit: 50 }],
        queryFn: ({ pageParam, signal }) =>
            onGet(
                '/actblue/memberships',
                zPaginatedResponse(zMembershipsResponsePacket),
                {
                    query: { page: pageParam, limit: 50 },
                    signal,
                }
            ),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => {
            const loadedCount = pages.reduce(
                (total, page) => total + page.data.length,
                0
            )

            return loadedCount < lastPage.count ? pages.length : undefined
        },
        enabled: ready,
    })

    useEffect(() => {
        const loadMoreElement = loadMoreRef.current
        if (!loadMoreElement || !membershipsQuery.hasNextPage) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    !membershipsQuery.isFetchingNextPage
                )
                    void membershipsQuery.fetchNextPage()
            },
            { rootMargin: '300px' }
        )

        observer.observe(loadMoreElement)
        return () => observer.disconnect()
    }, [
        membershipsQuery,
        membershipsQuery.fetchNextPage,
        membershipsQuery.hasNextPage,
        membershipsQuery.isFetchingNextPage,
    ])

    const queryError = membershipsQuery.error
    const rows = (membershipsQuery.data?.pages ?? [])
        .flatMap((page) => page.data)
        .map((packet, index) => mapPacketToRow(packet, index))
    const totalEntries = membershipsQuery.data?.pages[0]?.count
    const showQueryError = membershipsQuery.isError && !membershipsQuery.data

    return (
        <div className={styles.panelContents}>
            <div className={styles.panelHeader}>
                <div className={styles.breadcrumbs}>
                    <span className={styles.prominentBreadcrumb}>Admin</span>
                    <span className={styles.breadcrumbSeperator}>/</span>
                    <span className={styles.panelBreadcrumb}>
                        Membership Test
                    </span>
                </div>

                <div className={styles.panelTimestamp}>
                    Entries Loaded: {rows.length.toLocaleString()}
                    {totalEntries != null &&
                        ` of ${totalEntries.toLocaleString()}`}
                </div>
            </div>
            <div className={styles.scrollView}>
                <div className={styles.galleryHeader}>
                    <h1 className={styles.galleryTitle}>Membership Test</h1>
                    <p className={styles.gallerySubTitle}>
                        Manage membership records and details.
                    </p>
                </div>

                <div className={styles.tableWrapper}>
                    {showQueryError && (
                        <div
                            role="alert"
                            style={{
                                padding: '0.75rem 1rem',
                                marginBottom: '1rem',
                                borderRadius: '0.5rem',
                                background: '#fff3f3',
                                border: '1px solid #f5b0b0',
                                color: '#7a1b1b',
                            }}
                        >
                            Unable to load membership records. The API endpoint
                            for /actblue/memberships could not be reached.
                            {queryError instanceof Error && (
                                <> {queryError.message}</>
                            )}
                        </div>
                    )}
                    <Table columns={columns} data={rows} rowKey={(m) => m.id} />
                    <div
                        ref={loadMoreRef}
                        className={styles.loadMore}
                        aria-live="polite"
                    >
                        {membershipsQuery.isFetchingNextPage &&
                            'Loading more membership records...'}
                    </div>
                </div>
            </div>
        </div>
    )
}
