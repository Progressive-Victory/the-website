import dbConnect from "@/util/libmongo";
import { IUser, User } from "@/models/User"
import { IRole } from "@/models/Role";
import { authOptions } from "@/util/auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";

const hasRequiredRoles = (user: IUser, requiredRoles: string[] = []) => {
    const userRoles = user.roles as IRole[]
    const roleStrs = userRoles.map((role: IRole) => role.name)
    if (!user || !user.roles || !Array.isArray(user.roles)) return false
    return requiredRoles.every((role) => roleStrs.includes(role))
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })

    if(!session || !token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const user: IUser = await User.findOne({discordId: session.discordId})
        .populate({
            path: 'roles',
            populate: {
                path: 'permissions'
            }
        })
        .exec() as IUser

    if (!hasRequiredRoles(user, ["Superadmin"])) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await User.find()
            .populate({
                path: 'roles',
                populate: {
                    path: 'permissions'
                }
            }).exec()

    return NextResponse.json(data)
}