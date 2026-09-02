import { zMetaData } from '../data/MetaData'
import z from 'zod'

export const zUpdateDiscordUserImageRequest = zMetaData
    .extend({
        discordImage: z.string(),
    })
    .strict()

export type UpdateDiscordUserImageRequest = z.infer<
    typeof zUpdateDiscordUserImageRequest
>
