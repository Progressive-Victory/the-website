import z from 'zod'

export const zPermission = z.object({
    id: z.number(),
    name: z.string(),
})

export type IPermission = z.infer<typeof zPermission>
