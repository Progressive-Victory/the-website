import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { getToken } from 'next-auth/jwt'
import { User } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import dbConnect from '@/util/libmongo'
import { neutrino } from '@/util/neutrino'
import { HTTPStatus } from '@/util/https-status'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
    // Parse incoming JSON body
    const reqJson = await req.json()
    if (!reqJson.code) {
        return new Response('Code is required', {
            status: HTTPStatus.BadRequest,
        })
    }

    // Retrieve the session using the incoming request and auth options
    const session = await getServerSession(authOptions)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!session || !token) {
        return new Response('Unauthorized', { status: HTTPStatus.UnAuthorized })
    }

    // Get the user
    try {
        await dbConnect()

        const user = await User.findOne({ discordId: token?.discordId })

        switch (user?.onboardingStage) {
            case OnboardingStage.AWAIT_VERIFICATION:
                // Do nothing we can send another code if they need it
                break
            default:
                // They cannot ask for a verification before or after they need it
                return new Response('Unauthorized', {
                    status: HTTPStatus.UnAuthorized,
                })
        }

        const data = await neutrino.verifySecurityCode(reqJson.code as number)

        if (!data) {
            return new Response('Bad request or bad code', {
                status: HTTPStatus.BadRequest,
            })
        } else {
            user.onboardingStage = OnboardingStage.VERIFIED
            user.verified = true
            await user.save()
        }

        return new Response('Success', { status: HTTPStatus.Ok })
    } catch {
        return new Response('Unauthorized', { status: HTTPStatus.UnAuthorized })
    }
}
