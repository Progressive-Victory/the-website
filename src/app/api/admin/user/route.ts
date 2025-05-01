import dbConnect from "@/util/libmongo";
import { User, IUser } from "@/models/User"
import { checkAuth, ResponseCode } from "@/util/auth";
import { NextRequest, NextResponse } from "next/server";
import { error } from "console";

export async function GET(req: NextRequest) {
    const response = await checkAuth(["Superadmin"])

    switch (response){
        case ResponseCode.Successful:
            break
        case ResponseCode.Exception:
            return NextResponse.json({ error: 'Bad request' }, { status: 400 })
        case ResponseCode.NoSession:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        case ResponseCode.InsufficientAccess:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        default:
            throw error("Unidentified response code.")
    }

    await dbConnect()

    const data = await User.find()
            .populate({
                path: 'roles',
                populate: {
                    path: 'permissions'
                }
            }).exec()

    return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
    const response = await checkAuth()

    switch(response) {
        case ResponseCode.Successful:
            break
        case ResponseCode.Exception:
            return NextResponse.json({ error: 'Bad request' }, { status: 400 })
        case ResponseCode.NoSession:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        case ResponseCode.InsufficientAccess:
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        default:
            throw error("Unidentified response code.")
    }

    await dbConnect()


    const data = (await req.json()) as Partial<IUser>[]
    const dbUsrList = (await User.find({})
    .populate({
        path: 'roles',
        populate: {
            path: 'permissions'
        }
    })
    .exec()) as IUser[]
    data.forEach(async(usr) => { 
        const dbUsr: IUser = dbUsrList.find(x => x.id == usr.id) as IUser
         Object.keys(usr).forEach((k) => {
            const key = k as keyof IUser
            
            const allowed = [
                'roles'
            ]

            if(dbUsr[key] !== usr[key] || !allowed.includes(key)) {
                dbUsr[key] = usr[key] as IUser[keyof IUser]
            }

            
         })
         await dbUsr.save()
    })
}