import { zMutationRequest } from './MutationRequest'
import z from 'zod'

export const zUpdateUserAddressRequest = zMutationRequest
    .extend({
        addressLine1: z.string().max(100).nonempty().nullable().optional(),
        addressLine2: z.string().max(100).nonempty().nullable().optional(),
        city: z.string().max(50).nonempty().nullable().optional(),
        county: z.string().max(50).nonempty().nullable().optional(),
        state: z.string().length(2).nullable().optional(),
        zip: z.string().length(5).nullable().optional(),
    })
    .strict()

export type UpdateUserAddressRequest = z.infer<
    typeof zUpdateUserAddressRequest
>
