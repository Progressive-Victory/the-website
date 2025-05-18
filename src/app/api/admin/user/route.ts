import dbConnect from "@/util/libmongo";
import { User, IUser } from "@/models/User"
import { checkAuth, checkAuthPermissions, PermissionName, ResponseCode } from "@/util/auth";
import { NextRequest, NextResponse } from "next/server";
import { error } from "console";

export async function GET() {
    // check session auth
    const response = await checkAuthPermissions([PermissionName.VIEW_MEMBER_DATA])
    console.log({response})

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
            throw error("Unidentified response code.")
    }

    await dbConnect()

    //grab list of all users
    const data = await User.find()
            .populate({
                path: 'roles',
                populate: {
                    path: 'permissions'
                }
            }).exec()

    //return list
    return NextResponse.json(data)
}

// Helper function for updating the values of an existing object using keys.
// No idea why but it refuses to work without using generics.
function updateUserObj<Key extends keyof IUser>(key: Key, obj: IUser, value: IUser[Key])  {
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
            throw error("Unidentified response code.")
    }

    await dbConnect()

    // pull the data submitted in the body and parse
    const data = await req.json() as Partial<IUser>[]
    // get a list of users from the database
    const dbUsrList = (await User.find({})
    .populate({
        path: 'roles',
        populate: {
            path: 'permissions'
        }
    })
    .exec()) as IUser[]

    // iterate through every item in data to apply changes to it.
    data.forEach(async(usr: Partial<IUser>) => {
        // grab the user object in the databaseUser list that corresponds to the current submitted list
        const dbUsr: IUser = dbUsrList.find(x => x.discordId == usr.discordId) as IUser
        // iterate through each key of the submitted user object
        Object.keys(usr).forEach((k) => {
            // set the str key value to a Key type
            const key = k as keyof IUser

            // list of fields allowed to be changed
            const allowed = [
                'roles'
            ]

            // wait tf. this logic makes no sense. I pulled this from /api/user but the whole thing seems to work. how? Im so god damned confused.
            if(dbUsr[key] !== usr[key] || !allowed.includes(key)) {
                updateUserObj(key, dbUsr, usr[key])
            }
         })
         await dbConnect() // for some reason without this  second dbConnect() the whole thing breaks. ;w; help
         await dbUsr.save() // save the user object to commit changes.
    })
   return NextResponse.json({status: 200})
}