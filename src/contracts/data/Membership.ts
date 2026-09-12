import z from 'zod'

export enum MembershipDeliverableStatus {
    NotEligible = 0,
    NotStarted = 1,
    Printed = 2,
    InTransit = 3,
    Recieved = 4,
    Returned = 5,
}

export enum MembershipFulfillmentStatus {
    NotEligible = 0,
    NotFulfilled = 1,
    Fulfilled = 2,
}

export enum ShirtSize {
    ExtraSmall = 'XS',
    Small = 'S',
    Medium = 'M',
    Large = 'L',
    ExtraLarge = 'XL',
    DoubleExtraLarge = '2XL',
}

export const zShirtSize = z.enum(ShirtSize)

export const zMembershipFulfillmentStatus = z.enum(MembershipFulfillmentStatus)

export const zMembershipDeliverableStatus = z.enum(MembershipDeliverableStatus)

export const zMembership = z.object({
    donorEmail: z.string(),
    shirtSize: zShirtSize.nullable(),
    duesPayingMember: z.boolean(),
    membershipFulfillmentStatus: zMembershipFulfillmentStatus,
    nameConfirmed: z.boolean(),
    discordConfirmed: z.boolean(),
    addressConfirmed: z.boolean(),
    membershipBenefitEligible: z.boolean(),
    cardPrinted: z.boolean(),
    labelPrinted: z.boolean(),
    itemsPackaged: z.boolean(),
    benefitsShipped: z.boolean(),
    membershipCardStatus: zMembershipDeliverableStatus,
    membershipMerchStatus: zMembershipDeliverableStatus,
})

export type Membership = z.infer<typeof zMembership>
