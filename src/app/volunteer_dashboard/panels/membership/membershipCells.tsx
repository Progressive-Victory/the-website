'use client'

import { EditableSelectTag } from './components/EditableSelectTag'
import { SourceMenu } from './components/SourceMenu'
import { ConfirmedBadge } from './components/Tags'
import tags from './components/Tags.module.css'
import { useMemberDraft } from './hooks'
import {
    describeAddressChange,
    describeEmailChange,
    describeNameChange,
    describePhoneChange,
    formatPhone,
    isValidAddressField,
    isValidPhone,
    normalizeDiscordHandle,
    normalizeEmail,
    normalizePhone,
    resolveSelectDraft,
} from './membership.helpers'
import {
    AddressField,
    Member,
    MemberEditProps,
    MemberMenuProps,
    MemberValueProps,
    PackageShipped,
    ShirtSize,
} from './membership.types'
import styles from './membershipCells.module.css'
import { cn } from '@/util'

const NoLinkedUser = () => (
    <span className={styles.editUnavailable}>No linked user</span>
)

export const NameValue = ({ member }: MemberValueProps) => (
    <span className={styles.nameCell}>
        <span>{member.userName ?? member.donorName ?? '—'}</span>
        <ConfirmedBadge label="Name" confirmed={member.nameConfirmed} />
    </span>
)

const nameInputs = [
    {
        key: 'userFirstName',
        label: 'User first name',
        saved: (m: Member) => m.userFirstName ?? '',
        placeholder: (m: Member) => m.firstName ?? 'First name',
    },
    {
        key: 'userLastName',
        label: 'User last name',
        saved: (m: Member) => m.userLastName ?? '',
        placeholder: (m: Member) => m.lastName ?? 'Last name',
    },
] as const

export const NameEdit = ({ member, edit }: MemberEditProps) => {
    const draft = useMemberDraft(edit, member)

    if (member.userId == null) return <NoLinkedUser />

    return (
        <div className={styles.editNameRow}>
            {nameInputs.map(({ key, label, saved, placeholder }) => {
                const original = saved(member)
                const value = draft[key] ?? original

                return (
                    <input
                        key={key}
                        type="text"
                        aria-label={label}
                        maxLength={100}
                        className={cn(
                            styles.editInput,
                            styles.editNameInput,
                            value.trim() !== original.trim() &&
                                styles.editInputDirty
                        )}
                        value={value}
                        placeholder={placeholder(member)}
                        onChange={(event) =>
                            edit.update(member, { [key]: event.target.value })
                        }
                    />
                )
            })}
        </div>
    )
}

export const NameMenu = ({ member, closeDropdown }: MemberMenuProps) => (
    <SourceMenu
        member={member}
        title="Names"
        overlayWidth="28rem"
        labelWidth="4rem"
        onClose={closeDropdown}
        confirmed={member.nameConfirmed}
        sources={[
            { label: 'User', value: member.userName },
            { label: 'Donor', value: member.donorName },
        ]}
        history={{
            title: 'Recent Name Changes',
            emptyMessage: 'No name changes found',
            describeChange: describeNameChange,
        }}
    />
)

export const DiscordValue = ({ member }: MemberValueProps) => {
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

export const DiscordMenu = ({ member, closeDropdown }: MemberMenuProps) => (
    <SourceMenu
        member={member}
        title="Discord"
        overlayWidth="20rem"
        labelWidth="6rem"
        onClose={closeDropdown}
        format={(handle) => `@${normalizeDiscordHandle(handle)}`}
        normalize={normalizeDiscordHandle}
        confirmed={member.discordConfirmed}
        confirmedSource="Discord"
        sources={[
            { label: 'Discord', value: member.discordUsername },
            { label: 'Contribution', value: member.contributionDiscord },
        ]}
    />
)

export const AddressValue = ({ member }: MemberValueProps) => (
    <span className={styles.nameCell}>
        <span>{member.userAddress ?? member.donorAddress ?? '—'}</span>
        <ConfirmedBadge label="Address" confirmed={member.addressConfirmed} />
    </span>
)

const addressInputs: {
    key: AddressField
    label: string
    placeholder: (member: Member) => string
    maxLength: number
    className: string
}[] = [
    {
        key: 'addressLine1',
        label: 'Address line 1',
        placeholder: (m) => m.address1 ?? 'Address line 1',
        maxLength: 100,
        className: styles.editAddressLine1,
    },
    {
        key: 'addressLine2',
        label: 'Address line 2',
        placeholder: () => 'Apt, suite',
        maxLength: 100,
        className: styles.editAddressLine2,
    },
    {
        key: 'city',
        label: 'City',
        placeholder: (m) => m.city ?? 'City',
        maxLength: 50,
        className: styles.editAddressCity,
    },
    {
        key: 'state',
        label: 'State',
        placeholder: (m) => m.state ?? 'ST',
        maxLength: 2,
        className: styles.editAddressState,
    },
    {
        key: 'zip',
        label: 'Zip',
        placeholder: (m) => m.zip?.slice(0, 5) ?? 'Zip',
        maxLength: 5,
        className: styles.editAddressZip,
    },
]

export const AddressEdit = ({ member, edit }: MemberEditProps) => {
    const draft = useMemberDraft(edit, member).address ?? {}

    if (member.userId == null) return <NoLinkedUser />

    return (
        <div className={styles.editAddressRow}>
            {addressInputs.map(
                ({ key, label, placeholder, maxLength, className }) => {
                    const original = member.userAddressParts?.[key] ?? ''
                    const value = draft[key] ?? original
                    const invalid = !isValidAddressField(key, value)

                    return (
                        <input
                            key={key}
                            aria-label={label}
                            aria-invalid={invalid}
                            maxLength={maxLength}
                            className={cn(
                                styles.editInput,
                                styles.editAddressInput,
                                className,
                                !invalid &&
                                    value.trim() !== original.trim() &&
                                    styles.editInputDirty,
                                invalid && styles.editInputInvalid
                            )}
                            value={value}
                            placeholder={placeholder(member)}
                            onChange={(event) =>
                                edit.update(member, {
                                    address: {
                                        ...draft,
                                        [key]: event.target.value,
                                    },
                                })
                            }
                        />
                    )
                }
            )}
        </div>
    )
}

export const AddressMenu = ({ member, closeDropdown }: MemberMenuProps) => (
    <SourceMenu
        member={member}
        title="Addresses"
        overlayWidth="30rem"
        labelWidth="4rem"
        onClose={closeDropdown}
        sources={[
            { label: 'User', value: member.userAddress },
            { label: 'Donor', value: member.donorAddress },
        ]}
        history={{
            title: 'Recent Address Changes',
            emptyMessage: 'No address changes found',
            describeChange: describeAddressChange,
        }}
    />
)

export const PhoneValue = ({ member }: MemberValueProps) => (
    <span className={styles.valueCell}>
        {formatPhone(member.userPhone ?? member.donorPhone)}
    </span>
)

export const PhoneEdit = ({ member, edit }: MemberEditProps) => {
    const draft = useMemberDraft(edit, member).userPhone

    if (member.userId == null) return <NoLinkedUser />

    const original = member.userPhone ?? ''
    const invalid = !isValidPhone(draft ?? original)

    return (
        <input
            type="tel"
            inputMode="numeric"
            maxLength={15}
            aria-label="User phone"
            aria-invalid={invalid}
            className={cn(
                styles.editInput,
                !invalid &&
                    draft != null &&
                    normalizePhone(draft) !== normalizePhone(original) &&
                    styles.editInputDirty,
                invalid && styles.editInputInvalid
            )}
            value={draft ?? original}
            placeholder={member.donorPhone ?? 'Add phone'}
            onChange={(event) =>
                edit.update(member, {
                    userPhone: normalizePhone(event.target.value),
                })
            }
        />
    )
}

export const PhoneMenu = ({ member, closeDropdown }: MemberMenuProps) => (
    <SourceMenu
        member={member}
        title="Phone Numbers"
        overlayWidth="24rem"
        labelWidth="3.5rem"
        onClose={closeDropdown}
        format={formatPhone}
        normalize={formatPhone}
        sources={[
            { label: 'User', value: member.userPhone },
            { label: 'Donor', value: member.donorPhone },
        ]}
        history={{
            title: 'Recent Phone Changes',
            emptyMessage: 'No phone changes found',
            describeChange: describePhoneChange,
        }}
    />
)

export const EmailValue = ({ member }: MemberValueProps) => (
    <span className={styles.valueCell}>
        {member.userEmail ?? member.discordEmail ?? member.donorEmail ?? '—'}
    </span>
)

export const EmailEdit = ({ member, edit }: MemberEditProps) => {
    const userEmailDraft = useMemberDraft(edit, member).userEmail

    if (member.userId == null) return <NoLinkedUser />

    const original = member.userEmail ?? ''
    const value = userEmailDraft ?? original

    return (
        <input
            type="email"
            aria-label="User email"
            className={cn(
                styles.editInput,
                value.trim() !== original && styles.editInputDirty
            )}
            value={value}
            placeholder={
                member.discordEmail ?? member.donorEmail ?? 'Add email'
            }
            onChange={(event) =>
                edit.update(member, { userEmail: event.target.value })
            }
        />
    )
}

export const EmailMenu = ({ member, closeDropdown }: MemberMenuProps) => (
    <SourceMenu
        member={member}
        title="Email Addresses"
        overlayWidth="28rem"
        labelWidth="5rem"
        onClose={closeDropdown}
        normalize={normalizeEmail}
        sources={[
            { label: 'User', value: member.userEmail },
            { label: 'Discord', value: member.discordEmail },
            { label: 'Donor', value: member.donorEmail },
        ]}
        history={{
            title: 'Recent Email Changes',
            emptyMessage: 'No email changes found',
            describeChange: describeEmailChange,
        }}
    />
)

const shirtSizes: ShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const shirtSizeClass: Record<ShirtSize, string> = {
    XS: tags.tagRed,
    S: tags.tagOrange,
    M: tags.tagYellow,
    L: tags.tagGreen,
    XL: tags.tagBlue,
    XXL: tags.tagPurple,
}

export const ShirtSizeValue = ({ member }: MemberValueProps) =>
    member.shirtSize ? (
        <span className={cn(tags.tag, shirtSizeClass[member.shirtSize])}>
            {member.shirtSize}
        </span>
    ) : (
        <span className={cn(tags.tag, tags.tagGray)}>N/A</span>
    )

export const ShirtSizeEdit = ({ member, edit }: MemberEditProps) => {
    const { value, dirty } = resolveSelectDraft(
        useMemberDraft(edit, member).shirtSize,
        member.shirtSize
    )

    return (
        <EditableSelectTag
            ariaLabel="Shirt size"
            variant="compact"
            value={value}
            options={shirtSizes}
            optionClass={shirtSizeClass}
            dirty={dirty}
            allowClear
            onSelect={(shirtSize) => edit.update(member, { shirtSize })}
        />
    )
}

const packageShippedOptions: PackageShipped[] = [
    'Yes',
    'No',
    'Returned',
    'Not Received',
    'Canceled',
]

const packageShippedClass: Record<PackageShipped, string> = {
    Yes: tags.tagGreen,
    No: tags.tagRed,
    Returned: tags.tagYellow,
    'Not Received': tags.tagDarkRed,
    Canceled: tags.tagBlue,
}

export const PackageShippedValue = ({ member }: MemberValueProps) =>
    member.packageShipped ? (
        <span
            className={cn(
                tags.tag,
                tags.tagWide,
                packageShippedClass[member.packageShipped]
            )}
        >
            {member.packageShipped}
        </span>
    ) : (
        '—'
    )

export const PackageShippedEdit = ({ member, edit }: MemberEditProps) => {
    const { value, dirty } = resolveSelectDraft(
        useMemberDraft(edit, member).packageShipped,
        member.packageShipped
    )

    return (
        <EditableSelectTag
            ariaLabel="Package shipped"
            variant="wide"
            menuLabel="Status"
            value={value}
            options={packageShippedOptions}
            optionClass={packageShippedClass}
            dirty={dirty}
            onSelect={(packageShipped) =>
                edit.update(member, { packageShipped })
            }
        />
    )
}
