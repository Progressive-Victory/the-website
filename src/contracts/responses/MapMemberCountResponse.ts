import z from 'zod'

export const zMapMemberCountResponse = z.object({
    states: z.array(z.object({ code: z.string(), count: z.number() })),
    total: z.int(),
})

export type MapMemberCountResponse = z.infer<typeof zMapMemberCountResponse>
