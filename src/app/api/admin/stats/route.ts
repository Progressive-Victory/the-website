import Permission from '@/models/Permission'
import Role from '@/models/Role'
import User from '@/models/User'
import { checkAuth, ResponseCode } from '@/util/auth'
import dbConnect from '@/util/libmongo'
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

export async function get_collection_stats() {
    await dbConnect()

    const users_count = await User.countDocuments()
    const roles_count = await Role.countDocuments()
    const permissions_count = await Permission.countDocuments()

    return {
        users_count,
        roles_count,
        permissions_count,
    }
}
