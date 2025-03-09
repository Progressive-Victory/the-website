import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { getToken } from 'next-auth/jwt'
import { User } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import dbConnect from '@/util/libmongo'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
    // Parse incoming JSON body
    const reqJson = await req.json()
    if (!reqJson.number) {
        return new Response('Phone number is required', { status: 400 })
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

        const user = await User.findOne({ discordId: token?.discordId })

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
                return new Response('Unauthorized', { status: 401 })
        }
    } catch {
        return new Response('Unauthorized', { status: 401 })
    }

    const neutrinoEndpoint = 'https://neutrinoapi.net/sms-verify'
    // Prepare the headers (note the inclusion of Content-Type for URL encoded data)
    const headers = {
        'User-ID': process.env.NEUTRINO_USERID!,
        'API-Key': process.env.NEUTRINO_SECRET!,
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    // Build the URL encoded form data
    const formData = new URLSearchParams({
        number: '+1' + reqJson.number,
        'code-length': '6',
        'brand-name': 'PV',
        limit: '20',
    })

    // Make the POST request with URL encoded data in the body
    const response = await fetch(neutrinoEndpoint, {
        method: 'POST',
        headers,
        body: formData.toString(),
    })
    const data = await response.json()
    console.log(data)

    if (!data || !data.sent) {
        return new Response('Bad request', { status: 400 })
    }

    return new Response('Success', { status: 200 })
}
