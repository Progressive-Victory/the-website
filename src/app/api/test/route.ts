import dbConnect from '@/util/libmongo'
import { NextRequest, NextResponse } from 'next/server'
import { Test } from '@/models/Test'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/util/auth'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    console.log(session, token)
    if (!session || !token) {
        console.log('Session: ' + session)
        console.log('Token: ' + token)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    console.log('MICHAELLLLLL')
    const testEntries = await Test.find()

    return NextResponse.json(testEntries)
}
