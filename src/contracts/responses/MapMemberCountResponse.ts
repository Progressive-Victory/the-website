import z from 'zod'

export const zMapMemberCountResponse = z.object({
    states: z.record(z.string(), z.int()),
    total: z.int(),
})

export type MapMemberCountResponse = z.infer<typeof zMapMemberCountResponse>
