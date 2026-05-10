import z from 'zod'
import { $ZodShape } from 'zod/v4/core'

export enum UpdateHistoryType {
    Inserted = 'I',
    Updated = 'U',
    Merged = 'M',
    Deleted = 'D',
}

export const zUpdateHistoryType = z.enum(UpdateHistoryType)

const zUpdateHistoryBase = z.object({
    historyId: z.int(),
    historyType: zUpdateHistoryType,
    historyDataSource: z.string().optional(),
    historyWhoUpdatedId: z.int().nullable(),
    historyWhenUpdatedUtc: z.coerce.date(),
})

export const zUpdateHistory = <Shape extends $ZodShape>(
    zData: z.ZodObject<Shape>
) => zUpdateHistoryBase.extend(zData.shape)

export type UpdateHistory<T> = z.infer<typeof zUpdateHistoryBase> & T
