import z from 'zod'

export const zUpdateEndorsementRequest = z.object({
    name: z.string().nonempty().optional(),
    description: z.string().nonempty().optional(),
    candidateLink: z.string().optional(),
    linkLabel: z.string().optional(),
    imgUrl: z.string().optional(),
    isStateInitiative: z.boolean().optional(),
    isNationalInitiative: z.boolean().optional(),
    isPvMember: z.boolean().optional(),
    tookPvPledge: z.boolean().optional(),
})

export type UpdateEndorsementRequest = z.infer<typeof zUpdateEndorsementRequest>
