import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(req: NextRequest, res: NextResponse) {
    // Parse incoming JSON body
    const reqJson = await req.json()
    if (!reqJson.number) {
        return new Response('Phone number is required', { status: 400 })
    }

    // Retrieve the session using the incoming request and auth options
    const session = await getServerSession(authOptions)

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
    })

    console.log(formData)

    // Make the POST request with URL encoded data in the body
    const response = await fetch(neutrinoEndpoint, {
        method: 'POST',
        headers,
        body: formData.toString(),
    })

    const data = await response.json()
    if (!data || !data.sent) {
        return new Response('Invalid phone number', { status: 400 })
    }

    return new Response('Success', { status: 200 })
}
