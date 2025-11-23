import { checkAuth, ResponseCode } from '@/util/auth'
import { FetchRequest } from '@/util/fetch'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
    const apiReq = (await req.json()) as FetchRequest

    const response = await checkAuth(apiReq.requiredRoles)

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

    if (!process.env.API_URL?.trim())
        throw Error('API calls require an API url!')
    if (!process.env.API_KEY?.trim())
        throw Error('API calls require an API key!')

    const res = await fetch(new URL(apiReq.url, process.env.API_URL), {
        method: apiReq.method,
        headers: {
            'Content-Type': 'application/json',
            Authentication: process.env.API_KEY ?? '',
        },
        body: JSON.stringify(apiReq.body),
    })

    return NextResponse.json(res)
}
