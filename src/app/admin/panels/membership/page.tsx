'use client'

import {
    Member,
    MembershipTier,
    membershipTiers,
    ShirtSize,
    PackageShipped,
} from './membership.types'
import styles from './page.module.css'
import {
    DropdownButton,
    DropdownOverlay,
    ToggleGroup,
} from '@/components/common'
import { Table, Column, ColumnEntry } from '@/components/common/table'
import { User, UserAddress, zUser } from '@/contracts/data'
import {
    MembershipsResponsePacket,
    zMembershipsResponsePacket,
    zPaginatedResponse,
} from '@/contracts/responses'
import { cn } from '@/util'
import { useFetch } from '@/util/hooks'
import { skipToken, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FaEdit, FaSave, FaTrashAlt } from 'react-icons/fa'
import { FiCheck, FiX } from 'react-icons/fi'

const HISTORY_STALE_TIME = 5 * 60 * 1000
const HISTORY_LIMIT = 5

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
    const digits = phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return phone
}

const SourceCheck = ({ selected }: { selected: boolean }) => (
    <span className={styles.sourceCheck}>
        {selected && <FiCheck className={styles.sourceIndicator} />}
    </span>
)

const joinName = (firstName?: string | null, lastName?: string | null) =>
    [firstName, lastName].filter(Boolean).join(' ').trim() || undefined

const formatHistoryDate = (value: Date) =>
    value.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

type UserHistoryEntry = NonNullable<User['history']>[number]

type DescribeChange = (
    update: UserHistoryEntry,
    previous: UserHistoryEntry | undefined
) => { label: string; value: string } | undefined

const describeNameChange: DescribeChange = (update, previous) => {
    const action = previous ? 'Changed' : 'Set'
    const firstChanged =
        (update.firstName ?? '') !== (previous?.firstName ?? '')
    const lastChanged = (update.lastName ?? '') !== (previous?.lastName ?? '')

    if (!firstChanged && !lastChanged) return undefined

    if (firstChanged && !lastChanged && update.firstName)
        return { label: `First Name ${action}`, value: update.firstName }

    if (lastChanged && !firstChanged && update.lastName)
        return { label: `Last Name ${action}`, value: update.lastName }

    const value = joinName(update.firstName, update.lastName)
    return value ? { label: `Name ${action}`, value } : undefined
}

const describeSimpleChange =
    (
        field: 'phone' | 'email',
        noun: string,
        format: (value: string) => string = (value) => value
    ): DescribeChange =>
    (update, previous) => {
        const value = update[field] ?? ''
        if (value === (previous?.[field] ?? '') || value === '')
            return undefined

        return {
            label: `${noun} ${previous ? 'Changed' : 'Set'}`,
            value: format(value),
        }
    }

const describePhoneChange = describeSimpleChange('phone', 'Phone', formatPhone)
const describeEmailChange = describeSimpleChange('email', 'Email')

const formatUserAddress = (address?: UserAddress) =>
    [
        [address?.addressLine1, address?.addressLine2]
            .filter(Boolean)
            .join(', '),
        [
            address?.city,
            [address?.state, address?.zip].filter(Boolean).join(' '),
        ]
            .filter(Boolean)
            .join(', '),
    ]
        .filter(Boolean)
        .join(', ') || undefined

const describeAddressChange: DescribeChange = (update, previous) => {
    const value = formatUserAddress(update.address)
    if (!value || value === formatUserAddress(previous?.address))
        return undefined

    return { label: `Address ${previous ? 'Changed' : 'Set'}`, value }
}

const FieldHistory = ({
    member,
    title,
    emptyMessage,
    describeChange,
}: {
    member: Member
    title: string
    emptyMessage: string
    describeChange: DescribeChange
}) => {
    const { ready, onGet } = useFetch()
    const userId = member.userId

    const userQuery = useQuery({
        queryKey: ['/users/:userId', userId, { includeHistory: true }],
        queryFn:
            ready && userId != null
                ? ({ signal }: { signal: AbortSignal }) =>
                      onGet('/users/:userId', zUser, {
                          params: { userId },
                          query: { includeHistory: true },
                          signal,
                      })
                : skipToken,
        staleTime: HISTORY_STALE_TIME,
    })

    const history = useMemo(() => {
        const ascending = (userQuery.data?.history ?? [])
            .slice()
            .sort(
                (a, b) =>
                    a.historyWhenUpdatedUtc.getTime() -
                    b.historyWhenUpdatedUtc.getTime()
            )

        return ascending
            .flatMap((update, index) => {
                const change = describeChange(update, ascending[index - 1])
                return change ? [{ update, ...change }] : []
            })
            .reverse()
            .slice(0, HISTORY_LIMIT)
    }, [userQuery.data, describeChange])

    const statusMessage = (() => {
        if (userId == null) return 'No linked user'
        if (userQuery.isPending) return 'Loading…'
        if (userQuery.isError) return 'Failed to load history'
        if (history.length === 0) return emptyMessage
        return undefined
    })()

    return (
        <div className={styles.historySection}>
            <span className={styles.historySectionLabel}>{title}</span>
            {statusMessage && (
                <div className={styles.historyEmpty}>{statusMessage}</div>
            )}
            {!statusMessage && (
                <div className={styles.historyContainer}>
                    {history.map(({ update, label, value }) => (
                        <div
                            key={update.historyId}
                            className={styles.historyEntry}
                        >
                            <span className={styles.historyEntryMain}>
                                <span className={styles.historyEntryPrefix}>
                                    {label}
                                </span>
                                <span className={styles.historyEntryName}>
                                    {value}
                                </span>
                            </span>
                            <span className={styles.historyEntryDateTag}>
                                {formatHistoryDate(
                                    update.historyWhenUpdatedUtc
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const IdenticalTag = ({ source }: { source?: string }) => (
    <span className={cn(styles.tag, styles.tagWide, styles.tagGray)}>
        {source ? `Identical To ${source}` : 'Identical'}
    </span>
)

const ConfirmedBadge = ({
    label,
    confirmed,
}: {
    label: string
    confirmed?: boolean
}) => (
    <span
        className={styles.confirmBadge}
        data-tooltip={`${label} ${confirmed ? 'Confirmed' : 'Not Confirmed'}`}
        tabIndex={0}
    >
        {confirmed ? (
            <FiCheck className={styles.nameVerified} strokeWidth={3} />
        ) : (
            <FiX className={styles.nameUnverified} strokeWidth={3} />
        )}
    </span>
)

const PhoneTag = ({ phone }: { phone?: string }) =>
    phone ? (
        <span className={cn(styles.tag, styles.tagWide, styles.tagGray)}>
            {formatPhone(phone)}
        </span>
    ) : (
        <span className={cn(styles.tag, styles.tagWide, styles.tagGhost)}>
            Unfilled
        </span>
    )

const PhoneValue = ({ member }: { member: Member }) => (
    <span className={styles.valueCell}>
        {formatPhone(member.userPhone ?? member.donorPhone)}
    </span>
)

const PhoneMenu = ({
    member,
    closeDropdown,
}: {
    member: Member
    closeDropdown: () => void
}) => {
    const displayedSource = member.userPhone
        ? 'User'
        : member.donorPhone
          ? 'Donor'
          : undefined
    const sourcesMatch =
        member.userPhone != null &&
        member.donorPhone != null &&
        formatPhone(member.userPhone) === formatPhone(member.donorPhone)

    return (
        <DropdownOverlay
            label="Phone Numbers"
            onClose={closeDropdown}
            className={styles.phoneOverlay}
            bodyClassName={styles.phoneOverlayBody}
            style={{ left: 0, right: 'auto' }}
            body={
                <>
                    <div className={styles.phoneSourceRow}>
                        <SourceCheck selected={displayedSource === 'User'} />
                        <span className={styles.phoneSourceLabel}>User</span>
                        <PhoneTag phone={member.userPhone} />
                    </div>
                    <div className={styles.phoneSourceRow}>
                        <SourceCheck selected={displayedSource === 'Donor'} />
                        <span className={styles.phoneSourceLabel}>Donor</span>
                        {sourcesMatch ? (
                            <IdenticalTag />
                        ) : (
                            <PhoneTag phone={member.donorPhone} />
                        )}
                    </div>
                    <FieldHistory
                        member={member}
                        title="Recent Phone Changes"
                        emptyMessage="No phone changes found"
                        describeChange={describePhoneChange}
                    />
                </>
            }
        />
    )
}

const EmailTag = ({ email }: { email?: string }) =>
    email ? (
        <span className={cn(styles.tag, styles.tagWide, styles.tagGray)}>
            {email}
        </span>
    ) : (
        <span className={cn(styles.tag, styles.tagWide, styles.tagGhost)}>
            Unfilled
        </span>
    )

const EmailValue = ({ member }: { member: Member }) => (
    <span className={styles.valueCell}>
        {member.userEmail ?? member.discordEmail ?? member.donorEmail ?? '—'}
    </span>
)

const EmailMenu = ({
    member,
    closeDropdown,
}: {
    member: Member
    closeDropdown: () => void
}) => {
    const displayedSource = member.userEmail
        ? 'User'
        : member.discordEmail
          ? 'Discord'
          : member.donorEmail
            ? 'Donor'
            : undefined
    const normalizedUserEmail = member.userEmail?.trim().toLowerCase()
    const normalizedDiscordEmail = member.discordEmail?.trim().toLowerCase()
    const normalizedDonorEmail = member.donorEmail?.trim().toLowerCase()
    const discordMatchesUser =
        normalizedDiscordEmail != null &&
        normalizedDiscordEmail === normalizedUserEmail
    const donorMatchesSource =
        normalizedDonorEmail == null
            ? undefined
            : normalizedDonorEmail === normalizedUserEmail
              ? 'User'
              : normalizedDonorEmail === normalizedDiscordEmail
                ? 'Discord'
                : undefined
    const allEmailsMatch =
        new Set(
            [
                normalizedUserEmail,
                normalizedDiscordEmail,
                normalizedDonorEmail,
            ].filter((email) => email != null)
        ).size === 1

    return (
        <DropdownOverlay
            label="Email Addresses"
            onClose={closeDropdown}
            className={styles.emailOverlay}
            bodyClassName={styles.emailOverlayBody}
            style={{ left: 0, right: 'auto' }}
            body={
                <>
                    <div className={styles.emailSourceRow}>
                        <SourceCheck selected={displayedSource === 'User'} />
                        <span className={styles.emailSourceLabel}>User</span>
                        <EmailTag email={member.userEmail} />
                    </div>
                    <div className={styles.emailSourceRow}>
                        <SourceCheck selected={displayedSource === 'Discord'} />
                        <span className={styles.emailSourceLabel}>Discord</span>
                        {discordMatchesUser ? (
                            <IdenticalTag
                                source={allEmailsMatch ? undefined : 'User'}
                            />
                        ) : (
                            <EmailTag email={member.discordEmail} />
                        )}
                    </div>
                    <div className={styles.emailSourceRow}>
                        <SourceCheck selected={displayedSource === 'Donor'} />
                        <span className={styles.emailSourceLabel}>Donor</span>
                        {donorMatchesSource ? (
                            <IdenticalTag
                                source={
                                    allEmailsMatch
                                        ? undefined
                                        : donorMatchesSource
                                }
                            />
                        ) : (
                            <EmailTag email={member.donorEmail} />
                        )}
                    </div>
                    <FieldHistory
                        member={member}
                        title="Recent Email Changes"
                        emptyMessage="No email changes found"
                        describeChange={describeEmailChange}
                    />
                </>
            }
        />
    )
}

const NameTag = ({
    name,
    confirmationStatus,
}: {
    name?: string
    confirmationStatus?: boolean
}) =>
    name ? (
        <span
            className={cn(
                styles.tag,
                styles.tagWide,
                confirmationStatus === true && styles.tagGreen,
                confirmationStatus === false && styles.tagRed,
                confirmationStatus == null && styles.tagGray
            )}
        >
            {name}
        </span>
    ) : (
        <span className={cn(styles.tag, styles.tagWide, styles.tagGhost)}>
            Unfilled
        </span>
    )

const NameMenu = ({
    member,
    closeDropdown,
}: {
    member: Member
    closeDropdown: () => void
}) => {
    const displayedSource = member.userName
        ? 'User'
        : member.donorName
          ? 'Donor'
          : undefined
    const sourcesMatch =
        member.userName != null &&
        member.userName.trim() === member.donorName?.trim()

    return (
        <DropdownOverlay
            label="Names"
            onClose={closeDropdown}
            className={styles.nameOverlay}
            bodyClassName={styles.nameOverlayBody}
            style={{ left: 0, right: 'auto' }}
            body={
                <>
                    <div className={styles.nameSourceRow}>
                        <SourceCheck selected={displayedSource === 'User'} />
                        <span className={styles.nameSourceLabel}>User</span>
                        <NameTag
                            name={member.userName}
                            confirmationStatus={
                                displayedSource === 'User'
                                    ? member.nameConfirmed
                                    : undefined
                            }
                        />
                    </div>
                    <div className={styles.nameSourceRow}>
                        <SourceCheck selected={displayedSource === 'Donor'} />
                        <span className={styles.nameSourceLabel}>Donor</span>
                        {sourcesMatch ? (
                            <IdenticalTag />
                        ) : (
                            <NameTag
                                name={member.donorName}
                                confirmationStatus={
                                    displayedSource === 'Donor'
                                        ? member.nameConfirmed
                                        : undefined
                                }
                            />
                        )}
                    </div>
                    <FieldHistory
                        member={member}
                        title="Recent Name Changes"
                        emptyMessage="No name changes found"
                        describeChange={describeNameChange}
                    />
                </>
            }
        />
    )
}

const NameValue = ({ member }: { member: Member }) => (
    <span className={styles.nameCell}>
        <span>{member.userName ?? member.donorName ?? '—'}</span>
        <ConfirmedBadge label="Name" confirmed={member.nameConfirmed} />
    </span>
)

const normalizeDiscordHandle = (handle: string) =>
    handle.trim().replace(/^@/, '')

const DiscordTag = ({
    username,
    confirmationStatus,
}: {
    username?: string
    confirmationStatus?: boolean
}) =>
    username ? (
        <span
            className={cn(
                styles.tag,
                styles.tagWide,
                confirmationStatus === true && styles.tagGreen,
                confirmationStatus === false && styles.tagRed,
                confirmationStatus == null && styles.tagGray
            )}
        >
            @{normalizeDiscordHandle(username)}
        </span>
    ) : (
        <span className={cn(styles.tag, styles.tagWide, styles.tagGhost)}>
            Unfilled
        </span>
    )

const DiscordValue = ({ member }: { member: Member }) => {
    const displayedHandle = member.discordUsername ?? member.contributionDiscord

    return (
        <span className={styles.nameCell}>
            <span>
                {displayedHandle
                    ? `@${normalizeDiscordHandle(displayedHandle)}`
                    : '—'}
            </span>
            <ConfirmedBadge
                label="Discord"
                confirmed={member.discordConfirmed}
            />
        </span>
    )
}

const DiscordMenu = ({
    member,
    closeDropdown,
}: {
    member: Member
    closeDropdown: () => void
}) => {
    const displayedSource = member.discordUsername
        ? 'Discord'
        : member.contributionDiscord
          ? 'Contribution'
          : undefined
    const sourcesMatch =
        member.discordUsername != null &&
        member.contributionDiscord != null &&
        normalizeDiscordHandle(member.discordUsername) ===
            normalizeDiscordHandle(member.contributionDiscord)

    return (
        <DropdownOverlay
            label="Discord"
            onClose={closeDropdown}
            className={styles.discordOverlay}
            bodyClassName={styles.discordOverlayBody}
            style={{ left: 0, right: 'auto' }}
            body={
                <>
                    <div className={styles.discordSourceRow}>
                        <SourceCheck selected={displayedSource === 'Discord'} />
                        <span className={styles.discordSourceLabel}>
                            Discord
                        </span>
                        <DiscordTag
                            username={member.discordUsername}
                            confirmationStatus={member.discordConfirmed}
                        />
                    </div>
                    <div className={styles.discordSourceRow}>
                        <SourceCheck
                            selected={displayedSource === 'Contribution'}
                        />
                        <span className={styles.discordSourceLabel}>
                            Contribution
                        </span>
                        {sourcesMatch ? (
                            <IdenticalTag />
                        ) : (
                            <DiscordTag username={member.contributionDiscord} />
                        )}
                    </div>
                </>
            }
        />
    )
}

const AddressTag = ({ address }: { address?: string }) =>
    address ? (
        <span className={cn(styles.tag, styles.tagWide, styles.tagGray)}>
            {address}
        </span>
    ) : (
        <span className={cn(styles.tag, styles.tagWide, styles.tagGhost)}>
            Unfilled
        </span>
    )

const AddressValue = ({ member }: { member: Member }) => (
    <span className={styles.nameCell}>
        <span>{member.userAddress ?? member.donorAddress ?? '—'}</span>
        <ConfirmedBadge label="Address" confirmed={member.addressConfirmed} />
    </span>
)

const AddressMenu = ({
    member,
    closeDropdown,
}: {
    member: Member
    closeDropdown: () => void
}) => {
    const displayedSource = member.userAddress
        ? 'User'
        : member.donorAddress
          ? 'Donor'
          : undefined
    const sourcesMatch =
        member.userAddress != null &&
        member.userAddress.trim() === member.donorAddress?.trim()

    return (
        <DropdownOverlay
            label="Addresses"
            onClose={closeDropdown}
            className={styles.addressOverlay}
            bodyClassName={styles.addressOverlayBody}
            style={{ left: 0, right: 'auto' }}
            body={
                <>
                    <div className={styles.addressSourceRow}>
                        <SourceCheck selected={displayedSource === 'User'} />
                        <span className={styles.addressSourceLabel}>User</span>
                        <AddressTag address={member.userAddress} />
                    </div>
                    <div className={styles.addressSourceRow}>
                        <SourceCheck selected={displayedSource === 'Donor'} />
                        <span className={styles.addressSourceLabel}>Donor</span>
                        {sourcesMatch ? (
                            <IdenticalTag />
                        ) : (
                            <AddressTag address={member.donorAddress} />
                        )}
                    </div>
                    <FieldHistory
                        member={member}
                        title="Recent Address Changes"
                        emptyMessage="No address changes found"
                        describeChange={describeAddressChange}
                    />
                </>
            }
        />
    )
}

const mapPacketToMember = (
    packet: MembershipsResponsePacket,
    index: number
): Member => {
    const { donor, user, customField } = packet
    const membership = donor.membershipData
    const cardStatus = membership?.membershipCardStatus
    const merchStatus = membership?.membershipMerchStatus

    const userFullName = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .join(' ')
    const userName =
        userFullName !== '' ? userFullName : (user?.preferredName ?? undefined)
    const donorFullName = [donor.firstname, donor.lastname]
        .filter(Boolean)
        .join(' ')
    const donorName = donorFullName !== '' ? donorFullName : undefined

    const userAddressStr = user?.address
        ? [
              [user.address.addressLine1, user.address.addressLine2]
                  .filter(Boolean)
                  .join(', '),
              [
                  user.address.city,
                  [user.address.state, user.address.zip]
                      .filter(Boolean)
                      .join(' '),
              ]
                  .filter(Boolean)
                  .join(', '),
          ]
              .filter(Boolean)
              .join(', ')
        : ''
    const userAddress = userAddressStr !== '' ? userAddressStr : undefined

    const donorCountry = donor.country?.trim()
    const donorZipDigits = donor.zip?.replace(/\D/g, '').slice(0, 5)
    const donorZip = donorZipDigits === '' ? donor.zip : donorZipDigits
    const donorAddressStr = [
        [donor.addr1].filter(Boolean).join(', '),
        [donor.city, [donor.state, donorZip].filter(Boolean).join(' ')]
            .filter(Boolean)
            .join(', '),
        donorCountry?.toLowerCase() === 'united states'
            ? undefined
            : donorCountry,
    ]
        .filter(Boolean)
        .join(', ')
    const donorAddress = donorAddressStr !== '' ? donorAddressStr : undefined

    const contributionDiscordAnswer = customField?.answer.trim()
    const contributionDiscord =
        contributionDiscordAnswer === '' ? undefined : contributionDiscordAnswer

    const tierLabel = customField?.label
    const membershipTier = membershipTiers.find((tier) => tier === tierLabel)

    return {
        packet,
        id: index + 1,
        userId: user?.id,
        firstName: donor.firstname,
        lastName: donor.lastname,
        userName,
        donorName,
        discordUsername: user?.discordUsers?.[0]?.username,
        contributionDiscord,
        phone: user?.phone ?? donor.phone ?? undefined,
        userPhone: user?.phone ?? undefined,
        donorPhone: donor.phone ?? undefined,
        email: user?.email ?? user?.discordUsers?.[0]?.email ?? donor.email,
        donorEmail: donor.email,
        userEmail: user?.email ?? undefined,
        discordEmail: user?.discordUsers?.[0]?.email ?? undefined,
        address1: donor.addr1 ?? undefined,
        city: donor.city ?? undefined,
        state: donor.state ?? undefined,
        zip: donor.zip ?? undefined,
        country: donor.country ?? undefined,
        userAddress,
        donorAddress,
        shirtSize:
            membership?.shirtSize === '2XL'
                ? 'XXL'
                : (membership?.shirtSize ?? undefined),
        isMember: membership?.duesPayingMember,
        eligibleForBenefits: membership?.membershipBenefitEligible,
        membershipTier,
        beganMembership: donor.contributions?.[0]?.createdAt
            ?.toISOString()
            .slice(0, 10),
        numberOfContributions: donor.contributions?.length,
        discordConfirmed: Boolean(user?.discordUsers?.length),
        nameConfirmed:
            membership?.nameConfirmed ?? user?.nameConfirmed ?? undefined,
        addressConfirmed:
            membership?.addressConfirmed ?? user?.addressConfirmed ?? undefined,
        cardPrinted: cardStatus != null ? cardStatus >= 2 : undefined,
        benefitShipped: merchStatus != null ? merchStatus >= 3 : undefined,
        packageShipped:
            merchStatus === 5
                ? 'Returned'
                : merchStatus != null && merchStatus >= 4
                  ? 'Yes'
                  : merchStatus != null
                    ? 'No'
                    : undefined,
        userMatched: Boolean(user),
    }
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
        key: 'nameConfirmed',
        header: 'Name Confirmed',
        width: '5rem',
        sortValue: (m: Member) => (m.nameConfirmed ? 1 : 0),
        render: (m: Member) => <BoolTag value={m.nameConfirmed} />,
    },
    {
        key: 'discordConfirmed',
        header: 'Discord Confirmed',
        width: '5rem',
        sortValue: (m: Member) => (m.discordConfirmed ? 1 : 0),
        render: (m: Member) => <BoolTag value={m.discordConfirmed} />,
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
    showStatus: boolean,
    showRowNumber: boolean
): ColumnEntry<Member>[] => [
    ...(showRowNumber
        ? [
              {
                  key: 'rowNumber',
                  header: '#',
                  width: '3rem',
                  render: (_m: Member, index: number) => index + 1,
              },
          ]
        : ([] as Column<Member>[])),
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
        allowOverflow: true,
        sortValue: (m: Member) => m.userName ?? m.donorName ?? '',
        render: (m: Member) => <NameValue member={m} />,
        menu: (m: Member, { closeDropdown }) => (
            <NameMenu member={m} closeDropdown={closeDropdown} />
        ),
    },
    {
        key: 'discord',
        header: 'Discord',
        width: '11rem',
        allowOverflow: true,
        sortValue: (m: Member) => m.discordUsername ?? '',
        render: (m: Member) => <DiscordValue member={m} />,
        menu: (m: Member, { closeDropdown }) => (
            <DiscordMenu member={m} closeDropdown={closeDropdown} />
        ),
    },
    {
        key: 'address',
        header: 'Address',
        width: '40rem',
        allowOverflow: true,
        sortValue: (m: Member) => m.userAddress ?? m.donorAddress ?? '',
        render: (m: Member) => <AddressValue member={m} />,
        menu: (m: Member, { closeDropdown }) => (
            <AddressMenu member={m} closeDropdown={closeDropdown} />
        ),
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
        allowOverflow: true,
        sortValue: (m: Member) => m.phone ?? '',
        render: (m: Member) => <PhoneValue member={m} />,
        menu: (m: Member, { closeDropdown }) => (
            <PhoneMenu member={m} closeDropdown={closeDropdown} />
        ),
    },
    {
        key: 'email',
        header: 'Email',
        allowOverflow: true,
        sortValue: (m: Member) => m.email ?? '',
        render: (m: Member) => <EmailValue member={m} />,
        menu: (m: Member, { closeDropdown }) => (
            <EmailMenu member={m} closeDropdown={closeDropdown} />
        ),
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
                <span className={`${styles.tag} ${styles.tagGray}`}>N/A</span>
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
        render: (m: Member) =>
            m.userId != null ? (
                <Link
                    href={`/admin/panels/members?user=${m.userId}`}
                    className={styles.userMatchedLink}
                >
                    <BoolTag value={m.userMatched} />
                </Link>
            ) : (
                <BoolTag value={m.userMatched} />
            ),
    },
]

export default function Page() {
    const { ready, onGet } = useFetch()
    const [showConfirmed, setShowConfirmed] = useState(false)
    const [showFulfilled, setShowFulfilled] = useState(true)
    const [collapseFulfillment, setCollapseFulfillment] = useState(false)
    const [showStatus, setShowStatus] = useState(false)
    const [showRowNumber, setShowRowNumber] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const columns = useMemo(
        () =>
            buildColumns(
                showConfirmed,
                showFulfilled,
                showStatus,
                showRowNumber
            ),
        [showConfirmed, showFulfilled, showStatus, showRowNumber]
    )
    const collapsedCategories = useMemo(
        () => (collapseFulfillment ? ['Fulfillment'] : []),
        [collapseFulfillment]
    )
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const membershipsQuery = useInfiniteQuery({
        queryKey: ['/actblue/memberships', { limit: 25 }],
        queryFn: ({ pageParam, signal }) =>
            onGet(
                '/actblue/memberships',
                zPaginatedResponse(zMembershipsResponsePacket),
                { query: { page: pageParam, limit: 25 }, signal }
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
    const { fetchNextPage, hasNextPage, isFetchingNextPage } = membershipsQuery

    useEffect(() => {
        const loadMoreElement = loadMoreRef.current
        if (!loadMoreElement || !hasNextPage) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFetchingNextPage)
                    void fetchNextPage()
            },
            { rootMargin: '300px' }
        )

        observer.observe(loadMoreElement)
        return () => observer.disconnect()
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    const members = useMemo(
        () =>
            (membershipsQuery.data?.pages ?? [])
                .flatMap((page) => page.data)
                .map(mapPacketToMember),
        [membershipsQuery.data]
    )
    const totalEntries = membershipsQuery.data?.pages[0]?.count

    return (
        <div className={styles.panelContents}>
            <div className={styles.panelHeader}>
                <div className={styles.breadcrumbs}>
                    <span className={styles.prominentBreadcrumb}>Admin</span>
                    <span className={styles.breadcrumbSeperator}>/</span>
                    <span className={styles.panelBreadcrumb}>Membership</span>
                </div>

                <div className={styles.panelTimestamp}>
                    Entries Loaded: {members.length.toLocaleString()}
                    {totalEntries != null &&
                        ` of ${totalEntries.toLocaleString()}`}
                </div>
            </div>
            <div className={styles.scrollView}>
                <div className={styles.galleryHeader}>
                    <div className={styles.galleryHeading}>
                        <h1 className={styles.galleryTitle}>Membership</h1>
                        <p className={styles.gallerySubTitle}>
                            Manage membership records and details.
                        </p>
                    </div>

                    <div className={styles.tableToolbar}>
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className={styles.toolbarButton}
                                    onClick={() => setIsEditing(false)}
                                >
                                    <FaSave /> Save Changes
                                </button>
                                <button
                                    type="button"
                                    className={cn(
                                        styles.toolbarButton,
                                        styles.discardButton
                                    )}
                                    onClick={() => setIsEditing(false)}
                                >
                                    <FaTrashAlt /> Discard Changes
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className={styles.toolbarButton}
                                onClick={() => setIsEditing(true)}
                            >
                                <FaEdit /> Edit
                            </button>
                        )}
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
                                            <div
                                                className={
                                                    styles.tableOptionRow
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.tableOptionLabel
                                                    }
                                                >
                                                    Row column
                                                </span>
                                                <ToggleGroup<boolean>
                                                    ariaLabel="Row Column"
                                                    orientation="horizontal"
                                                    value={showRowNumber}
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
                                                    onChange={setShowRowNumber}
                                                />
                                            </div>
                                            <div
                                                className={
                                                    styles.tableOptionRow
                                                }
                                            >
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
                                            <div
                                                className={
                                                    styles.tableOptionRow
                                                }
                                            >
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
                                            <div
                                                className={
                                                    styles.tableOptionRow
                                                }
                                            >
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
                                            <div
                                                className={
                                                    styles.tableOptionRow
                                                }
                                            >
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
                </div>

                <div className={styles.tableWrapper}>
                    <Table
                        columns={columns}
                        data={members}
                        rowKey={(m) => m.id}
                        collapsedCategories={collapsedCategories}
                        footer={
                            hasNextPage && (
                                <div
                                    className={styles.loadMore}
                                    ref={loadMoreRef}
                                >
                                    {membershipsQuery.isFetchingNextPage &&
                                        'Loading more membership records...'}
                                </div>
                            )
                        }
                    />
                </div>
            </div>
        </div>
    )
}
