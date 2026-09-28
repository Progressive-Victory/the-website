'use client'

import { ContributionsMenu } from './components/ContributionsMenu'
import { BoolTag, EditableBoolTag } from './components/Tags'
import tags from './components/Tags.module.css'
import {
    TierHistoryMenu,
    AmountHistoryMenu,
} from './components/TierHistoryMenu'
import { MembershipTableOptions, useMemberDraft } from './hooks'
import {
    hasAddressDraftChange,
    hasNameDraftChange,
    hasDiscordDraftChange,
    matchesSearchQuery,
} from './membership.helpers'
import {
    EditController,
    Member,
    MemberEdits,
    MemberEditProps,
    MemberFlag,
    MembershipTier,
    MembershipSearchField,
    PackageShipped,
} from './membership.types'
import {
    AddressEdit,
    AddressMenu,
    AddressValue,
    AmountValue,
    DiscordMenu,
    DiscordValue,
    EmailEdit,
    EmailMenu,
    EmailValue,
    NameEdit,
    NameMenu,
    NameValue,
    PackageShippedEdit,
    PackageShippedValue,
    PhoneEdit,
    PhoneMenu,
    PhoneValue,
    ShirtSizeEdit,
    ShirtSizeValue,
    TotalAmountValue,
} from './membershipCells'
import styles from './page.module.css'
import { Column, ColumnEntry } from '@/components/common/table'
import { cn } from '@/util'
import Link from 'next/link'
import { ShirtSize } from 'pv-contracts/data'

const monthAbbreviations = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]

const ordinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th'
    switch (day % 10) {
        case 1:
            return 'st'
        case 2:
            return 'nd'
        case 3:
            return 'rd'
        default:
            return 'th'
    }
}

const formatOrdinalDate = (isoDate: string) => {
    const [y, mo, d] = isoDate.slice(0, 10).split('-')
    const day = Number(d)
    return `${monthAbbreviations[Number(mo) - 1]}. ${day}${ordinalSuffix(day)}, ${y}`
}

const membershipTierClass: Record<MembershipTier, string> = {
    'Dues Paying Member': tags.tagMember,
    'Premium Member': tags.tagPremium,
    'Signature Member': tags.tagSignature,
    'Inner Circle Member': tags.tagInnerCircle,
}

const membershipTierRank: Record<MembershipTier, number> = {
    'Inner Circle Member': 4,
    'Signature Member': 3,
    'Premium Member': 2,
    'Dues Paying Member': 1,
}

const shirtSizeRank: Record<ShirtSize, number> = {
    [ShirtSize.DoubleExtraLarge]: 0,
    [ShirtSize.ExtraLarge]: 1,
    [ShirtSize.Large]: 2,
    [ShirtSize.Medium]: 3,
    [ShirtSize.Small]: 4,
    [ShirtSize.ExtraSmall]: 5,
}

const NO_SHIRT_SIZE_RANK = Object.keys(shirtSizeRank).length

const DOT_COLOR_TRUE = 'rgba(112, 195, 32, 0.6)'
const DOT_COLOR_FALSE = 'rgba(255, 95, 75, 0.6)'

const packageShippedDotColor: Record<PackageShipped, string> = {
    Yes: DOT_COLOR_TRUE,
    No: DOT_COLOR_FALSE,
    Returned: 'rgba(255, 168, 0, 0.6)',
    'Not Received': 'rgba(177, 2, 2, 1)',
    Canceled: 'rgba(42, 155, 225, 0.6)',
}

const statusDotColor = (m: Member, col: Column<Member>): string =>
    col.key === 'packageShipped'
        ? packageShippedDotColor[m.packageShipped ?? 'No']
        : m[col.key as MemberFlag]
          ? DOT_COLOR_TRUE
          : DOT_COLOR_FALSE

interface FlagColumnConfig {
    key: MemberFlag
    header: string
    resolveDraft?: (member: Member, draft: MemberEdits) => boolean
    menu?: (
        member: Member,
        controls: { closeDropdown: () => void }
    ) => React.ReactNode
}

interface FlagEditProps extends MemberEditProps {
    config: FlagColumnConfig
}

const FlagEdit = ({
    member,
    edit,
    config: { key, header, resolveDraft },
}: FlagEditProps) => {
    const draft = useMemberDraft(edit, member)
    const value = resolveDraft
        ? resolveDraft(member, draft)
        : (draft[key] ?? member[key] ?? false)

    return (
        <EditableBoolTag
            label={header}
            value={value}
            onToggle={() => edit.update(member, { [key]: !value })}
        />
    )
}

const flagColumn = (
    edit: EditController,
    config: FlagColumnConfig
): Column<Member> => ({
    key: config.key,
    header: config.header,
    width: '5rem',
    allowOverflow: true,
    sortValue: (m) => (m[config.key] ? 1 : 0),
    render: (m) => <BoolTag value={m[config.key]} />,
    renderEdit: (m) => <FlagEdit member={m} edit={edit} config={config} />,
    menu: config.menu,
})

const readOnlyBoolColumn = (
    key: 'eligibleForBenefits' | 'isMember',
    header: string
): Column<Member> => ({
    key,
    header,
    width: '5rem',
    sortValue: (m) => (m[key] ? 1 : 0),
    render: (m) => <BoolTag value={m[key]} />,
})

const confirmedColumnConfigs: FlagColumnConfig[] = [
    {
        key: 'nameConfirmed',
        header: 'Name Confirmed',
        resolveDraft: (m, draft) =>
            draft.nameConfirmed ??
            (hasNameDraftChange(m, draft) ? false : (m.nameConfirmed ?? false)),
    },
    {
        key: 'discordConfirmed',
        header: 'Discord Confirmed',
        resolveDraft: (m, draft) =>
            draft.discordConfirmed ??
            (hasDiscordDraftChange(m, draft)
                ? false
                : (m.discordConfirmed ?? false)),
    },
    {
        key: 'addressConfirmed',
        header: 'Address Confirmed',
        resolveDraft: (m, draft) =>
            draft.addressConfirmed ??
            (hasAddressDraftChange(m, draft)
                ? false
                : (m.addressConfirmed ?? false)),
    },
]

const fulfillmentColumnConfigs: FlagColumnConfig[] = [
    { key: 'cardPrinted', header: 'Card Printed' },
    { key: 'labelPrinted', header: 'Label Printed' },
    { key: 'cardPacked', header: 'Items Packed' },
    { key: 'benefitShipped', header: 'Benefit Shipped' },
]

const statusColumns: Column<Member>[] = [
    readOnlyBoolColumn('eligibleForBenefits', 'Eligible'),
    readOnlyBoolColumn('isMember', 'Member'),
]

const rowNumberColumn: Column<Member> = {
    key: 'rowNumber',
    header: '#',
    width: '3rem',
    reorderable: false,
    render: (_m, index) => index + 1,
}

const isFullyFulfilled = (m: Member, requireConfirmations: boolean) =>
    Boolean(
        (!requireConfirmations ||
            (m.discordConfirmed && m.nameConfirmed && m.addressConfirmed)) &&
        m.cardPrinted &&
        m.labelPrinted &&
        m.cardPacked &&
        m.benefitShipped &&
        m.packageShipped === 'Yes'
    )

export const FULFILLMENT_CATEGORY = 'Fulfillment'

export interface BuildColumnsArgs {
    options: MembershipTableOptions
    isEditing: boolean
    edit: EditController
    onMatchUser: (member: Member) => void
    searchQuery?: string
    searchField?: MembershipSearchField
}

export const buildColumns = ({
    options,
    isEditing,
    edit,
    onMatchUser,
    searchQuery = '',
    searchField = 'name',
}: BuildColumnsArgs): ColumnEntry<Member>[] => {
    const { showConfirmed, showStatus, showRowNumber } = options
    const showFulfilledTag = options.showFulfilled && !isEditing
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const nameQuery = searchField === 'name' ? normalizedQuery : ''
    const discordQuery = searchField === 'discord' ? normalizedQuery : ''
    const emailQuery = searchField === 'email' ? normalizedQuery : ''
    const matchesSearch = (m: Member) =>
        matchesSearchQuery(m, normalizedQuery, searchField)
    const searchCellClass = (field: MembershipSearchField) => (m: Member) =>
        searchField === field && matchesSearch(m)
            ? styles.nameCellMatch
            : undefined

    return [
        ...(showRowNumber ? [rowNumberColumn] : []),
        ...(showStatus ? statusColumns : []),
        {
            key: 'membershipTier',
            header: 'Tier',
            width: '11rem',
            allowOverflow: true,
            sortValue: (m) => {
                const tier = m.recurringSummary?.tier
                return tier ? membershipTierRank[tier] : 0
            },
            menu: (m, { closeDropdown }) => (
                <TierHistoryMenu member={m} closeDropdown={closeDropdown} />
            ),
            render: (m) => {
                const tier = m.recurringSummary?.tier
                return tier ? (
                    <span
                        className={cn(
                            tags.tag,
                            tags.tagTier,
                            membershipTierClass[tier]
                        )}
                    >
                        {tier}
                    </span>
                ) : (
                    <span className={cn(tags.tag, tags.tagTier, tags.tagGhost)}>
                        Not A Member
                    </span>
                )
            },
        },
        {
            key: FULFILLMENT_CATEGORY,
            collapsedWidth: '6rem',
            dotColor: statusDotColor,
            rowRender: showFulfilledTag
                ? (m) =>
                      isFullyFulfilled(m, showConfirmed) ? (
                          <span
                              className={cn(
                                  tags.tag,
                                  tags.tagGreen,
                                  tags.tagFulfilled
                              )}
                          >
                              Benefits Fulfilled
                          </span>
                      ) : null
                : undefined,
            columns: [
                ...(showConfirmed
                    ? confirmedColumnConfigs.map((config) =>
                          flagColumn(edit, config)
                      )
                    : []),
                ...fulfillmentColumnConfigs.map((config) =>
                    flagColumn(edit, config)
                ),
                {
                    key: 'packageShipped',
                    header: 'Package Shipped',
                    width: '7rem',
                    allowOverflow: true,
                    sortValue: (m) => m.packageShipped ?? '',
                    render: (m) => <PackageShippedValue member={m} />,
                    renderEdit: (m) => (
                        <PackageShippedEdit member={m} edit={edit} />
                    ),
                },
            ],
        },
        {
            key: 'name',
            header: 'Name',
            width: '11rem',
            allowOverflow: true,
            sortValue: (m) => m.userName ?? m.donorName ?? '',
            render: (m) => <NameValue member={m} searchQuery={nameQuery} />,
            cellClassName: searchCellClass('name'),
            renderEdit: (m) => <NameEdit member={m} edit={edit} />,
            menu: (m, { closeDropdown }) => (
                <NameMenu member={m} closeDropdown={closeDropdown} />
            ),
        },
        {
            key: 'discord',
            header: 'Discord',
            width: '11rem',
            allowOverflow: true,
            sortValue: (m) => m.discordUsername ?? '',
            render: (m) => (
                <DiscordValue member={m} searchQuery={discordQuery} />
            ),
            cellClassName: searchCellClass('discord'),
            menu: (m, { closeDropdown }) => (
                <DiscordMenu member={m} closeDropdown={closeDropdown} />
            ),
        },
        {
            key: 'address',
            header: 'Address',
            width: '40rem',
            allowOverflow: true,
            sortValue: (m) => m.userAddress ?? m.donorAddress ?? '',
            render: (m) => <AddressValue member={m} />,
            renderEdit: (m) => <AddressEdit member={m} edit={edit} />,
            menu: (m, { closeDropdown }) => (
                <AddressMenu member={m} closeDropdown={closeDropdown} />
            ),
        },
        {
            key: 'beganMembership',
            header: 'Member Since',
            sortValue: (m) => m.recurringSummary?.earliestLineitemDate ?? '',
            render: (m) => {
                const date = m.recurringSummary?.earliestLineitemDate
                if (!date)
                    return (
                        <span
                            className={cn(
                                tags.tag,
                                tags.tagWide,
                                tags.tagGhost
                            )}
                        >
                            Not A Member
                        </span>
                    )
                return (
                    <span className={cn(tags.tag, tags.tagWide, tags.tagGray)}>
                        {formatOrdinalDate(date)}
                    </span>
                )
            },
        },
        {
            key: 'phone',
            header: 'Phone',
            width: '11rem',
            allowOverflow: true,
            sortValue: (m) => m.phone ?? '',
            render: (m) => <PhoneValue member={m} />,
            renderEdit: (m) => <PhoneEdit member={m} edit={edit} />,
            menu: (m, { closeDropdown }) => (
                <PhoneMenu member={m} closeDropdown={closeDropdown} />
            ),
        },
        {
            key: 'email',
            header: 'Email',
            width: '14rem',
            allowOverflow: true,
            sortValue: (m) => m.email ?? '',
            render: (m) => <EmailValue member={m} searchQuery={emailQuery} />,
            cellClassName: searchCellClass('email'),
            renderEdit: (m) => <EmailEdit member={m} edit={edit} />,
            menu: (m, { closeDropdown }) => (
                <EmailMenu member={m} closeDropdown={closeDropdown} />
            ),
        },
        {
            key: 'shirtSize',
            header: 'Shirt',
            width: '5rem',
            allowOverflow: true,
            sortValue: (m) =>
                m.shirtSize ? shirtSizeRank[m.shirtSize] : NO_SHIRT_SIZE_RANK,
            render: (m) => <ShirtSizeValue member={m} />,
            renderEdit: (m) => <ShirtSizeEdit member={m} edit={edit} />,
        },
        {
            key: 'membershipAmount',
            header: 'Amount',
            width: '6rem',
            allowOverflow: true,
            sortValue: (m) => m.recurringSummary?.activeAmount ?? 0,
            render: (m) => <AmountValue member={m} />,
            menu: (m, { closeDropdown }) => (
                <AmountHistoryMenu member={m} closeDropdown={closeDropdown} />
            ),
        },
        {
            key: 'totalAmount',
            header: 'Total Amount',
            width: '7rem',
            sortValue: (m) => m.recurringSummary?.totalAmount ?? 0,
            render: (m) => <TotalAmountValue member={m} />,
        },
        {
            key: 'contributionsReal',
            header: 'Contributions',
            width: '6rem',
            sortValue: (m) => m.recurringSummary?.monthsWithLineitems ?? 0,
            render: (m) =>
                (m.recurringSummary?.monthsWithLineitems ?? 0).toString(),
            menu: (m, { closeDropdown }) => (
                <ContributionsMenu
                    member={m}
                    closeDropdown={closeDropdown}
                    onlyRecurring
                />
            ),
        },
        {
            key: 'userMatched',
            header: 'User Matched',
            width: '5rem',
            sortValue: (m) => (m.userMatched ? 1 : 0),
            render: (m) =>
                m.userId != null ? (
                    <Link
                        href={`/volunteer_dashboard/panels/members?userId=${m.userId}`}
                        className={styles.userMatchedLink}
                    >
                        <BoolTag value={m.userMatched} />
                    </Link>
                ) : (
                    <button
                        type="button"
                        className={styles.userMatchedLink}
                        aria-label="Match user"
                        onClick={() => onMatchUser(m)}
                    >
                        <BoolTag value={m.userMatched} />
                    </button>
                ),
        },
    ]
}
