import { MongoUser } from '@/models/MongoUser'
import dbConnect from '@/util/libmongo'
import { States } from '@/util/states'
import { NextResponse } from 'next/server'

export async function GET() {
    await dbConnect()
    const stateCount: Record<string, number> = {}
    const stateArr: string[] = Object.keys(States).filter((x) => isNaN(+x))
    await Promise.all(
        stateArr.map(async (state) => {
            stateCount[state] = await MongoUser.countDocuments({
                state: state,
            }).exec()
        })
    )

    return NextResponse.json(stateCount)
}
