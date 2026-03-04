import { zMutationRequest } from './MutationRequest'
import z from 'zod'

export const zActBlueDonorLinkRequest = zMutationRequest
    .extend({
        userId: z.number().nullable(),
    })
    .strict()

export type ActBlueDonorLinkRequest = z.infer<typeof zActBlueDonorLinkRequest>
