'use client'

import {
    members,
    Member,
    MembershipTier,
    ShirtSize,
    PackageShipped,
} from './membership.data'
import styles from './page.module.css'
import {
    DropdownButton,
    DropdownOverlay,
    ToggleGroup,
} from '@/components/common'
import { Table, Column, ColumnEntry } from '@/components/common/table'
import { useState } from 'react'
import { FiCheck, FiX } from 'react-icons/fi'

const Check = () => <FiCheck strokeWidth={3} />
const Cross = () => <FiX strokeWidth={3} />

const BoolTag = ({ value }: { value?: boolean }) =>
    value ? (
        <span className={`${styles.tag} ${styles.tagGreen}`}>
            <Check />
        </span>
    ) : (
        <span className={`${styles.tag} ${styles.tagRed}`}>
            <Cross />
        </span>
    )

const shirtSizeClass: Record<ShirtSize, string> = {
    XS: styles.tagRed,
    S: styles.tagOrange,
    M: styles.tagYellow,
    L: styles.tagGreen,
    XL: styles.tagBlue,
    XXL: styles.tagPurple,
}

const membershipTierClass: Record<MembershipTier, string> = {
    'Dues Paying Member': styles.tagMember,
    'Premium Member': styles.tagPremium,
    'Signature Member': styles.tagSignature,
    'Inner Circle Member': styles.tagInnerCircle,
}

const packageShippedClass: Record<PackageShipped, string> = {
    Yes: styles.tagGreen,
    No: styles.tagRed,
    Returned: styles.tagYellow,
    'Not Received': styles.tagDarkRed,
    Canceled: styles.tagBlue,
}

const formatPhone = (phone?: string) => {
    if (!phone) return '—'
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return phone
}

const statusDotColor = (m: Member, col: Column<Member>): string => {
    const boolFields: Record<string, boolean | undefined> = {
        discordConfirmed: m.discordConfirmed,
        nameConfirmed: m.nameConfirmed,
        addressConfirmed: m.addressConfirmed,
        cardPrinted: m.cardPrinted,
        labelPrinted: m.labelPrinted,
        cardPacked: m.cardPacked,
        benefitShipped: m.benefitShipped,
    }
    if (col.key === 'packageShipped') {
        const colors: Record<PackageShipped, string> = {
            Yes: 'rgba(112, 195, 32, 0.6)',
            No: 'rgba(255, 95, 75, 0.6)',
            Returned: 'rgba(255, 168, 0, 0.6)',
            'Not Received': 'rgba(177, 2, 2, 1)',
            Canceled: 'rgba(42, 155, 225, 0.6)',
        }
        return colors[m.packageShipped ?? 'No']
    }
    return boolFields[col.key]
        ? 'rgba(112, 195, 32, 0.6)'
        : 'rgba(255, 95, 75, 0.6)'
}

const confirmedColumns: Column<Member>[] = [
    {
        key: 'discordConfirmed',
        header: 'Discord Confirmed',
        width: '5rem',
        sortValue: (m: Member) => (m.discordConfirmed ? 1 : 0),
        render: (m: Member) => <BoolTag value={m.discordConfirmed} />,
    },
    {
        key: 'nameConfirmed',
        header: 'Name Confirmed',
        width: '5rem',
        sortValue: (m: Member) => (m.nameConfirmed ? 1 : 0),
        render: (m: Member) => <BoolTag value={m.nameConfirmed} />,
    },
    {
        key: 'addressConfirmed',
        header: 'Address Confirmed',
        width: '5rem',
        sortValue: (m: Member) => (m.addressConfirmed ? 1 : 0),
        render: (m: Member) => <BoolTag value={m.addressConfirmed} />,
    },
]

const statusColumns: Column<Member>[] = [
    {
        key: 'eligibleForBenefits',
        header: 'Eligible',
        width: '5rem',
        sortValue: (m: Member) => (m.eligibleForBenefits ? 1 : 0),
        render: (m: Member) => <BoolTag value={m.eligibleForBenefits} />,
    },
    {
        key: 'isMember',
        header: 'Member',
        width: '5rem',
        sortValue: (m: Member) => (m.isMember ? 1 : 0),
        render: (m: Member) => <BoolTag value={m.isMember} />,
    },
]

const buildColumns = (
    showConfirmed: boolean,
    showFulfilled: boolean,
    showStatus: boolean
): ColumnEntry<Member>[] => [
    ...(showStatus ? statusColumns : ([] as Column<Member>[])),
    {
        key: 'membershipTier',
        header: 'Tier',
        width: '11rem',
        sortValue: (m: Member) => m.membershipTier ?? '',
        render: (m: Member) =>
            m.membershipTier ? (
                <span
                    className={`${styles.tag} ${styles.tagTier} ${membershipTierClass[m.membershipTier]}`}
                >
                    {m.membershipTier}
                </span>
            ) : (
                '—'
            ),
    },
    {
        label: 'Fulfillment',
        collapsedWidth: '6rem',
        dotColor: statusDotColor,
        rowRender: showFulfilled
            ? (m: Member) => {
                  const allFulfilled =
                      (!showConfirmed ||
                          (m.discordConfirmed &&
                              m.nameConfirmed &&
                              m.addressConfirmed)) &&
                      m.cardPrinted &&
                      m.labelPrinted &&
                      m.cardPacked &&
                      m.benefitShipped &&
                      m.packageShipped === 'Yes'
                  if (!allFulfilled) return null
                  return (
                      <span
                          className={`${styles.tag} ${styles.tagGreen} ${styles.tagFulfilled}`}
                      >
                          Benefits Fulfilled
                      </span>
                  )
              }
            : undefined,
        columns: [
            ...(showConfirmed ? confirmedColumns : ([] as Column<Member>[])),
            {
                key: 'cardPrinted',
                header: 'Card Printed',
                width: '5rem',
                sortValue: (m: Member) => (m.cardPrinted ? 1 : 0),
                render: (m: Member) => <BoolTag value={m.cardPrinted} />,
            },
            {
                key: 'labelPrinted',
                header: 'Label Printed',
                width: '5rem',
                sortValue: (m: Member) => (m.labelPrinted ? 1 : 0),
                render: (m: Member) => <BoolTag value={m.labelPrinted} />,
            },
            {
                key: 'cardPacked',
                header: 'Packed',
                width: '5rem',
                sortValue: (m: Member) => (m.cardPacked ? 1 : 0),
                render: (m: Member) => <BoolTag value={m.cardPacked} />,
            },
            {
                key: 'benefitShipped',
                header: 'Benefit Shipped',
                width: '5rem',
                sortValue: (m: Member) => (m.benefitShipped ? 1 : 0),
                render: (m: Member) => <BoolTag value={m.benefitShipped} />,
            },
            {
                key: 'packageShipped',
                header: 'Package Shipped',
                width: '7rem',
                sortValue: (m: Member) => m.packageShipped ?? '',
                render: (m: Member) =>
                    m.packageShipped ? (
                        <span
                            className={`${styles.tag} ${styles.tagWide} ${packageShippedClass[m.packageShipped]}`}
                        >
                            {m.packageShipped}
                        </span>
                    ) : (
                        '—'
                    ),
            },
        ],
    },

    {
        key: 'name',
        header: 'Name',
        width: '11rem',
        sortValue: (m: Member) =>
            [m.firstName, m.lastName].filter(Boolean).join(' '),
        render: (m: Member) => (
            <span className={styles.nameCell}>
                {[m.firstName, m.lastName].filter(Boolean).join(' ') || '—'}
                {m.nameConfirmed ? (
                    <FiCheck className={styles.nameVerified} strokeWidth={3} />
                ) : (
                    <FiX className={styles.nameUnverified} strokeWidth={3} />
                )}
            </span>
        ),
    },
    {
        key: 'discord',
        header: 'Discord',
        width: '11rem',
        sortValue: (m: Member) => m.discordUsername ?? '',
        render: (m: Member) => (
            <span className={styles.nameCell}>
                {m.discordUsername ? `@${m.discordUsername}` : '—'}
                {m.discordConfirmed ? (
                    <FiCheck className={styles.nameVerified} strokeWidth={3} />
                ) : (
                    <FiX className={styles.nameUnverified} strokeWidth={3} />
                )}
            </span>
        ),
    },
    {
        key: 'address',
        header: 'Address',
        width: '40rem',
        sortValue: (m: Member) => m.state ?? m.city ?? '',
        render: (m: Member) => {
            const parts = [
                [m.address1, m.address2].filter(Boolean).join(', '),
                [m.city, [m.state, m.zip].filter(Boolean).join(' ')]
                    .filter(Boolean)
                    .join(', '),
                m.country,
            ].filter(Boolean)
            return (
                <span className={styles.nameCell}>
                    {parts.join(', ') || '—'}
                    {m.addressConfirmed ? (
                        <FiCheck
                            className={styles.nameVerified}
                            strokeWidth={3}
                        />
                    ) : (
                        <FiX
                            className={styles.nameUnverified}
                            strokeWidth={3}
                        />
                    )}
                </span>
            )
        },
    },
    {
        key: 'beganMembership',
        header: 'Member Since',
        sortValue: (m: Member) => m.beganMembership ?? '',
        render: (m: Member) => {
            if (!m.beganMembership) return '—'
            const [y, mo, d] = m.beganMembership.split('-')
            return `${mo}-${d}-${y}`
        },
    },
    {
        key: 'phone',
        header: 'Phone',
        sortValue: (m: Member) => m.phone ?? '',
        render: (m: Member) => formatPhone(m.phone),
    },
    {
        key: 'email',
        header: 'Email',
        sortValue: (m: Member) => m.email ?? '',
        render: (m: Member) => m.email ?? '—',
    },
    {
        key: 'shirtSize',
        header: 'Shirt',
        width: '5rem',
        sortValue: (m: Member) => m.shirtSize ?? '',
        render: (m: Member) =>
            m.shirtSize ? (
                <span
                    className={`${styles.tag} ${shirtSizeClass[m.shirtSize]}`}
                >
                    {m.shirtSize}
                </span>
            ) : (
                '—'
            ),
    },

    {
        key: 'membershipAmount',
        header: 'Amount',
        width: '6rem',
        sortValue: (m: Member) => m.membershipAmount ?? 0,
        render: (m: Member) =>
            m.membershipAmount != null ? `$${m.membershipAmount}` : '—',
    },
    {
        key: 'contributions',
        header: 'Contributions',
        width: '6rem',
        sortValue: (m: Member) => m.numberOfContributions ?? 0,
        render: (m: Member) => m.numberOfContributions?.toString() ?? '—',
    },
    {
        key: 'userMatched',
        header: 'User Matched',
        width: '5rem',
        sortValue: (m: Member) => (m.userMatched ? 1 : 0),
        render: (m: Member) => <BoolTag value={m.userMatched} />,
    },
]

export default function Page() {
    const [showConfirmed, setShowConfirmed] = useState(false)
    const [showFulfilled, setShowFulfilled] = useState(true)
    const [collapseFulfillment, setCollapseFulfillment] = useState(false)
    const [showStatus, setShowStatus] = useState(false)
    const columns = buildColumns(showConfirmed, showFulfilled, showStatus)
    const collapsedCategories = collapseFulfillment ? ['Fulfillment'] : []

    return (
        <div className={styles.panelContents}>
            <div className={styles.panelHeader}>
                <div className={styles.breadcrumbs}>
                    <span className={styles.prominentBreadcrumb}>Admin</span>
                    <span className={styles.breadcrumbSeperator}>/</span>
                    <span className={styles.panelBreadcrumb}>Membership</span>
                </div>

                {/* logic will eventually need to be reworked to show last api fetch and not most recent contribution date */}
                <div className={styles.panelTimestamp}>Last Updated: N/A</div>
            </div>
            <div className={styles.scrollView}>
                <div className={styles.galleryHeader}>
                    <h1 className={styles.galleryTitle}>Membership</h1>
                    <p className={styles.gallerySubTitle}>
                        Manage membership records and details.
                    </p>
                </div>

                <div className={styles.tableToolbar}>
                    <DropdownButton
                        buttonVariant="minimal"
                        label="Table Options"
                        menu={({ closeDropdown }) => (
                            <DropdownOverlay
                                className={styles.tableOptionsBox}
                                label="Table Options"
                                onClose={closeDropdown}
                                bodyClassName={styles.tableOptionsBody}
                                body={
                                    <>
                                        <div className={styles.tableOptionRow}>
                                            <span
                                                className={
                                                    styles.tableOptionLabel
                                                }
                                            >
                                                Status columns
                                            </span>
                                            <ToggleGroup<boolean>
                                                ariaLabel="Member Eligibility Columns"
                                                orientation="horizontal"
                                                value={showStatus}
                                                options={[
                                                    {
                                                        value: true,
                                                        label: 'Show',
                                                    },
                                                    {
                                                        value: false,
                                                        label: 'Hide',
                                                    },
                                                ]}
                                                onChange={setShowStatus}
                                            />
                                        </div>
                                        <div className={styles.tableOptionRow}>
                                            <span
                                                className={
                                                    styles.tableOptionLabel
                                                }
                                            >
                                                Confirmed columns
                                            </span>
                                            <ToggleGroup<boolean>
                                                ariaLabel="Member Details Confirmed Columns"
                                                orientation="horizontal"
                                                value={showConfirmed}
                                                options={[
                                                    {
                                                        value: true,
                                                        label: 'Show',
                                                    },
                                                    {
                                                        value: false,
                                                        label: 'Hide',
                                                    },
                                                ]}
                                                onChange={setShowConfirmed}
                                            />
                                        </div>
                                        <div className={styles.tableOptionRow}>
                                            <span
                                                className={
                                                    styles.tableOptionLabel
                                                }
                                            >
                                                Benefits fulfilled tag
                                            </span>
                                            <ToggleGroup<boolean>
                                                ariaLabel="Tag Groups"
                                                orientation="horizontal"
                                                value={showFulfilled}
                                                options={[
                                                    {
                                                        value: true,
                                                        label: 'Show',
                                                    },
                                                    {
                                                        value: false,
                                                        label: 'Hide',
                                                    },
                                                ]}
                                                onChange={setShowFulfilled}
                                            />
                                        </div>
                                        <div className={styles.tableOptionRow}>
                                            <span
                                                className={
                                                    styles.tableOptionLabel
                                                }
                                            >
                                                Fulfillment columns
                                            </span>
                                            <ToggleGroup<boolean>
                                                ariaLabel="Fulfillment columns"
                                                orientation="horizontal"
                                                value={collapseFulfillment}
                                                options={[
                                                    {
                                                        value: false,
                                                        label: 'Expand',
                                                    },
                                                    {
                                                        value: true,
                                                        label: 'Collapse',
                                                    },
                                                ]}
                                                onChange={
                                                    setCollapseFulfillment
                                                }
                                            />
                                        </div>
                                    </>
                                }
                            />
                        )}
                    />
                </div>

                <div className={styles.tableWrapper}>
                    <Table
                        columns={columns}
                        data={members}
                        rowKey={(m) => m.id}
                        collapsedCategories={collapsedCategories}
                    />
                </div>
            </div>
        </div>
    )
}
