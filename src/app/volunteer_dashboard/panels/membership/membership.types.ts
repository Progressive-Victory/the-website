import { PackageShipped } from '@/util'
import {
    MembershipDeliverableStatus,
    ShirtSize,
    User,
    UserAddress,
} from 'pv-contracts/data'
import {
    UpdateMembershipRequest,
    UpdateUserRequest,
} from 'pv-contracts/requests'
import { MembershipsResponsePacket } from 'pv-contracts/responses'

export const membershipTiers = [
    'Dues Paying Member',
    'Premium Member',
    'Signature Member',
    'Inner Circle Member',
] as const

export type MembershipTier = (typeof membershipTiers)[number]

export interface ContributionRecord {
    orderNumber: string
    createdAt: string
    amount: number
    contributionForm: string
    lineitemCount: number
    isRecurring: boolean
    recurringAmount?: number
    firstLineitemId?: number
    mostRecentLineitemDate?: string
    mostRecentLineitemAmount?: number
    earliestLineitemDate?: string
    monthsSpanned?: number
    monthsWithLineitems?: number
    lineitemMonths?: string[]
    lineitemCountsByMonth?: Record<string, number>
    lineitemsByMonth?: Record<
        string,
        { paidAt: string; amount: number; orderNumber: string }[]
    >
}

export interface RecurringSummary {
    monthsWithLineitems: number
    earliestLineitemDate?: string
    activeAmount?: number
    totalAmount: number
    tier?: MembershipTier
}

export interface TierSegment {
    tier?: MembershipTier
    from: string
    to: string
    payments: number
    minAmount: number
    maxAmount: number
}

export { packageShippedOptions } from '@/util'
export type { PackageShipped }

export interface Member {
    packet: MembershipsResponsePacket
    id: number
    userId?: number
    firstName?: string
    lastName?: string
    userFirstName?: string
    userLastName?: string
    userName?: string
    donorName?: string
    discordUsername?: string
    contributionDiscord?: string
    phone?: string
    userPhone?: string
    donorPhone?: string
    email?: string
    userEmail?: string
    discordEmail?: string
    donorEmail?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    userAddress?: string
    userAddressParts?: UserAddress
    donorAddress?: string
    shirtSize?: ShirtSize

    isMember?: boolean
    eligibleForBenefits?: boolean
    beganMembership?: string
    membershipAmount?: number
    membershipTier?: MembershipTier
    numberOfContributions?: number
    contributionRecords?: ContributionRecord[]
    recurringSummary?: RecurringSummary
    nameUpdatedAt?: Date

    discordConfirmed?: boolean
    nameConfirmed?: boolean
    addressConfirmed?: boolean
    cardPrinted?: boolean
    labelPrinted?: boolean
    cardPacked?: boolean
    benefitShipped?: boolean
    membershipCardStatus?: MembershipDeliverableStatus
    membershipMerchStatus?: MembershipDeliverableStatus
    packageShipped?: PackageShipped

    userMatched?: boolean
}

export const membershipSearchFields = [
    { value: 'name', label: 'Name' },
    { value: 'discord', label: 'Discord' },
    { value: 'email', label: 'Email' },
] as const

export type MembershipSearchField =
    (typeof membershipSearchFields)[number]['value']
export type MemberFlag =
    | 'nameConfirmed'
    | 'discordConfirmed'
    | 'addressConfirmed'
    | 'cardPrinted'
    | 'labelPrinted'
    | 'cardPacked'
    | 'benefitShipped'

export const addressFields = [
    'addressLine1',
    'addressLine2',
    'city',
    'state',
    'zip',
] as const

export type AddressField = (typeof addressFields)[number]

export type AddressDraft = Partial<Record<AddressField, string>>

export type MemberEdits = Partial<
    Pick<Member, 'userEmail' | 'userPhone' | 'userFirstName' | 'userLastName'>
> & {
    shirtSize?: ShirtSize | null
    packageShipped?: PackageShipped | null
    address?: AddressDraft
    nameConfirmed?: boolean
    addressConfirmed?: boolean
    discordConfirmed?: boolean
    cardPrinted?: boolean
    labelPrinted?: boolean
    cardPacked?: boolean
    benefitShipped?: boolean
}

export interface EditController {
    draftOf: (member: Member) => MemberEdits
    update: (member: Member, patch: MemberEdits) => void
    subscribeMember: (donorEmail: string, listener: () => void) => () => void
    subscribeAll: (listener: () => void) => () => void
    getEdits: () => Record<string, MemberEdits>
}

export interface MemberValueProps {
    member: Member
}

export interface MemberEditProps {
    member: Member
    edit: EditController
}

export interface MemberMenuProps {
    member: Member
    closeDropdown: () => void
}

export interface PendingUpdate {
    donorEmail: string
    userId?: number
    user?: UpdateUserRequest
    membership?: UpdateMembershipRequest
}

export type UserHistoryEntry = NonNullable<User['history']>[number]

export interface HistoryEntry {
    historyId: number
    historyWhenUpdatedUtc: Date
}

export type DescribeChange<T extends HistoryEntry = UserHistoryEntry> = (
    update: T,
    previous: T | undefined
) => { label: string; value: string } | undefined
