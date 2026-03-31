import { zUpdateUserAddressRequest } from './UpdateUserAddressRequest'
import {
    zOnboardingStage,
    zUserStatus,
    zShirtSize,
    zMembershipDeliverableStatus,
    zMembershipFulfillmentStatus,
} from '@/contracts/data'
import z from 'zod'

export const zUpdateUserRequest = z
    .object({
        email: z.string().max(100).nonempty().nullish(),
        phone: z.string().max(15).nonempty().nullish(),
        preferredName: z.string().max(100).nonempty().nullish(),
        firstName: z.string().max(100).nonempty().nullish(),
        lastName: z.string().max(100).nonempty().nullish(),
        birthdate: z.coerce.date().nullish(),
        zipCode: z.number().nullish(),
        address: zUpdateUserAddressRequest.optional(),

        acceptedAlerts: z.boolean().optional(),
        verified: z.boolean().optional(),
        onboardingStage: zOnboardingStage.optional(),
        lastSmsCode: z.number().nullish(),
        lastSmsCodeSendTimeUtc: z.coerce.date().nullish(),
        status: zUserStatus.optional(),

        joinedAtUtc: z.coerce.date().nullish(),
        completedIntakeUtc: z.coerce.date().nullish(),

        membershipCardStatus: zMembershipDeliverableStatus.optional(),
        membershipMerchStatus: zMembershipDeliverableStatus.optional(),
        shirtSize: zShirtSize.nullish(),
        duesPayingMember: z.boolean().optional(),
        membershipFulfillmentStatus: zMembershipFulfillmentStatus.nullish(),
        nameConfirmed: z.boolean().optional(),
        addressConfirmed: z.boolean().optional(),

        aliases: z.array(z.string().max(100).nonempty()).optional(),
        roles: z.array(z.number()).optional(),
    })
    .strict()

export type UpdateUserRequest = z.infer<typeof zUpdateUserRequest>
