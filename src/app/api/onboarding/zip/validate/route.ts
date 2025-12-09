import Location from '@/models/Location'
import dbConnect from '@/util/libmongo'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

const POSTZipRequest = z
    .object({
        code: z.string(),
    })
    .strict()

export async function POST(req: NextRequest) {
    const result = POSTZipRequest.safeParse(await req.json())

    if (!result.success) {
        return NextResponse.json(
            {
                error: 'Bad Request',
                message: 'Invalid body schema',
                errors: result.error.issues,
            },
            { status: 400 }
        )
    }

    const { code } = result.data
    console.log(`Code: ${code}`)

    await dbConnect()

    const isValidZip = (await Location.findOne({ zip: code }).exec()) !== null

    console.log(`isValidZip: ${isValidZip}`)

    return NextResponse.json(
        {
            isValidZip,
        },
        {
            status: 200,
        }
    )
}
