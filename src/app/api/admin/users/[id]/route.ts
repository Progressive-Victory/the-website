import MongoUser from '@/models/MongoUser'
import { checkAuthPermissions, PermissionName, ResponseCode } from '@/util/auth'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const response = await checkAuthPermissions([
        PermissionName.VIEW_MEMBER_DATA,
    ])

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

    const { id } = await params

    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json(
            {
                error: 'Bad Request',
                message: `Invalid object ID`,
            },
            { status: 400 }
        )
    }

    const user = await MongoUser.findById(id)
        .populate([
            {
                path: 'roles',
                populate: 'permissions',
            },
            'updateHistory',
        ])
        .exec()

    if (!user) {
        return NextResponse.json(
            {
                error: 'Not Found',
                message: 'The requested object does not exist',
            },
            { status: 404 }
        )
    }

    // TODO: redact fields based on member permission

    return NextResponse.json(user)
}
