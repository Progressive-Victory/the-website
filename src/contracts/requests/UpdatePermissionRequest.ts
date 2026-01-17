import z from 'zod'

export const zUpdatePermissionRequest = z.object({
    name: z.string().nonempty().optional(),
})

export type IUpdatePermissionRequest = z.infer<typeof zUpdatePermissionRequest>
