import { User } from '@/models/User'
import { auth } from '@/util/auth'
import { HTTPStatus } from '@/util/https-status'
import dbConnect from '@/util/libmongo'
import { neutrino } from '@/util/neutrino'
import { OnboardingStage } from '@/util/stage'
import { NextRequest } from 'next/server'
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
    const session = await auth()

    if (!session) {
        return new Response('Unauthorized', { status: HTTPStatus.UnAuthorized })
    }

    // Get the user
    try {
        await dbConnect()

        const user = await User.findOne({ discordId: session?.discordId })

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
    } catch(err) {
        console.log(err instanceof Error ? err.message : 'couldn\'t read error message')
        return new Response('Unauthorized', { status: HTTPStatus.UnAuthorized })
    }
}
