import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { getToken } from 'next-auth/jwt'
import { User } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import dbConnect from '@/util/libmongo'
import { getMember, joinMember } from '@/util/discord'
import { RESTJSONErrorCodes } from 'discord-api-types/v10'
import { DiscordAPIError } from '@discordjs/rest'
import { HTTPStatus } from '@/util/https-status'
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

  try {
    // TODO: remove casting
    const data = await joinMember(session.discordId, token.access_token as string)
    if (
      user.verified &&
      user.onboardingStage === OnboardingStage.VERIFIED
    ) {
      user.onboardingStage = OnboardingStage.JOINED
      await user?.save()
    }
    if ('flags' in data) return new Response('Added Member!', { status: HTTPStatus.Ok })
    return new Response('Member in Guild', { status: HTTPStatus.Ok })
  } catch (error) {
    if ((error instanceof DiscordAPIError) && error.code === RESTJSONErrorCodes.InvalidOAuth2AccessToken) {

      // User needs to be reauthorized we should sign them out
      return NextResponse.json(
        {
          message: 'Invalid OAuth2 access token provided',
          code: error.code,
        },
        { status: HTTPStatus.UnAuthorized }
      )
    }
    return new Response('Internal Error', { status: HTTPStatus.InternalServerError })
  }
}

// Check if they are already in the server
export async function GET(req: NextRequest) {
  // Retrieve the session using the incoming request and auth options
  const session = await getServerSession(authOptions)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!session) return new Response('Unauthorized - session not found', { status: HTTPStatus.UnAuthorized })
  if (!token) return new Response('Unauthorized - token not found', { status: HTTPStatus.UnAuthorized })

  await dbConnect()

  const user = await User.findOne({ discordId: token?.discordId })

  if (!user) return new Response('Internal Error', { status: HTTPStatus.InternalServerError })

  switch (user.onboardingStage) {
    case OnboardingStage.VERIFIED:
      break
    case OnboardingStage.JOINED:
      break
    default:
      // They cannot request a join without verification
      return new Response('Unauthorized - Invalid Onboarding Stage', { status: HTTPStatus.UnAuthorized })
  }

  try {
    void getMember(token?.discordId as string)
    if (user && user.onboardingStage === OnboardingStage.VERIFIED) {
      user.onboardingStage = OnboardingStage.JOINED
      void user?.save()
    }
    return NextResponse.json(
      { message: 'Already Joined!' },
      { status: HTTPStatus.Ok }
    )
  } catch (error) {
    if ((error instanceof DiscordAPIError) && error.code === RESTJSONErrorCodes.UnknownMember)
      return new Response('Not Joined.', { status: HTTPStatus.NotFound })
    console.error(error)
    return new Response('Internal Error', { status: HTTPStatus.InternalServerError })
  }
}
