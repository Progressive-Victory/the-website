import dbConnect from "@/util/libmongo";
import { Permission } from "@/models/Permission";
import { checkAuth, ResponseCode } from "@/util/auth";
import { NextRequest, NextResponse } from "next/server";
import { error } from "console";

export async function GET() {
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

    const data = await Permission.find()
        .exec()

    return NextResponse.json(data)
}