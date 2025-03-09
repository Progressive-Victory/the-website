import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getToken } from 'next-auth/jwt'
import { User } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import dbConnect from '@/util/libmongo'

export async function POST(req: NextRequest) {
    // Parse incoming JSON body
    const reqJson = await req.json()
    if (!reqJson.code) {
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

        const user = await User.findOne({ discordId: token?.discordId })

        switch (user?.onboardingStage) {
            case OnboardingStage.AWAIT_VERIFICATION:
                // Do nothing we can send another code if they need it
                break
            default:
                // They cannot ask for a verification before or after they need it
                return new Response('Unauthorized', { status: 401 })
        }

        const neutrinoEndpoint = 'https://neutrinoapi.net/verify-security-code'
        // Prepare the headers (note the inclusion of Content-Type for URL encoded data)
        const headers = {
            'User-ID': process.env.NEUTRINO_USERID!,
            'API-Key': process.env.NEUTRINO_SECRET!,
            'Content-Type': 'application/x-www-form-urlencoded',
        }

        // Build the URL encoded form data
        const formData = new URLSearchParams({
            'security-code': reqJson.code,
        })

        // Make the POST request with URL encoded data in the body
        const response = await fetch(neutrinoEndpoint, {
            method: 'POST',
            headers,
            body: formData.toString(),
        })

        const data = await response.json()
        if (!data || !data.verified) {
            return new Response('Bad request or bad code', { status: 400 })
        }

        if (data.verified) {
            user.onboardingStage = OnboardingStage.VERIFIED
            user.verified = true
            await user.save()
        }

        return new Response('Success', { status: 200 })
    } catch {
        return new Response('Unauthorized', { status: 401 })
    }
}
