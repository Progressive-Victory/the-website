import { zActBlueDonor } from './ActBlueDonor'
import { zDiscordUser } from './DiscordUser'
import { zOnboardingStage } from './OnboardingStage'
import { zRole } from './Role'
import { zUpdateHistory } from './UpdateHistory'
import { zUserAddress } from './UserAddress'
import z from 'zod'

export enum UserStatus {
    Deleted = 0,
    Active = 1,
}

export enum MembershipDeliverableStatus {
    NotEligible = 0,
    NotStarted = 1,
    Printed = 2,
    InTransit = 3,
    Recieved = 4,
    Returned = 5,
}

export const zMembershipDeliverableStatus = z
    .enum(MembershipDeliverableStatus)
    .default(0)

export const zUserStatus = z.enum(UserStatus)

const zBaseUser = z.object({
    id: z.int(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    preferredName: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    birthdate: z.coerce.date().nullable(),
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

    membershipCardStatus: zMembershipDeliverableStatus,
    membershipMerchStatus: zMembershipDeliverableStatus,

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
