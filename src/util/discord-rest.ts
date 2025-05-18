import {
    calculateUserDefaultAvatarIndex,
    REST,
    ImageURLOptions,
} from '@discordjs/rest'
import { Snowflake } from 'discord-api-types/v10'

const discordToken = process.env.DISCORD_BOT_TOKEN

if (!discordToken) {
    throw new Error(
        "Please specify 'DISCORD_BOT_TOKEN' in the environment file."
    )
}

export const rest = new REST({ version: '10' }).setToken(discordToken)

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

    if (!avatarURL) {
        avatarURL = getDefaultAvatarURL(userId)
    }

    return avatarURL
}

async function getGuildAvatarURL(
    userId: Snowflake,
    guildId: Snowflake,
    avatarHash: string | null = null,
    imageOptions: Readonly<ImageURLOptions> = { forceStatic: true, size: 512 }
) {
    if (!avatarHash) return null

    const avatarURL = rest.cdn.avatar(userId, avatarHash, imageOptions)

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
