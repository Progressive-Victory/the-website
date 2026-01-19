import { User } from '@/models/User'
import { auth } from '@/util/auth'
import { HTTPStatus } from '@/util/https-status'
import dbConnect from '@/util/libmongo'
import { neutrino } from '@/util/neutrino'
import { OnboardingStage } from '@/util/stage'
import { NextRequest, NextResponse } from 'next/server'
import { phone } from 'phone'
import z from 'zod'

export const dynamic = 'force-dynamic'

const PostSmsSendRequest = z
    .object({
        number: z.string(),
    })
    .strict()

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session) {
        return new NextResponse(null, { status: HTTPStatus.UnAuthorized })
    }

    /* Parse and validate phone number */

    const result = PostSmsSendRequest.safeParse(await req.json())
    if (!result.success) {
        return NextResponse.json(
            {
                message: 'Invalid body schema',
                errors: result.error.issues,
            },
            { status: HTTPStatus.BadRequest }
        )
    }

    const { number } = result.data
    const parsed = phone(number, {
        country: 'US',
        strictDetection: false,
        validateMobilePrefix: true,
    })

    if (!parsed.isValid) {
        return NextResponse.json(
            { message: 'Invalid US mobile phone number' },
            { status: HTTPStatus.BadRequest }
        )
    }

    /* Find user */

    await dbConnect()

    const user = await User.findOne({ discordId: session?.discordId })
    if (!user) {
        console.error(`Failed to load user with valid session:`, session)
        return new NextResponse(null, {
            status: HTTPStatus.InternalServerError,
        })
    }

    if (user.onboardingStage != OnboardingStage.AWAITING_VERIFY) {
        return NextResponse.json(
            { message: 'Stage is not awaiting verify' },
            { status: HTTPStatus.BadRequest }
        )
    }

    /* Check last sent timestamp */

    const RATE_LIMIT_MS = 1_000 * 60

    if (user.lastSmsCodeSentAt) {
        const elapsed_ms = Date.now() - user.lastSmsCodeSentAt.getTime()

        if (elapsed_ms < RATE_LIMIT_MS) {
            const remaining = RATE_LIMIT_MS - elapsed_ms

            return NextResponse.json(
                {
                    message: `Please wait ${Math.floor(remaining / 1000)} more seconds`,
                },
                { status: HTTPStatus.TooManyRequests }
            )
        }
    }

    /* Send code to the user */

    const data = await neutrino.smsVerify(parsed.phoneNumber, {
        codeLength: 6,
        brandName: 'Progressive Victory',
        limit: 20,
        countryCode: 'US',
    })

    if ('api-error-msg' in data) {
        console.error('Failed to send SMS code:', data)
        return NextResponse.json(null, {
            status:
                data['api-error'] == 14
                    ? HTTPStatus.TooManyRequests
                    : HTTPStatus.InternalServerError,
        })
    }

    if (!data.sent) {
        console.error('Failed to send SMS code, and not an error:', data)
        return NextResponse.json(null, {
            status: HTTPStatus.InternalServerError,
        })
    }

    /* Record that we just sent a code */

    user.lastSmsCodeSent = data['security-code']
    user.lastSmsCodeSentAt = new Date()
    await user.save()

    return new Response(null, { status: HTTPStatus.Ok })
}
