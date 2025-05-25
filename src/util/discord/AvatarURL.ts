import {
    calculateUserDefaultAvatarIndex,
    ImageURLOptions,
} from '@discordjs/rest'
import { Snowflake } from 'discord-api-types/v10'
import { rest } from '.'

/**
 * Get Icon for user based on discord Profile
 */
export async function getDisplayAvatarURL(
    userId: Snowflake,
    avatarHash: string | null = null,
    guildId: Snowflake | null = null,
    guildAvatarHash: Snowflake | null = null,
    imageOptions: Readonly<ImageURLOptions> = { forceStatic: true, size: 512 }
) {
    let avatarURL: string | null = null
    if (guildId && guildAvatarHash) {
        avatarURL = await getGuildAvatarURL(
            userId,
            guildId,
            guildAvatarHash,
            imageOptions
        )
    }

    if (!avatarURL && avatarHash) {
        avatarURL = await getAvatarURL(userId, avatarHash, imageOptions)
    }

   return avatarURL ?? getDefaultAvatarURL(userId);
}

async function getGuildAvatarURL(
    userId: Snowflake,
    guildId: Snowflake,
    avatarHash: string | null = null,
    imageOptions: Readonly<ImageURLOptions> = { forceStatic: true, size: 512 }
) {
    if (!avatarHash) return null

    const avatarURL = rest.cdn.guildMemberAvatar(guildId, userId, avatarHash, imageOptions)

    if (await isFourOFour(avatarURL)) return null

    return avatarURL
}

async function getAvatarURL(
    userId: Snowflake,
    avatarHash: string | null = null,
    imageOptions: Readonly<ImageURLOptions> = { forceStatic: true, size: 512 }
) {
    if (!avatarHash) return null

    const avatarURL = rest.cdn.avatar(userId, avatarHash, imageOptions)

    if (await isFourOFour(avatarURL)) return null

    return avatarURL
}

function getDefaultAvatarURL(userId: Snowflake) {
    const index = calculateUserDefaultAvatarIndex(userId)
    return rest.cdn.defaultAvatar(index)
}

async function isFourOFour(url: string | URL | globalThis.Request) {
    const request = await fetch(url, { method: 'HEAD' })
    return request.status === 404
}