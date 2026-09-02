import { zDiscordUser, zUpdateHistory } from '../data/index'
import z from 'zod'

export const zDiscordUserHistoryResponse = z.object({
    data: z.array(zUpdateHistory(zDiscordUser)),
})

export type DiscordUserHistoryResponse = z.infer<
    typeof zDiscordUserHistoryResponse
>