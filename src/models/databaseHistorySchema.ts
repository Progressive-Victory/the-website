import z from 'zod'

export const zDatabaseHistorySchema = z.object({
    historyId: z.number(),
    historyType: z.string(),
    historyWhoUpdatedId: z.number(),
    historyWhenUpdatedUtc: z.date(),
})

export type IDatabaseHistorySchema = z.infer<typeof zDatabaseHistorySchema>
