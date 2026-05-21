import z from 'zod'

export const zEndorsement = z.object({
    id: z.int(),
    name: z.string(),
    description: z.string(),
    candidateLink: z.string(),
    linkLabel: z.string(),
    imgUrl: z.string(),
    isStateInitiative: z.boolean(),
    isNationalInitiative: z.boolean(),
    isPvMember: z.boolean(),
    tookPvPledge: z.boolean(),
})

export type Endorsement = z.infer<typeof zEndorsement>
