import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { getToken } from 'next-auth/jwt'
import { User } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import dbConnect from '@/util/libmongo'
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

    const user = await User.findOne({ discordId: token?.discordId })

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

    const endpoint = `https://discord.com/api/guilds/${process.env.GUILD_ID}/members/${token?.discordId}`
    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
        body: JSON.stringify({
            access_token: token.access_token,
        }),
    })

    if (response.ok) {
        if (
            user.verified &&
            user?.onboardingStage === OnboardingStage.VERIFIED
        ) {
            user.onboardingStage = OnboardingStage.JOINED
            await user?.save()
        }
        return new Response('Added Member!', { status: 200 })
    } else {
        const data = await response.json()

        if (data.code === 50025) {
            // User needs to be reauthed we should sign them out
            return NextResponse.json(
                {
                    message: 'Credentials Expired',
                    code: 50025,
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

    const user = await User.findOne({ discordId: token?.discordId })

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

    const endpoint = `https://discord.com/api/guilds/${process.env.GUILD_ID}/members/${token?.discordId}`

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
    })

    if (response.status === 200) {
        if (user && user?.onboardingStage === OnboardingStage.VERIFIED) {
            user.onboardingStage = OnboardingStage.JOINED
            await user?.save()
        }

        return NextResponse.json(
            { message: 'Already Joined!' },
            { status: 200 }
        )
    } else {
        return new Response('Not Joined.', { status: 404 })
    }
}
