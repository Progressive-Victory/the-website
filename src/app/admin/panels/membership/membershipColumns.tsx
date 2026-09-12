'use client'

import { BoolTag, EditableBoolTag } from './components/Tags'
import tags from './components/Tags.module.css'
import { MembershipTableOptions, useMemberDraft } from './hooks'
import {
    hasAddressDraftChange,
    hasNameDraftChange,
    hasDiscordDraftChange,
} from './membership.helpers'
import {
    EditController,
    Member,
    MemberEdits,
    MemberFlag,
    MembershipTableMode,
    MembershipTier,
    PackageShipped,
} from './membership.types'
import {
    AddressEdit,
    AddressMenu,
    AddressValue,
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
} from './membershipCells'
import styles from './page.module.css'
import { Column, ColumnEntry } from '@/components/common/table'
import { cn } from '@/util'
import Link from 'next/link'

const membershipTierClass: Record<MembershipTier, string> = {
    'Dues Paying Member': tags.tagMember,
    'Premium Member': tags.tagPremium,
    'Signature Member': tags.tagSignature,
    'Inner Circle Member': tags.tagInnerCircle,
}

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

const FlagEdit = ({
    member,
    edit,
    config: { key, header, resolveDraft },
}: {
    member: Member
    edit: EditController
    config: FlagColumnConfig
}) => {
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

export const buildColumns = ({
    options,
    tableMode,
    edit,
    onMatchUser,
}: {
    options: MembershipTableOptions
    tableMode: MembershipTableMode
    edit: EditController
    onMatchUser: (member: Member) => void
}): ColumnEntry<Member>[] => {
    const { showConfirmed, showStatus, showRowNumber } = options
    const showFulfilledTag = options.showFulfilled && tableMode === 'view'

    return [
        ...(showRowNumber ? [rowNumberColumn] : []),
        ...(showStatus ? statusColumns : []),
        {
            key: 'membershipTier',
            header: 'Tier',
            width: '11rem',
            sortValue: (m) => m.membershipTier ?? '',
            render: (m) =>
                m.membershipTier ? (
                    <span
                        className={cn(
                            tags.tag,
                            tags.tagTier,
                            membershipTierClass[m.membershipTier]
                        )}
                    >
                        {m.membershipTier}
                    </span>
                ) : (
                    '—'
                ),
        },
        {
            label: FULFILLMENT_CATEGORY,
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
            render: (m) => <NameValue member={m} />,
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
            render: (m) => <DiscordValue member={m} />,
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
            sortValue: (m) => m.beganMembership ?? '',
            render: (m) => {
                if (!m.beganMembership) return '—'
                const [y, mo, d] = m.beganMembership.split('-')
                return `${mo}-${d}-${y}`
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
            render: (m) => <EmailValue member={m} />,
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
            sortValue: (m) => m.shirtSize ?? '',
            render: (m) => <ShirtSizeValue member={m} />,
            renderEdit: (m) => <ShirtSizeEdit member={m} edit={edit} />,
        },
        {
            key: 'membershipAmount',
            header: 'Amount',
            width: '6rem',
            sortValue: (m) => m.membershipAmount ?? 0,
            render: (m) =>
                m.membershipAmount != null ? `$${m.membershipAmount}` : '—',
        },
        {
            key: 'contributions',
            header: 'Contributions',
            width: '6rem',
            sortValue: (m) => m.numberOfContributions ?? 0,
            render: (m) => m.numberOfContributions?.toString() ?? '—',
        },
        {
            key: 'userMatched',
            header: 'User Matched',
            width: '5rem',
            sortValue: (m) => (m.userMatched ? 1 : 0),
            render: (m) =>
                m.userId != null ? (
                    <Link
                        href={`/admin/panels/members?user=${m.userId}`}
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
