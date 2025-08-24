import { checkAuth, ResponseCode } from '@/util/auth'
import { get_collection_stats } from '@/util/stats'
import { NextResponse } from 'next/server'

export async function GET() {
    const response = await checkAuth(['Superadmin'])

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
            throw new Error('Unidentified response code.')
    }

    return NextResponse.json(await get_collection_stats())
}
