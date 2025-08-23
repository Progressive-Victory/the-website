import { RESTJSONErrorCodes } from 'discord-api-types/v10'
import { NextResponse } from 'next/server'

import { User } from '@/models/User'
import { auth } from '@/util/auth'
import { isEmailVerified, joinMember } from '@/util/discord'
import { HTTPStatus } from '@/util/https-status'
import dbConnect from '@/util/libmongo'
import { OnboardingStage } from '@/util/stage'
import { DiscordAPIError } from '@discordjs/rest'

export const dynamic = 'force-dynamic'

/**
 * Joins user to the server using the access token we got during login
 */
export async function POST() {
    const session = await auth()

    if (!session) {
        return new NextResponse(null, {
            status: HTTPStatus.UnAuthorized,
        })
    }

    await dbConnect()

    const user = await User.findOne({ discordId: session.discordId })

    if (!user) {
        console.error(`Failed to load user with valid session:`, session)
        return new NextResponse(null, {
            status: HTTPStatus.InternalServerError,
        })
    }

    switch (user.onboardingStage) {
        case OnboardingStage.VERIFIED:
        case OnboardingStage.JOINED:
            break
        default:
            return NextResponse.json(
                {
                    message: 'user is not yet verified',
                    code: 'PHONE_NUMBER_NOT_VERIFIED',
                },
                {
                    status: HTTPStatus.BadRequest,
                }
            )
    }

    try {
        if (!(await isEmailVerified(session.accessToken))) {
            return NextResponse.json(
                {
                    message: 'discord user does not have a verified email',
                    code: 'DISCORD_EMAIL_NOT_VERIFIED',
                },
                {
                    status: HTTPStatus.BadRequest,
                }
            )
        }
    } catch (e) {
        return new NextResponse(null, {
            status: HTTPStatus.InternalServerError,
        })
    }

    try {
        const data = await joinMember(session.discordId, session.accessToken)

        if (
            user.verified &&
            user.onboardingStage === OnboardingStage.VERIFIED
        ) {
            user.onboardingStage = OnboardingStage.JOINED
            await user?.save()
        }

        return NextResponse.json(
            {
                newly_added: !!data,
            },
            {
                status: HTTPStatus.Ok,
            }
        )
    } catch (error) {
        console.error('Failed to join member to the server:', error)

        // This can happen if the access token in the session JWT is expired
        //
        // FIXME: don't make the JWTs live for longer than the discord access
        // token (use refresh tokens)
        if (
            error instanceof DiscordAPIError &&
            error.code === RESTJSONErrorCodes.InvalidOAuth2AccessToken
        ) {
            console.log(error.requestBody)

            // User needs to be reauthorized (we should sign them out here)
            return NextResponse.json(
                {
                    message: 'Invalid OAuth2 access token provided',
                    code: 'INVALID_OAUTH2_ACCESS_CODE',
                },
                { status: HTTPStatus.BadRequest }
            )
        }
        return new NextResponse(null, {
            status: HTTPStatus.InternalServerError,
        })
    }
}
