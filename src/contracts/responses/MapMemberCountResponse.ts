import z from 'zod'

export const zMapMemberCountResponse = z.object({
    states: z.array(z.object({ code: z.string(), count: z.number() })),
    total: z.int(),
})

export type IMapMemberCountResponse = z.infer<typeof zMapMemberCountResponse>
