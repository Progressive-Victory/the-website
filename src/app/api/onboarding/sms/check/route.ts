import { MongoUser } from '@/models/MongoUser'
import { auth } from '@/util/auth'
import { HTTPStatus } from '@/util/https-status'
import dbConnect from '@/util/libmongo'
import { neutrino } from '@/util/neutrino'
import { OnboardingStage } from '@/util/stage'
import { NextRequest, NextResponse } from 'next/server'
import z from 'zod'

export const dynamic = 'force-dynamic'

const PostSmsCheckRequest = z
    .object({
        code: z.string(),
    })
    .strict()

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session) {
        return new NextResponse(null, { status: HTTPStatus.UnAuthorized })
    }

    /* extract code */

    const result = PostSmsCheckRequest.safeParse(await req.json())
    if (!result.success) {
        return NextResponse.json(
            {
                message: 'Invalid body schema',
                errors: result.error.issues,
            },
            { status: HTTPStatus.BadRequest }
        )
    }

    const { code } = result.data

    /* Find user */

    await dbConnect()

    const user = await MongoUser.findOne({ discordId: session?.discordId })
    if (!user) {
        console.error(`Failed to load user with valid session:`, session)
        return new NextResponse(null, {
            status: HTTPStatus.InternalServerError,
        })
    }

    /* Verify with neutrino (this also does brute force detection for us based on user ID) */

    const verified = await neutrino.verifySecurityCode(code, user.id)

    if (!verified) {
        return NextResponse.json(
            { message: 'Incorrect or expired code' },
            { status: HTTPStatus.BadRequest }
        )
    }

    /* Validate that the code is correct (neutrino does not check which codes belong to who) */

    if (user.lastSmsCodeSent && code !== user.lastSmsCodeSent) {
        return NextResponse.json(
            { message: 'Incorrect or expired code' },
            { status: HTTPStatus.BadRequest }
        )
    }

    /* Update the user's verification status */

    user.onboardingStage = OnboardingStage.VERIFIED
    user.verified = true
    await user.save()

    return new Response(null, { status: HTTPStatus.Ok })
}
