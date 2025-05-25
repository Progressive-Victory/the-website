import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { getToken } from 'next-auth/jwt'
import { User } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import dbConnect from '@/util/libmongo'
import { Neutrino } from '@/util/neutrino'

interface POSTRequestBody {
    code: string
}

function isPOSTRequestBody(b:unknown): b is POSTRequestBody {
    return typeof b === 'object' && b !== null && 'code' in b
}

export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
    // Parse incoming JSON body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const reqJson = await req.json()
    if (!isPOSTRequestBody(reqJson)) {
        return new Response('Code is required', { status: 400 })
    }
    

    // Retrieve the session using the incoming request and auth options
    const session = await getServerSession(authOptions)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!session || !token) {
        return new Response('Unauthorized', { status: 401 })
    }

    // Get the user
    try {
        await dbConnect()

        const user = await User.findOne({ discordId: token.discordId })

        switch (user?.onboardingStage) {
            case OnboardingStage.AWAIT_VERIFICATION:
                // Do nothing we can send another code if they need it
                break
            default:
                // They cannot ask for a verification before or after they need it
                return new Response('Unauthorized', { status: 401 })
        }

        const response = await Neutrino.verifySecurityCode(reqJson.code)
    
        if (!response) {
            return new Response('Bad request or bad code', { status: 400 })
        }
       
        user.onboardingStage = OnboardingStage.VERIFIED
        user.verified = true
        await user.save()

        return new Response('Success', { status: 200 })
    } catch {
        return new Response('Unauthorized', { status: 401 })
    }
}
