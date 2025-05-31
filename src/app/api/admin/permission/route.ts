import dbConnect from "@/util/libmongo";
import { Permission, IPermission } from "@/models/Permission";
import { checkAuth, ResponseCode } from "@/util/auth";
import { NextResponse, NextRequest } from "next/server";

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
            throw new Error("Unidentified response code.")
    }

    await dbConnect()

    const data = await Permission.find()
        .exec()

    return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
    //check session auth
    const response = await checkAuth()

    //handle checkAuth() response
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
            throw new Error("Unidentified response code.")
    }

    await dbConnect()

    const data = await req.json() as Partial<IPermission>[]
    const dbPermList = (await Permission.find({})
        .exec()) as IPermission[]

    data.forEach((perm: Partial<IPermission>) => {
        const dbPerm: IPermission = dbPermList.find(x => x.name === perm.name)!
        if(dbPerm){
            //update existing role
            //throw a not implemented for now
            return NextResponse.json({ error: 'Not Implemented '}, { status: 501 })
        } else {
            //logic route for creating new role
            void Permission.create(perm)
            
            return NextResponse.json({status: 200})
        }
    })
}

export async function DELETE(req: NextRequest) {
        //check session auth
        const response = await checkAuth()

        //handle checkAuth() response
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
                throw new Error("Unidentified response code.")
        }
    
        await dbConnect()

        const data = await req.json() as IPermission
        const perm = await Permission.deleteOne({name: data.name}).exec()

        console.log(perm)

        return NextResponse.json({status: 200})
}