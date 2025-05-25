import dbConnect from "@/util/libmongo";
import { Role, IRole } from "@/models/Role";
import { checkAuth, ResponseCode } from "@/util/auth";
import { NextResponse, NextRequest } from "next/server";

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
            throw Error("Unidentified response code.")
    }

    await dbConnect()

    //query all permissions
    const data = await Role.find()
        .populate('permissions')
        .exec()

    //return list
    return NextResponse.json(data)
}

function updateRoleObj<Key extends keyof IRole>(key: Key, obj: IRole, value: IRole[Key])  {
    obj[key] = value
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
            throw Error("Unidentified response code.")
    }

    await dbConnect()

    const data = await req.json() as Partial<IRole>[]
    const dbRoleList = (await Role.find({})
        .populate('permissions')
        .exec()) as IRole[]

    for (const role of data) {
        const dbRole = dbRoleList.find(x => x.name == role.name)
        if(dbRole){
            //update existing role
            Object.keys(role).forEach((k) => {
                const key = k as keyof IRole
    
                const allowed = [
                    'permissions'
                ]

                if(dbRole[key] !== role[key] || !allowed.includes(key)) {
                    updateRoleObj(key, dbRole, role[key])
                }
            })
            await dbConnect()
            void dbRole.save()
        } else {
            //logic route for creating new role
            void Role.create(role)
        }
    }

    return NextResponse.json({status: 200})
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
                throw Error("Unidentified response code.")
        }
    
        await dbConnect()

        const data = await req.json() as IRole

        await Role.deleteOne({name: data.name}).exec()

        return NextResponse.json({status: 200})
}