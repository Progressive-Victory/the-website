import { zCreateDiscordUserRequest } from './index'
import z from 'zod'

export const zUpdateDiscordUserRequest = zCreateDiscordUserRequest
    .omit({ discordId: true })
    .partial()
    .strict()
export type UpdateDiscordUserRequest = z.infer<typeof zUpdateDiscordUserRequest>
