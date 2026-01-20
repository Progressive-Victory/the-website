import { User } from '@/models/User'
import { auth } from '@/util/auth'
import { getMember } from '@/util/discord'
import { HTTPStatus } from '@/util/https-status'
import dbConnect from '@/util/libmongo'
import { OnboardingStage } from '@/util/stage'
import { DiscordAPIError } from '@discordjs/rest'
import { RESTJSONErrorCodes } from 'discord-api-types/v10'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Check if they are already in the server
 */
export async function GET() {
    const session = await auth()
    if (!session) {
        return new NextResponse(null, {
            status: HTTPStatus.UnAuthorized,
        })
    }

    await dbConnect()

    const user = await User.findOne({ discordId: session?.discordId })
    if (!user) {
        console.error(`Failed to load user with valid session:`, session)
        return new NextResponse(null, {
            status: HTTPStatus.InternalServerError,
        })
    }

    try {
        const member = await getMember(session?.discordId)

        if (
            user.onboardingStage !== OnboardingStage.VERIFIED &&
            user.onboardingStage !== OnboardingStage.JOINED
        ) {
            console.warn(
                `User ${user.id} is in the discord server, but their onboarding stage is not JOINED:`,
                member
            )
        }

        return NextResponse.json(
            { joined: true, onboarding_stage: user.onboardingStage },
            { status: HTTPStatus.Ok }
        )
    } catch (error) {
        if (
            error instanceof DiscordAPIError &&
            error.code === RESTJSONErrorCodes.UnknownMember
        ) {
            return NextResponse.json(
                { joined: false, onboarding_stage: user.onboardingStage },
                { status: HTTPStatus.Ok }
            )
        }

        console.error(
            `Failed to get guild member (id = ${user.id}, discordId = ${user.discordId}):`,
            error
        )
        return new NextResponse(null, {
            status: HTTPStatus.InternalServerError,
        })
    }
}
