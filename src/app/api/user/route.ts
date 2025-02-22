import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { User, IUser } from '@/models/User'
import dbConnect from '@/util/libmongo'

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
export async function POST(req: NextRequest) {
    const session = await getServerSession()
    await dbConnect()

    // Check if the user is authenticated
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    // Load
    const data = await req.json()
    const user = data.user as IUser

    if (!user || user.name !== session.user?.name) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        // Exists?
        const existingUser = await User.findOne({ email: user.email })
        if (existingUser) {
            return new NextResponse('User already exists', { status: 400 })
        }

        // Create
        const newUser = new User(user)
        await newUser.save()
        return new NextResponse('User created', { status: 201 })
    } catch (error) {
        // Bad request
        console.error(error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
