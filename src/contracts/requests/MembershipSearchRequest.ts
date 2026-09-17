import { zSearchRequest } from './SearchRequest'
import z from 'zod'

export const zMembershipSearchRequest = zSearchRequest.extend({
    isBenefitEligible: z.boolean(),
    isMember: z.boolean(),
})

export type MembershipSearchRequest = z.infer<typeof zMembershipSearchRequest>
