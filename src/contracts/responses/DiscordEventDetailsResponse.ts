import { zDiscordEvent, zDiscordUser } from '../data/index'
import z from 'zod'

export const zDiscordEventDetailsResponse = z.object({
    event: zDiscordEvent,
    createdBy: zDiscordUser,
})
export type DiscordEventDetailsResponse = z.infer<
    typeof zDiscordEventDetailsResponse
>