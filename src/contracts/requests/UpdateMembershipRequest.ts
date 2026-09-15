import {
    zMembershipDeliverableStatus,
    zShirtSize,
    zMembershipFulfillmentStatus,
} from '../data/index'
import { zMutationRequest } from './MutationRequest'
import z from 'zod'

export const zUpdateMembershipRequest = zMutationRequest.extend({
    shirtSize: zShirtSize.nullish(),
    duesPayingMember: z.boolean().optional(),
    membershipFulfillmentStatus: zMembershipFulfillmentStatus.optional(),
    nameConfirmed: z.boolean().optional(),
    discordConfirmed: z.boolean().optional(),
    addressConfirmed: z.boolean().optional(),
    membershipBenefitEligible: z.boolean().optional(),
    cardPrinted: z.boolean().optional(),
    labelPrinted: z.boolean().optional(),
    itemsPackaged: z.boolean().optional(),
    benefitsShipped: z.boolean().optional(),
    membershipCardStatus: zMembershipDeliverableStatus.optional(),
    membershipMerchStatus: zMembershipDeliverableStatus.optional(),
})

export type UpdateMembershipRequest = z.infer<typeof zUpdateMembershipRequest>
