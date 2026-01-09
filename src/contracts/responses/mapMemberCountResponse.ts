import z from 'zod'

export const zMapMemberCountResponse = z.object({
    data: z.record(z.string(), z.coerce.number()),
})

export type IMapMemberCountResponse = z.infer<typeof zMapMemberCountResponse>
