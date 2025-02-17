import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import * as nextauth from "next-auth"
import { User, IUser } from '@/models/User'
import dbConnect from '@/util/libmongo'
import { getToken } from 'next-auth/jwt'

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
    const session = await getServerSession()
    // Profile
    const token = await getToken({req})
    // nextauth.
    await dbConnect()
    // Check if the user is authenticated
    if (!session || !(session.user) || !token) {
        return new NextResponse('Unauthorized', { status: 401 })
    } else {
    //token.sub is the unique identifier discord generates for users.
    const userid = token.sub

    // token.displayname is created in the authOptions callback jwt
    const display_name = token.display_name 
    try {
        // Exists?
        const existingUser = await User.findOne({ id: userid})
        if (existingUser) {
            return new NextResponse(JSON.stringify(existingUser), { status: 200 })
        }

        // Create
        const user = {id: userid, handle: session.user.name, display_name: display_name, image: session.user.image} as IUser
        const newUser = new User(user)
        await newUser.save()
        return new NextResponse(JSON.stringify(newUser), { status: 201 })
    } catch (error) {
        // Bad request
        console.error(error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
}
