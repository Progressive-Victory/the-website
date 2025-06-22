import dbConnect from "@/util/libmongo";
import { User, IUser } from "@/models/User"
import { checkAuth, checkAuthPermissions, PermissionName, ResponseCode } from "@/util/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
      // check session auth
    const response = await checkAuthPermissions([PermissionName.VIEW_MEMBER_DATA])

    // handle session auth response
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
            throw Error("Unidentified response code.")
    }

    await dbConnect()

    const data = await User.countDocuments({}).exec()

    return NextResponse.json(data)
}