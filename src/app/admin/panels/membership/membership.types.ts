import { MembershipsResponsePacket } from '@/contracts/responses'

export const membershipTiers = [
    'Dues Paying Member',
    'Premium Member',
    'Signature Member',
    'Inner Circle Member',
] as const

export type MembershipTier = (typeof membershipTiers)[number]

export type ShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

export type PackageShipped =
    | 'Yes'
    | 'No'
    | 'Returned'
    | 'Not Received'
    | 'Canceled'

export interface Member {
    packet: MembershipsResponsePacket
    id: number
    userId?: number
    firstName?: string
    lastName?: string
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
    donorAddress?: string
    shirtSize?: ShirtSize

    isMember?: boolean
    eligibleForBenefits?: boolean
    beganMembership?: string
    membershipAmount?: number
    membershipTier?: MembershipTier
    numberOfContributions?: number
    nameUpdatedAt?: Date

    discordConfirmed?: boolean
    nameConfirmed?: boolean
    addressConfirmed?: boolean
    cardPrinted?: boolean
    labelPrinted?: boolean
    cardPacked?: boolean
    benefitShipped?: boolean
    packageShipped?: PackageShipped

    userMatched?: boolean
}
