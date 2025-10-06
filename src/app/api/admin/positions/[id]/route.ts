import mongoose from 'mongoose'
import { IPosition, Position } from '@/models/Position'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/util/libmongo'
import {
    auth,
    checkAuth,
    checkAuthPermissions,
    PermissionName,
    ResponseCode,
} from '@/util/auth'

export async function GET(
    req: NextRequest,
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

    await dbConnect()

    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json(
            {
                error: 'Bad Request',
                message: `Invalid object ID`,
            },
            { status: 400 }
        )
    }

    //const positions = Position.aggregate()
    const position = await Position.findById(id).exec()

    if (!position)
        return NextResponse.json({
            error: 'Not Found',
            message: 'The requested object does not exist',
        })

    console.log(position)

    return NextResponse.json(position)
}

async function retrievePosition(id) {
    const position = await Position.findById(id)

    return position
}
