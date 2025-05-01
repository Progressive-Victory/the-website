import dbConnect from "@/util/libmongo";
import { Role } from "@/models/Role";
import { checkAuth, ResponseCode } from "@/util/auth";
import { NextResponse } from "next/server";
import { error } from "console";

export async function GET() {
    // check session auth
    const response = await checkAuth(["Superadmin"])

    // handle checkAuth response
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

    //query all permissions
    const data = await Role.find()
        .populate('permissions')
        .exec()

    //return list
    return NextResponse.json(data)
}