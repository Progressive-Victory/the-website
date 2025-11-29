import Location from '@/models/Location'
import dbConnect from '@/util/libmongo'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

export async function GET(req: NextRequest) {
    const u = typeof req.url === 'string' ? new URL(req.url) : req.url
    const zip = u.searchParams.get('zipcode')

    await dbConnect()

    const res = await Location.findOne({ zip: zip }).exec()
    return NextResponse.json(
        {
            city: res?.primary_city,
            county: res?.county,
            state: res?.state,
        },
        {
            status: 200,
        }
    )
}
