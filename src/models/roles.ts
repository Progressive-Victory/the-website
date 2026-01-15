import { zPermission } from './permissions'
import z from 'zod'

export const zRole = z.object({
    id: z.number(),
    name: z.string(),
    permissions: z.array(zPermission).nullable().optional(),
})

export type IRole = z.infer<typeof zRole>
