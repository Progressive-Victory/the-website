import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { getToken } from 'next-auth/jwt'
import { User } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import dbConnect from '@/util/libmongo'
import { Neutrino } from '@/util/neutrino'
import { HTTPStatus } from '@/util/types'
export const dynamic = 'force-dynamic'

interface POSTRequestBody {
    number: string
}

function isPOSTRequestBody(b:unknown): b is POSTRequestBody {
    return typeof b === 'object' && b !== null && 'number' in b
}

async function processPOSTRequest(body:unknown) {
    if(body instanceof Promise) {
        return body.then((v) => {
            if(isPOSTRequestBody(v)){
                return v
            }
            return null
        })
    } else if(isPOSTRequestBody(body)) return body
    return null
}

export async function POST(req: NextRequest) {
    // Parse incoming JSON body
    const reqJson = await processPOSTRequest(req.json())
    if (!reqJson || !isPOSTRequestBody(reqJson)) {
        return new Response('Phone number is required', { status: HTTPStatus.BadRequest })
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

        const user = await User.findOne({ discordId: token.discordId })

        switch (user?.onboardingStage) {
            case OnboardingStage.NOT_STARTED:
                // Update user to await state
                user.onboardingStage = OnboardingStage.AWAIT_VERIFICATION
                await user.save()
                break
            case OnboardingStage.AWAIT_VERIFICATION:
                // Do nothing we can send another code if they need it
                break
            default:
                // They cannot request a code after being verified
                return new Response('Unauthorized', { status: HTTPStatus.UnAuthorized })
        }
    } catch {
        return new Response('Unauthorized', { status: HTTPStatus.UnAuthorized })
    }

    const response = await Neutrino.smsVerify(reqJson.number,{
        codeLength: 6,
        brandName: 'PV',
        limit: 20,
        countryCode: 'US'
    })

    if (!response.sent) {
        return new Response('Bad request', { status: HTTPStatus.UnAuthorized })
    }

    return new Response('Success', { status: HTTPStatus.Ok })
}
