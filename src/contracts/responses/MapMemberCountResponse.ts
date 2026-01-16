import z from 'zod'

export const zMapMemberCountResponse = z.record(z.string(), z.number())

export type IMapMemberCountResponse = z.infer<typeof zMapMemberCountResponse>
