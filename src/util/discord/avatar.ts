import { rest } from './rest'
import {
    calculateUserDefaultAvatarIndex,
    ImageURLOptions,
} from '@discordjs/rest'
import { Snowflake } from 'discord-api-types/globals'
import { APIGuildMember, APIUser, Routes } from 'discord-api-types/v10'

const GUILD_ID = process.env.GUILD_ID

if (!GUILD_ID) throw Error("Please specify 'GUILD_ID' in the environment file.")

export async function getGuildAvatar(
    userId: Snowflake,
    imageOptions: Readonly<ImageURLOptions> = { forceStatic: true }
) {
    try {
        const guildMember = (await rest.get(
            Routes.guildMember(GUILD_ID!, userId)
        )) as APIGuildMember | null
        let avatar: string | undefined | null = undefined
        if (guildMember) avatar = guildMember.avatar
        let avatarURL: string | null = null
        if (avatar)
            avatarURL = rest.cdn.guildMemberAvatar(
                GUILD_ID ?? 'error',
                userId,
                avatar,
                imageOptions
            )
        if (avatarURL && (await isFound(avatarURL))) return avatarURL
        return getUserAvatarURL(userId, imageOptions)
    } catch (error) {
        console.log(error)
        return getUserAvatarURL(userId, imageOptions)
    }
}

export async function getUserAvatarURL(
    userId: Snowflake,
    imageOptions: Readonly<ImageURLOptions> = { forceStatic: true }
) {
    const discordUser: APIUser | undefined | null = (await rest.get(
        Routes.user(userId)
    )) as APIUser
    let avatar: string | undefined | null
    if (discordUser) avatar = discordUser.avatar
    let avatarURL: string | null = null
    if (avatar) avatarURL = rest.cdn.avatar(userId, avatar, imageOptions)
    if (avatarURL && (await isFound(avatarURL))) return avatarURL
    return getDefaultAvatar(userId)
}

function getDefaultAvatar(id: Snowflake) {
    return rest.cdn.defaultAvatar(calculateUserDefaultAvatarIndex(id))
}

async function isFound(url: string) {
    const request = await fetch(url, { method: 'HEAD' })
    return request.ok
}
