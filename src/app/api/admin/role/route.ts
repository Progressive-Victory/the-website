import dbConnect from "@/util/libmongo";
import { Role } from "@/models/Role";
import { checkAuth, ResponseCode } from "@/util/auth";
import { NextRequest, NextResponse } from "next/server";
import { error } from "console";
import url from "url"

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

    const queryParams = url.parse(req.url, true).query
    console.log(queryParams)

    await dbConnect()

    const data = await Role.find()
        .populate('permissions')
        .exec()

    return NextResponse.json(data)
}