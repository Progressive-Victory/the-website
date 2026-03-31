import { zOnboardingStage, zUserStatus } from '../data'
import { zMutationRequest } from './MutationRequest'
import { zUpdateUserAddressRequest } from './UpdateUserAddressRequest'
import {
    zOnboardingStage,
    zUserStatus,
    zShirtSize,
    zMembershipDeliverableStatus,
    zMembershipFulfillmentStatus,
} from '@/contracts/data'
import z from 'zod'

export const zUpdateUserRequest = zMutationRequest
    .extend({
        email: z.string().max(100).nonempty().nullable().optional(),
        phone: z.string().max(15).nonempty().nullable().optional(),
        preferredName: z.string().max(100).nonempty().nullable().optional(),
        firstName: z.string().max(100).nonempty().nullable().optional(),
        lastName: z.string().max(100).nonempty().nullable().optional(),
        birthdate: z.coerce.date().nullable().optional(),
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
