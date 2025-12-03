import { User, IUser } from '@/models/User'
import { auth, checkAuth, ResponseCode } from '@/util/auth'
import dbConnect from '@/util/libmongo'
import { OnboardingStage } from '@/util/stage'
import { NextRequest, NextResponse } from 'next/server'

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
    const session = await auth()
    await dbConnect()

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
            break
        case ResponseCode.Exception:
            return NextResponse.json({ error: 'Bad request' }, { status: 400 })
        case ResponseCode.NoSession:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        case ResponseCode.InsufficientAccess:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        default:
            throw Error('Unidentified response code.')
    }

    const usr: IUser = (await retrieveUser()) as IUser
    return NextResponse.json(sanitizeUser(usr))
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
            throw Error('Unidentified response code.')
    }

    const onboardingInit = user.onboardingStage

    //hey wait shouldn't fields like onboarding stage and completion dates not be editable in a user accessable endpoint?
    const data = (await req.json()) as Partial<IUser>
    user.firstName = data.firstName ?? user.firstName
    user.lastName = data.lastName ?? user.lastName
    user.dateOfBirth = data.dateOfBirth ?? user.dateOfBirth
    user.zipCode = data.zipCode ?? user.zipCode
    user.city = data.city ?? user.city
    user.county = data.county ?? user.county
    user.state = data.state ?? user.state
    user.phoneNumber = data.phoneNumber ?? user.phoneNumber
    user.acceptedAlerts = data.acceptedAlerts ?? user.acceptedAlerts
    user.onboardingStage = data.onboardingStage ?? user.onboardingStage

    if (
        (user.onboardingStage === OnboardingStage.AWAITING_VERIFY &&
            onboardingInit === OnboardingStage.NOT_STARTED) ||
        (user.onboardingStage === OnboardingStage.UNDERAGE &&
            onboardingInit === OnboardingStage.NOT_STARTED)
    )
        user.completedIntake = new Date()

    await dbConnect()
    await user.save()

    return NextResponse.json(sanitizeUser(user))
}

/**
 * Removes server-only fields from user objects before they are sent to the
 * client
 */
function sanitizeUser(user: IUser) {
    delete user.lastSmsCodeSent
    return user.toObject() as IUser
}
