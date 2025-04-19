import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { User, IUser } from '@/models/User'
import dbConnect from '@/util/libmongo'
import { authOptions } from '@/util/auth'
import { OnboardingStage } from '@/util/stage'
export const dynamic = 'force-dynamic'
/**
 * Create a new user.
 *
 * @param {NextRequest} req - The request object.
 *
 * @returns {NextResponse} The response object.
 *
 * @throws {Error} If the server encounters an error while creating the user.
 *
 * @example
 * Note: Before running the test make sure you auth with the Discord provider as the user you want to create
 * curl -X POST \
 *   http://localhost:3000/api/user \
 *   -H 'Content-Type: application/json' \
 *   -d '{"user":{"name":"John Doe","email":"john@example.com","image":"https://example.com/john.jpg"}}'
 */

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    await dbConnect()

    if (!session || !token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ discordId: token?.discordId || '' })
        .populate('roles')
    if (!user) {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    await dbConnect()

    if (!session || !token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = (await User.findOne({
        discordId: token?.discordId || '',
    })) as IUser

    if (!user) {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    // Make sure we're at onboarding stage
    if (
        user.onboardingStage === OnboardingStage.NOT_STARTED ||
        user.onboardingStage === OnboardingStage.AWAIT_VERIFICATION
    ) {
        const data = (await req.json()) as Partial<IUser>
        Object.keys(data).forEach((k) => {
            const key = k as keyof IUser
            // Sets what keys we can set on the new objects
            const allowed = [
                'zipCode',
                'preferredNamed',
                'phoneNumber',
                'acceptedAlerts',
                // A user may go back one stage in case they enter a bad number
                user.onboardingStage === OnboardingStage.AWAIT_VERIFICATION
                    ? 'onboardingStage'
                    : '',
            ]
            if (user[key] !== data[key] || !allowed.includes(key)) {
                // @ts-expect-error potential bad key
                user[key] = data[key] as IUser[keyof IUser]
            }
        })
    } else {
        // we only want to allow updating the stage and verified after this point
        return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }

    await user.save()

    return NextResponse.json(user)
}
