import { NextResponse } from 'next/server'

export function GET() {
    return NextResponse.json({ apiBaseUrl: process.env.PV_WEBSITE_API_URL })
}
