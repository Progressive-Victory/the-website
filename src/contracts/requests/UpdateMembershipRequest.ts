import {
    zMembershipDeliverableStatus,
    zShirtSize,
    zMembershipFulfillmentStatus,
} from '../data/index'
import z from 'zod'
import { zMutationRequest } from './MutationRequest'

export const zUpdateMembershipRequest = zMutationRequest.extend({
    membershipCardStatus: zMembershipDeliverableStatus.optional(),
    membershipMerchStatus: zMembershipDeliverableStatus.optional(),
    shirtSize: zShirtSize.nullish(),
    duesPayingMember: z.boolean().optional(),
    membershipFulfillmentStatus: zMembershipFulfillmentStatus.optional(),
    nameConfirmed: z.boolean().optional(),
    addressConfirmed: z.boolean().optional(),
    membershipBenefitEligible: z.boolean().optional(),
})

export type UpdateMembershipRequest = z.infer<typeof zUpdateMembershipRequest>