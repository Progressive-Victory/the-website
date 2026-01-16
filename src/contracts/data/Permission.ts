import z from 'zod'

export const zPermission = z.object({
    id: z.int(),
    name: z.string(),
})

export type IPermission = z.infer<typeof zPermission>
