import { handlers } from '@/util/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export const GET = handlers.GET
export const POST = async (req: NextRequest) => {
    const res: Response = await handlers.POST(req)

    // If boomerang is enabled, hijack the response to use boomerang instead
    if (process.env.BOOMERANG_URI) {
        const url = new URL(req.url)

        if (url.pathname === '/api/auth/signin/discord') {
            // Pull the original URL out
            const body_url = new URL((await res.json()).url)

            // Boomerang will redirect back to whatever the state.redirect_uri is set to
            body_url.searchParams.set(
                'state',
                btoa(
                    JSON.stringify({
                        redirect_uri: `${process.env.NEXTAUTH_URL ?? req.headers.get('origin')}/api/auth/callback/discord`,
                        original_state: body_url.searchParams.get('state'),
                    })
                )
            )

            // Tell discord to redirect back to boomerang when it's done which will
            // redirect the user again back to next-auth
            body_url.searchParams.set(
                'redirect_uri',
                // next-auth automatically appends this to the end of the
                // redirectProxyUrl when constructing the redirect_uri for token
                // grants so we need to add it here too
                `${process.env.BOOMERANG_URI}/callback/discord`
            )

            // Return our modified response back to the user for them to redirect
            // their browser
            return NextResponse.json(
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    url: body_url,
                },
                res
            )
        }
    }

    return res
}
