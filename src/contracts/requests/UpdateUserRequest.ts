import {
    zOnboardingStage,
    zUserStatus,
    zShirtSize,
    zMembershipDeliverableStatus,
    zMembershipFulfillmentStatus,
} from '@/contracts/data'
import { zMutationRequest } from './MutationRequest'
import { zUpdateUserAddressRequest } from './UpdateUserAddressRequest'
import z from 'zod'

export const zUpdateUserRequest = zMutationRequest
    .extend({
        email: z.string().max(100).nonempty().nullable().optional(),
        phone: z.string().max(15).nonempty().nullable().optional(),
        preferredName: z.string().max(100).nonempty().nullable().optional(),
        firstName: z.string().max(100).nonempty().nullable().optional(),
        lastName: z.string().max(100).nonempty().nullable().optional(),
        birthdate: z.coerce.date().nullable().optional(),
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

        /**
		 * @deprecated
		 */
        membershipCardStatus: zMembershipDeliverableStatus.optional(),
       	/**
		 * @deprecated
		 */
        membershipMerchStatus: zMembershipDeliverableStatus.optional(),
        /**
		 * @deprecated
		 */
        shirtSize: zShirtSize.nullish(),
        /**
		 * @deprecated
		 */
        duesPayingMember: z.boolean().optional(),
        /**
		 * @deprecated
		 */
        membershipFulfillmentStatus: zMembershipFulfillmentStatus.nullish(),
        /**
		 * @deprecated
		 */
        nameConfirmed: z.boolean().optional(),
        /**
		 * @deprecated
		 */
        addressConfirmed: z.boolean().optional(),
        /**
         * @deprecated
         */
        membershipBenefitEligible: z.boolean().optional(),

        aliases: z.array(z.string().max(100).nonempty()).optional(),
        roles: z.array(z.number()).optional(),
    })
    .strict()

export type UpdateUserRequest = z.infer<typeof zUpdateUserRequest>
