import { Snowflake } from 'discord-api-types/globals'
import { rest } from './rest'
import {
    APIGuildMember,
    APIUser,
    RESTJSONErrorCodes,
    Routes,
} from 'discord-api-types/v10'
import { DiscordAPIError, RequestMethod } from '@discordjs/rest'

/**
 * Tries to join the user to the Discord guild
 * @param userId Discord User ID
 * @param accessToken Discord Access Token
 * @returns The member object if the user was added, or null if the user is
 * already in the server
 * @throws Any errors from Discord API
 */
export async function joinMember(
    userId: Snowflake,
    accessToken: string
): Promise<APIGuildMember | null> {
    if (!process.env.GUILD_ID)
        throw Error("Please specify 'GUILD_ID' in the environment file.")

    const res = await rest.queueRequest({
        fullRoute: Routes.guildMember(process.env.GUILD_ID, userId),
        method: RequestMethod.Put,
        body: { access_token: accessToken },
    })

    switch (res.status) {
        case 201:
            return (await res.json()) as APIGuildMember
        case 204:
            return null
        default:
            throw new Error('unexpected return value')
    }
}

export function getMember(userId: Snowflake) {
    if (!process.env.GUILD_ID)
        throw Error("Please specify 'GUILD_ID' in the environment file.")

    return rest.get(
        Routes.guildMember(process.env.GUILD_ID, userId)
    ) as Promise<APIGuildMember>
}

export async function isEmailVerified(accessToken: string) {
    const res = await rest.queueRequest({
        fullRoute: Routes.user('@me'),
        method: RequestMethod.Get,
        body: { access_token: accessToken },
    })

    switch (res.status) {
        case 200: {
            const user = (await res.json()) as APIUser
            return user.verified
        }
        default:
            throw new Error('unexpected return value')
    }
}

export async function isUserAGuildMember(userId: Snowflake) {
    try {
        return !!(await getMember(userId))
    } catch (error) {
        if (
            error instanceof DiscordAPIError &&
            error.code === RESTJSONErrorCodes.UnknownMember
        ) {
            return false
        }

        throw error
    }
}
