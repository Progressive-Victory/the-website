import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { User, IUser } from '@/models/User'
import dbConnect from '@/util/libmongo'
import { authOptions, checkAuth, ResponseCode } from '@/util/auth'
import { OnboardingStage } from '@/util/stage'
import { error } from 'console'
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

//retrieves the currently logged in user
async function retrieveUser() {
    const session = await getServerSession(authOptions)
    await dbConnect()

    // FIXME(hhammon) @NoDiscordIdIndex As far as I can tell, there's no index on the `discordId` key.
    // At least there isn't one in the dev database, and one isn't created in the model. This probably
    // needs to be addressed.

    const user = await User.findOne({ discordId: session?.discordId })
        .populate({
            path: 'roles',
            populate: {
                path: 'permissions',
            },
        })
        .exec()
    return user
}

export async function GET() {
    //check to make sure user is logged in
    const response = await checkAuth()

    //serve response based on the outcome of the auth check
    switch (response) {
        case ResponseCode.Successful:
            return NextResponse.json(await retrieveUser())
        case ResponseCode.Exception:
            return NextResponse.json({ error: 'Bad request' }, { status: 400 })
        case ResponseCode.NoSession:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        case ResponseCode.InsufficientAccess:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        default:
            throw error('Unidentified response code.')
    }
}

export async function PATCH(req: NextRequest) {
    //check to make sure user is logged in
    const response = await checkAuth()
    let user: IUser

    //serve response based on the outcome of the auth check
    switch (response) {
        case ResponseCode.Successful:
            user = (await retrieveUser()) as IUser
            break
        case ResponseCode.Exception:
            return NextResponse.json({ error: 'Bad request' }, { status: 400 })
        case ResponseCode.NoSession:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        case ResponseCode.InsufficientAccess:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        default:
            throw error('Unidentified response code.')
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

    await dbConnect()

    await user.save()

    return NextResponse.json(user)
}
