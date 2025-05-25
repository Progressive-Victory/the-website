import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { getToken } from 'next-auth/jwt'
import { User } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import dbConnect from '@/util/libmongo'
import { RESTJSONErrorCodes, Routes } from 'discord-api-types/v10'
import { RequestMethod } from '@discordjs/rest'
import { rest, isGuildMember } from '@/util/discord'

const GUILD_ID = process.env.GUILD_ID

export const dynamic = 'force-dynamic'
// Joins user to the server with our grant
export async function PUT(req: NextRequest) {
    // Retrieve the session using the incoming request and auth options
    const session = await getServerSession(authOptions)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!session || !token) {
        return new Response('Unauthorized', { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ discordId: token.discordId })

    // Escape if the user is null
    if (!user) return new Response('Not Logged In', { status: 200 })

    switch (user.onboardingStage) {
        case OnboardingStage.VERIFIED:
            break
        case OnboardingStage.JOINED:
            break
        default:
            return new Response('Unauthorized', { status: 401 })
    }

    if (!GUILD_ID) throw Error('Please define the GUILD_ID environment variable')

    /**
     * @see https://discord.com/developers/docs/resources/guild#add-guild-member
     */
    const response = await rest.queueRequest({
        fullRoute: Routes.guildMember(GUILD_ID, user.discordId),
        body: JSON.stringify({
            access_token: token.access_token,
        }),
        method: RequestMethod.Put
    })

    const data = await response.json()

    if (response.status === 201 && isGuildMember(data)) {
        user.discordUserAvatar = data.user.avatar ?? undefined
        user.discordGuildAvatar = data.avatar ?? undefined
    }
    if (response.ok) {
        
        if (
            user.verified &&
            user.onboardingStage === OnboardingStage.VERIFIED
        ) {
            user.onboardingStage = OnboardingStage.JOINED
        }
        await user.save()
        return new Response('Added Member!', { status: 200 })
    } else {
        const data = await response.json()

        if (typeof data === 'object' && data && 'code' in data && data.code === RESTJSONErrorCodes.InvalidOAuth2AccessToken) {
            // User needs to be reauthed we should sign them out
            return NextResponse.json(
                {
                    message: 'Invalid OAuth2 Access Token',
                    code: RESTJSONErrorCodes.InvalidOAuth2AccessToken,
                },
                {
                    status: 400,
                }
            )
        }
        return new Response('Internal Error', { status: 500 })
    }
}

// Check if they are already in the server
export async function GET(req: NextRequest) {
    // Retrieve the session using the incoming request and auth options
    const session = await getServerSession(authOptions)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!session || !token) {
        return new Response('Unauthorized', { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ discordId: token.discordId })

    if (!user) return new Response('Internal Error', { status: 500 })
    switch (user.onboardingStage) {
        case OnboardingStage.VERIFIED:
            break
        case OnboardingStage.JOINED:
            break
        default:
            // They cannot request a join without verification
            return new Response('Unauthorized', { status: 401 })
    }

    if (!GUILD_ID) throw Error('Please define the GUILD_ID environment variable')

    /**
     * @see https://discord.com/developers/docs/resources/guild#get-guild-member
     */
    const response = await rest.queueRequest({
        fullRoute: Routes.guildMember(GUILD_ID, user.discordId),
        body: JSON.stringify({
            access_token: token.access_token,
        }),
        method: RequestMethod.Get
    })

    if (response.status === 200) {
        const data = await response.json()
        if(isGuildMember(data)) {
            user.discordUserAvatar = data.user.avatar ?? undefined
            user.discordGuildAvatar = data.avatar ?? undefined
        }
        if (user.onboardingStage === OnboardingStage.VERIFIED) {
            user.onboardingStage = OnboardingStage.JOINED
            
        }
    await user.save()
        return NextResponse.json(
            { message: 'Already Joined!' },
            { status: 200 }
        )
    } else {
        return new Response('Not Joined.', { status: 404 })
    }
}