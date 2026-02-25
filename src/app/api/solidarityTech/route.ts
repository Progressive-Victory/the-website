import { SolidarityPostUserRequest } from '@/contracts/requests'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const solidarityUser: SolidarityPostUserRequest = {
        phone_number: searchParams.get('phone'),
        email: searchParams.get('email'),
        first_name: searchParams.get('first_name'),
        last_name: searchParams.get('last_name'),
        preferred_language: 'Unknown', // must be set in request, but we don't ask
        chapter_id: 1454, // this ID is for Fundraising Team chapter, need to talk to Picklyme about this
        custom_user_properties: {
            discord_id: searchParams.get('discord_id'),
        },
        address: {
            city: searchParams.get('city'),
            state: searchParams.get('state'),
            zip_code: searchParams.get('zip'),
        },
    }

    try {
        console.log(
            `Generated request object for solidarity user: ${JSON.stringify(solidarityUser)}`
        )

        const resp = await fetch('https://api.solidarity.tech/v1/users', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                authorization: `Bearer ${process.env.SOLIDARITY_TOKEN}`,
            }),
            body: JSON.stringify(solidarityUser),
        })

        if (!resp.ok) {
            console.error(
                `Failed to fetch from Solidarity: ${resp.status} - ${resp.statusText}`
            )
            throw new Error(
                `Failed to fetch from Solidarity: ${resp.status} - ${resp.statusText}`
            )
        }

        console.log(`Response status: ${resp.status} - ${resp.statusText}`)
    } catch (error) {
        console.error(`Failed to fetch from Solidarity: ${error as string}`)
        throw new Error(`Failed to fetch from Solidarity: ${error as string}`)
    }

    return NextResponse.json({
        message: 'No failures captured while fetching to Solidarity Tech',
    })
}
