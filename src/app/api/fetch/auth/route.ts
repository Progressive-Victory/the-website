import { AuthRequest } from '@/models'
import { auth, checkAuth, ResponseCode } from '@/util/auth'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
    const response = await checkAuth()

    switch (response) {
        case ResponseCode.Successful:
            break
        case ResponseCode.Exception:
            return NextResponse.json({ error: 'Bad request' }, { status: 400 })
        case ResponseCode.NoSession:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        case ResponseCode.InsufficientAccess:
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        default:
            throw Error('Unidentified response code.')
    }

    const session = await auth()

    if (!session?.accessToken)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: AuthRequest = {
        discordToken: session.accessToken,
    }

    const res = await fetch(new URL('/auth', process.env.PV_WEBSITE_API_URL), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: req.signal,
    })

    return NextResponse.json(await res.json())
}
