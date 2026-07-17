import { zUserProfile } from '../data'
import { zPosition } from '../data/Position'
import z from 'zod'

export const zPositionHierarchyResponse = z.object({
    positions: z.array(zPosition),
    users: z.array(zUserProfile),
})

export type PositionHierarchyResponse = z.infer<
    typeof zPositionHierarchyResponse
>
