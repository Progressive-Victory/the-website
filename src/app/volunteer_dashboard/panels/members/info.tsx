'use client'

import { FieldInfo, type FieldSource } from './FieldInfo'
import {
    formatPhone,
    formatUserAddress,
    joinName,
    normalizeDiscordHandle,
} from '@/app/volunteer_dashboard/panels/membership/membership.helpers'
import type {
    DescribeChange,
    UserHistoryEntry,
} from '@/app/volunteer_dashboard/panels/membership/membership.types'
import { dateService } from '@/services'
import type { User } from 'pv-contracts/data'

type Snapshot = Omit<
    UserHistoryEntry,
    | 'historyId'
    | 'historyType'
    | 'historyDataSource'
    | 'historyWhoUpdatedId'
    | 'historyWhenUpdatedUtc'
>
type Read = (snapshot: Snapshot) => string | undefined
type Donor = NonNullable<User['donors']>[number]

export const yesNo = (value?: boolean | null) =>
    value == null ? undefined : value ? 'Yes' : 'No'

const formatTimestamp = (value?: Date | null) =>
    value?.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

const formatPhoneValue = (value?: string | null) =>
    value ? formatPhone(value) : undefined

const formatBirthdate = (value?: Date | null) => {
    const iso = dateService.toISODateString(value)
    return iso
        ? new Date(iso).toLocaleDateString([], {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC',
          })
        : undefined
}

const discordUsernames: Read = (snapshot) =>
    snapshot.discordUsers?.length
        ? snapshot.discordUsers.map(({ username }) => `@${username}`).join(', ')
        : undefined

const donorDiscord = (donor: Donor) => {
    const answer = donor.contributions
        ?.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .flatMap((contribution) => contribution.customFields)
        .find((field) => field.answer.trim())
        ?.answer.trim()
    return answer ? `@${normalizeDiscordHandle(answer)}` : undefined
}

const describeWith =
    (noun: string, read: Read): DescribeChange =>
    (update, previous) => {
        const value = read(update)
        if (!value || value === (previous && read(previous))) return undefined

        return { label: `${noun} ${previous ? 'Changed' : 'Set'}`, value }
    }

const withDonor =
    (read: Read, readDonor: (donor: Donor) => string | undefined) =>
    (user: User): FieldSource[] => {
        const donor = user.donors?.[0]
        return [
            { key: 'user', label: 'User', value: read(user) },
            { key: 'donor', label: 'Donor', value: donor && readDonor(donor) },
        ]
    }

export interface InfoProps {
    user: User
    value?: string
    onSave?: () => void
}

interface InfoConfig {
    label: string
    read: Read
    sources?: ((user: User) => FieldSource[]) | false
    history?: false
    description: string
}

function ConfiguredInfo({
    config,
    user,
    value,
    onSave,
}: InfoProps & { config: InfoConfig }) {
    const { label, read } = config
    const sources =
        config.sources === false
            ? []
            : (config.sources?.(user) ?? [
                  { key: 'user', label: 'User', value: value ?? read(user) },
              ])

    return (
        <FieldInfo
            user={user}
            label={label}
            sources={sources}
            describeChange={
                config.history === false ? undefined : describeWith(label, read)
            }
            previousValue={read}
            disclaimer={config.description}
            onSave={onSave}
        />
    )
}

const defineInfo = (config: InfoConfig) => {
    const Info = (props: InfoProps) => (
        <ConfiguredInfo config={config} {...props} />
    )
    Info.displayName = `${config.label.replace(/\s/g, '')}Info`
    return Info
}

export const NameInfo = defineInfo({
    label: 'Name',
    read: (snapshot) => joinName(snapshot.firstName, snapshot.lastName),
    sources: withDonor(
        (snapshot) => joinName(snapshot.firstName, snapshot.lastName),
        (donor) => joinName(donor.firstname, donor.lastname)
    ),
    description:
        "The member's preferred first and last name. This is sourced from the member's account, or from the name on their linked ActBlue donor record.",
})

export const PronounsInfo = defineInfo({
    label: 'Pronouns',
    read: (snapshot) => snapshot.preferredPronouns ?? undefined,
    description:
        'How the member wants to be referred to. Set by the member on their account or by an organizer during memberbanking.',
})

export const DiscordInfo = defineInfo({
    label: 'Discord',
    read: discordUsernames,
    sources: withDonor(discordUsernames, donorDiscord),
    description:
        'The Discord Username of the member. Sourced from the attached Discord Account, or from the handle they entered in ActBlue when becoming a Dues Paying Member.',
})

export const PhoneInfo = defineInfo({
    label: 'Phone',
    read: (snapshot) => formatPhoneValue(snapshot.phone),
    sources: withDonor(
        (snapshot) => formatPhoneValue(snapshot.phone),
        (donor) => formatPhoneValue(donor.phone)
    ),
    description:
        'Required to join the Discord Server, phone number is sourced from the either the intake form/account page or their linked ActBlue.',
})

export const EmailInfo = defineInfo({
    label: 'Email',
    read: (snapshot) => snapshot.email ?? undefined,
    sources: (user) => [
        ...withDonor(
            (snapshot) => snapshot.email ?? undefined,
            (donor) => donor.email
        )(user),
        {
            key: 'discord',
            label: 'Discord',
            value: user.discordUsers?.[0]?.email ?? undefined,
        },
    ],
    description:
        "Sourced from the member's account, their linked ActBlue donor record, or their Discord account.",
})

export const AddressInfo = defineInfo({
    label: 'Address',
    read: (snapshot) => formatUserAddress(snapshot.address),
    sources: withDonor(
        (snapshot) => formatUserAddress(snapshot.address),
        (donor) =>
            formatUserAddress({
                addressLine1: donor.addr1,
                addressLine2: null,
                city: donor.city,
                county: null,
                state: donor.state,
                zip: donor.zip,
            })
    ),
    description:
        "Comes from the member's account or the billing address on their linked ActBlue donor record. Used to place them in a state and county and to ship membership benefits.",
})

export const DateOfBirthInfo = defineInfo({
    label: 'Date of Birth',
    read: (snapshot) => formatBirthdate(snapshot.birthdate),
    description:
        "Entered by the member during signup. Used to calculate their age and confirm they're old enough to join.",
})

export const AgeInfo = defineInfo({
    label: 'Age',
    read: (snapshot) =>
        snapshot.birthdate
            ? dateService.getAge(snapshot.birthdate)?.toString()
            : undefined,
    description:
        "Calculated from the member's date of birth. Changes whenever their date of birth is updated.",
})

export const AccountCreatedInfo = defineInfo({
    label: 'Account Created',
    read: (snapshot) => formatTimestamp(snapshot.createdAtUtc),
    history: false,
    description:
        'Date the member first created their account on the PV website.',
})

export const AliasesInfo = defineInfo({
    label: 'Aliases',
    read: (snapshot) =>
        snapshot.aliases?.length ? snapshot.aliases.join(', ') : undefined,
    sources: false,
    description:
        'Aliases are searchable. Add an alias to a member to make them easier to find.',
})

export const DiscordUsernameInfo = defineInfo({
    label: 'Discord Username',
    read: discordUsernames,
    sources: withDonor(discordUsernames, donorDiscord),
    description:
        'The username on the Discord account linked to this member, or the handle they entered on an ActBlue membership contribution.',
})

export const ServerNicknameInfo = defineInfo({
    label: 'Server Nickname',
    read: () => undefined,
    description:
        "The member's nickname inside the Discord server. Not available yet.",
})

export const DiscordIdInfo = defineInfo({
    label: 'Discord ID',
    read: (snapshot) => snapshot.discordUsers?.[0]?.id,
    description:
        "Discord's permanent ID for the member's linked account. Set when they link Discord and stays the same if they change usernames.",
})

export const DiscordEmailInfo = defineInfo({
    label: 'Discord Email',
    read: (snapshot) => snapshot.discordUsers?.[0]?.email ?? undefined,
    description:
        "The email on the member's Discord account, provided by Discord when they link it.",
})

export const CurrentlyInServerInfo = defineInfo({
    label: 'Currently In Server',
    read: () => undefined,
    sources: false,
    description:
        'Checked live against the Discord server each time this member is opened.',
})

export const JoinedServerInfo = defineInfo({
    label: 'Joined Server',
    read: (snapshot) => formatTimestamp(snapshot.joinedAtUtc),
    description: 'Recorded when the member joined the Discord server.',
})

export const DuesPayingMemberInfo = defineInfo({
    label: 'Dues Paying Member',
    read: (snapshot) => yesNo(snapshot.duesPayingMember),
    sources: withDonor(
        (snapshot) => yesNo(snapshot.duesPayingMember),
        (donor) => yesNo(donor.membershipData?.duesPayingMember)
    ),
    description:
        "Comes from the member's account or their linked donor's membership record. Set when they make a dues-paying membership contribution.",
})

export const HasActiveRecurringInfo = defineInfo({
    label: 'Has Active Recurring',
    read: () => undefined,
    description:
        "Calculated from the member's linked ActBlue contributions. Yes when they have a recurring contribution that hasn't ended.",
})

export const MembershipBenefitsInfo = defineInfo({
    label: 'Membership Benefits',
    read: (snapshot) => yesNo(snapshot.membershipBenefitEligible),
    sources: withDonor(
        (snapshot) => yesNo(snapshot.membershipBenefitEligible),
        (donor) => yesNo(donor.membershipData?.membershipBenefitEligible)
    ),
    description:
        "Comes from the member's account or their linked donor's membership record. Decides whether they receive a membership card and merch.",
})

export const ShirtSizeInfo = defineInfo({
    label: 'Shirt Size',
    read: (snapshot) => snapshot.shirtSize ?? undefined,
    sources: withDonor(
        (snapshot) => snapshot.shirtSize ?? undefined,
        (donor) => donor.membershipData?.shirtSize ?? undefined
    ),
    description:
        "Comes from the member's account or their linked donor's membership record. Used when shipping membership merch.",
})

export const VerifiedInfo = defineInfo({
    label: 'Verified',
    read: (snapshot) => yesNo(snapshot.verified),
    description:
        'Set once the member confirms their phone number with a text message code during signup.',
})

export const OnboardingStageInfo = defineInfo({
    label: 'Onboarding Stage',
    read: (snapshot) => snapshot.onboardingStage,
    description:
        'Where the member is in signup. Updated automatically as they complete each step.',
})

export const AccountStatusCreatedInfo = AccountCreatedInfo

export const CompletedSignupInfo = defineInfo({
    label: 'Completed Signup',
    read: (snapshot) => formatTimestamp(snapshot.completedIntakeUtc),
    description: 'Recorded when the member finished every signup step.',
})

export const JoinedDiscordServerInfo = defineInfo({
    label: 'Joined Discord Server',
    read: (snapshot) => formatTimestamp(snapshot.joinedAtUtc),
    description: 'Recorded when the member joined the Discord server.',
})

export const AcceptedAlertsInfo = defineInfo({
    label: 'Accepted Alerts',
    read: (snapshot) => yesNo(snapshot.acceptedAlerts),
    description:
        'Whether the member opted in to receive alerts. Set by the member during signup.',
})
