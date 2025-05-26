import { DiscordErrorData } from "@discordjs/rest"
import { APIGuildMember } from "discord-api-types/v10"

export function isAPIGuildMember(data:unknown): data is APIGuildMember {
    if (!(typeof data === 'object' && data)) return false 
    return 'roles' in data &&
        'joined_at' in data &&
        'deaf' in data &&
        'mute' in data &&
        'flags' in data
}

export function isDiscordErrorData(data:unknown): data is DiscordErrorData {
    if (!(typeof data === 'object' && data)) return false
    return 'code' in data && typeof data.code === 'number' &&
        'message' in data && typeof data.message === 'string'
}