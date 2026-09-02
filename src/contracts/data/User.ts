import { zActBlueDonor } from './ActBlueDonor'
import { zDiscordUser } from './DiscordUser'
import { zLocation } from './Location'
import {
    zMembershipDeliverableStatus,
    zMembershipFulfillmentStatus,
    zShirtSize,
} from './Membership'
import { zOnboardingStage } from './OnboardingStage'
import { zRole } from './Role'
import { zUpdateHistory } from './UpdateHistory'
import { zUserAddress } from './UserAddress'
import z from 'zod'

export enum UserStatus {
    Deleted = 0,
    Active = 1,
}

export const zUserStatus = z.enum(UserStatus)

// export enum MembershipDeliverableStatus {
//     NotStarted = 0,
//     Cancelled = 1,
//     Printed = 2,
//     Shipped = 3,
//     Received = 4,
//     Returned = 5,
// }

// export enum MembershipFulfillmentStatus {
//     NotEligible = 0,
//     NotFulfilled = 1,
//     Fulfilled = 2,
// }

// export enum ShirtSize {
//     ExtraSmall = 'XS',
//     Small = 'S',
//     Medium = 'M',
//     Large = 'L',
//     ExtraLarge = 'XL',
//     DoubleExtraLarge = '2XL',
// }

// export const zShirtSize = z.enum(ShirtSize)

// export const zMembershipFulfillmentStatus = z.enum(MembershipFulfillmentStatus)

// export const zMembershipDeliverableStatus = z.enum(MembershipDeliverableStatus)

// export const zUserStatus = z.enum(UserStatus)

const zBaseUser = z.object({
    id: z.int(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    preferredName: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    birthdate: z.coerce.date().nullable(),
    location: zLocation.nullable(),
    address: zUserAddress,

    acceptedAlerts: z.boolean(),
    verified: z.boolean(),
    onboardingStage: zOnboardingStage,
    lastSmsCode: z.number().nullable(),
    lastSmsCodeSendTimeUtc: z.coerce.date().nullable(),
    status: zUserStatus,

    createdAtUtc: z.coerce.date().nullable(),
    joinedAtUtc: z.coerce.date().nullable(),
    completedIntakeUtc: z.coerce.date().nullable(),

    /**
     * @deprecated
     */
    membershipCardStatus: zMembershipDeliverableStatus.default(0),
    /**
     * @deprecated
     */
    membershipMerchStatus: zMembershipDeliverableStatus.default(0),
    /**
     * @deprecated
     */
    shirtSize: zShirtSize.nullable(),
    duesPayingMember: z.boolean(),
    /**
     * @deprecated
     */
    membershipFulfillmentStatus: zMembershipFulfillmentStatus.nullable(),
    /**
     * @deprecated
     */
    nameConfirmed: z.boolean(),
    /**
     * @deprecated
     */
    addressConfirmed: z.boolean(),
    /**
     * @deprecated
     */
    membershipBenefitEligible: z.boolean(),

    aliases: z.array(z.string()).optional(),
    roles: z.array(zRole).optional(),
    discordUsers: z.array(zDiscordUser).optional(),
    donors: z.array(zActBlueDonor).optional(),
})

export const zUser = zBaseUser.extend({
    history: z.array(zUpdateHistory(zBaseUser)).optional(),
    donorHistory: z.array(zUpdateHistory(zActBlueDonor)).optional(),
})

export type User = z.infer<typeof zUser>
