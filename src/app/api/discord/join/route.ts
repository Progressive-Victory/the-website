import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { getToken } from 'next-auth/jwt'
import { User } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import dbConnect from '@/util/libmongo'
import { RESTJSONErrorCodes as DiscordJSONErrorCodes, Routes } from 'discord-api-types/v10'
import { DiscordAPIError } from '@discordjs/rest'
import { rest, isAPIGuildMember } from '@/util/discord'
import { HTTPStatus } from '@/util/types'

const GUILD_ID = process.env.GUILD_ID

export const dynamic = 'force-dynamic'
// Joins user to the server with our grant
export async function PUT(req: NextRequest) {
    // Retrieve the session using the incoming request and auth options
    const session = await getServerSession(authOptions)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!session || !token) {
        return new Response('Unauthorized', { status: HTTPStatus.UnAuthorized })
    }

    await dbConnect()

    const user = await User.findOne({ discordId: token.discordId })

    // Escape if the user is null
    if (!user) return new Response('Not Logged In', { status: HTTPStatus.UnAuthorized })

    switch (user.onboardingStage) {
        case OnboardingStage.VERIFIED:
            break
        case OnboardingStage.JOINED:
            break
        default:
            return new Response('OnboardingStage error not VERIFIED or JOINED', { status: HTTPStatus.InternalServerError })
    }

    if (!GUILD_ID) throw Error('Please define the GUILD_ID environment variable')
    
    try {
        /**
         * Adds a user to the guild, provided you have a valid oauth2 access token for the user with the guilds.join scope. Returns a 201 Created with the guild member as the body, or 204 No Content if the user is already a member of the guild. Fires a Guild Member Add Gateway event.
         * @see https://discord.com/developers/docs/resources/guild#add-guild-member
         */
        const data = await rest.put(
            Routes.guildMember(GUILD_ID, user.discordId),
            { body: JSON.stringify({ access_token: token.access_token }) })
        if(isAPIGuildMember(data)) {
            user.discordUserAvatar = data.user.avatar ?? undefined
            user.discordGuildAvatar = data.avatar ?? undefined
        }
        else {/* Member is all ready in Guild*/}
        if ( user.verified && user.onboardingStage === OnboardingStage.VERIFIED) {
            user.onboardingStage = OnboardingStage.JOINED
        }
        void user.save()
        return new Response('Added Member!', { status: HTTPStatus.Ok })
    } catch (error) {
        if (!(error instanceof DiscordAPIError)) return NextResponse.json('Internal Error', { status: HTTPStatus.InternalServerError })
            const {code} = error
        if(code == DiscordJSONErrorCodes.InvalidOAuth2AccessToken) return NextResponse.json(error, { status: HTTPStatus.UnAuthorized })

        return NextResponse.json('Internal Error', { status: HTTPStatus.InternalServerError })
    }
}

// Check if they are already in the server
export async function GET(req: NextRequest) {
    // Retrieve the session using the incoming request and auth options
    const session = await getServerSession(authOptions)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!session || !token) {
        return new Response('Unauthorized', { status: HTTPStatus.UnAuthorized })
    }

    await dbConnect()

    const user = await User.findOne({ discordId: token.discordId })

    if (!user) return new Response('Internal Error', { status: HTTPStatus.InternalServerError })
    switch (user.onboardingStage) {
        case OnboardingStage.VERIFIED:
            break
        case OnboardingStage.JOINED:
            break
        default:
            // They cannot request a join without verification
            return new Response('OnboardingStage error not VERIFIED or JOINED', { status: HTTPStatus.InternalServerError })

    }

    if (!GUILD_ID) throw Error('Please define the GUILD_ID environment variable')

    try {
        /**
         * @see https://discord.com/developers/docs/resources/guild#get-guild-member
         */
        const data = await rest.get(Routes.guildMember(GUILD_ID, user.discordId))

        if (!isAPIGuildMember(data)) return new Response('Internal Error', { status: HTTPStatus.InternalServerError })

        user.discordUserAvatar = data.user.avatar ?? undefined
        user.discordGuildAvatar = data.avatar ?? undefined

        if (user.onboardingStage === OnboardingStage.VERIFIED) {
            user.onboardingStage = OnboardingStage.JOINED
        }
        void user.save()

        return new Response('Member in Guild', {status: HTTPStatus.Ok})

    } catch (error) {
        if (!(error instanceof DiscordAPIError)) throw error
        const {code} = error
        if ( code === DiscordJSONErrorCodes.UnknownMember) {
            return new Response('Member not in guild', { status: HTTPStatus.NotFound })
        } 
    }
}