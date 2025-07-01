import dbConnect from "@/util/libmongo";
import { User, IUser } from "@/models/User"
import { checkAuth, checkAuthPermissions, PermissionName, ResponseCode } from "@/util/auth";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "mongoose";
import { URLWrapper } from "@/util/url-wrapper";

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

    //parse out query params
    const url = new URLWrapper(req.url)
    const query: string | undefined = url.getParam("query")
    const pageNumberStr = url.getParam("pageNumber")
    const entriesPerPageStr = url.getParam("entriesPerPage")
    const keyVals: Map<string, string> = new Map<string, string>()
    if(query){
      try {
        const queryArgs: string[] = query.split(' ')
        queryArgs.map((str) => {
          const pair: string[] = str.split(':')
          keyVals.set(pair[0], pair[1])
          console.log(keyVals.get('name'))
        })
      } catch(err) {
        console.error(err)
      }
    }
    console.log(query)
    if(!pageNumberStr || !entriesPerPageStr) throw new Error("pageNumber or entriesPerPage are undefiend")
    const pageNumber = Number.parseInt(pageNumberStr)
    const entriesPerPage = Number.parseInt(entriesPerPageStr)
    const skip = pageNumber * entriesPerPage

    const specialFields = [
      "roles"
    ]
    await dbConnect()

    //grab list of requested users
    let mongoQuery: Query<any, any> = User.find().populate({
                path: 'roles',
                populate: {
                    path: 'permissions'
                }
            })
    if(query && query != ""){
      keyVals.forEach((value: string, key: string) => {
        if(specialFields.find(x => key === x)) {
          //mongoQuery = mongoQuery.where(value).in(`${key}.name`)
        } else {
          mongoQuery = mongoQuery.where(key).equals(value)
        }
      })
    }
    const data = await mongoQuery.skip(skip)
            .limit(entriesPerPage)
            .exec()
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
            throw Error("Unidentified response code.")
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
    }))

    // iterate through every item in data to apply changes to it.
    data.forEach((usr) => {
        // grab the user object in the databaseUser list that corresponds to the current submitted list
        const dbUsr: IUser = dbUsrList.find(x => x.discordId == usr.discordId)!
        // iterate through each key of the submitted user object
        Object.keys(usr).forEach((k) => {
            // set the str key value to a Key type
            const key = k as keyof IUser

            // list of fields allowed to be changed
            // needs to be fixed, lets everything through
            const allowed = [
                'roles'
            ]

            // wait tf. this logic makes no sense. I pulled this from /api/user but the whole thing seems to work. how? Im so god damned confused.
            if(dbUsr[key] !== usr[key] || !allowed.includes(key)) {
                updateUserObj(key, dbUsr, usr[key])
            }
         })

        // save the user object to commit changes.
        void dbConnect().then(()=> void dbUsr.save()) // for some reason without this  second dbConnect() the whole thing breaks. ;w; help
    })
   return NextResponse.json({status: 200})
}