import { APIGuildMember } from "discord-api-types/v10"

export function isGuildMember(data:unknown): data is APIGuildMember {
    if (!(typeof data === 'object' && data)) return false 
    return 'roles' in data &&
        'joined_at' in data &&
        'deaf' in data &&
        'mute' in data &&
        'flags' in data
}