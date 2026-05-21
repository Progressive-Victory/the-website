import z from 'zod'

export const zCreateEndorsementRequest = z.object({
    name: z.string().nonempty(),
    description: z.string().nonempty(),
    candidateLink: z.string().optional(),
    linkLabel: z.string().optional(),
    imgUrl: z.string().optional(),
    isStateInitiative: z.boolean().optional(),
    isNationalInitiative: z.boolean().optional(),
    isPvMember: z.boolean().optional(),
    tookPvPledge: z.boolean().optional(),
})

export type CreateEndorsementRequest = z.infer<typeof zCreateEndorsementRequest>
