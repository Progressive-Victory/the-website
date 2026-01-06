import { MongoUser } from '@/models/MongoUser'
import dbConnect from '@/util/libmongo'
import { NextResponse } from 'next/server'

export async function GET() {
    await dbConnect()
    const userCount = await MongoUser.countDocuments().exec()
    return NextResponse.json(userCount)
}
