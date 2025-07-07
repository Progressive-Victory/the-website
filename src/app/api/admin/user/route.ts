import dbConnect from "@/util/libmongo";
import { User, IUser } from "@/models/User"
import { checkAuth, checkAuthPermissions, PermissionName, ResponseCode } from "@/util/auth";
import { NextRequest, NextResponse } from "next/server";
import { Aggregate, Query } from "mongoose";
import { URLWrapper } from "@/util/url-wrapper";
import { FieldCase } from "@/util/field-case"

async function getFieldCase(name: string): Promise<FieldCase> {
  await dbConnect()

  //instantiate output
  let out: FieldCase = FieldCase.PrimitiveSinglet

  //test if type is an array or a singlet
  const myType = (await User.aggregate(
  [
    { "$project": { "fieldType": { "$type": `$${name}`} } }
  ]
  ).sample(1).exec())[0]

  console.log(myType)

  if (myType.fieldType == "array") {
    //the field must atleast be a primitive array
    out = FieldCase.PrimitiveArray

    //test if field is a complex array
    const _type = (await User.aggregate([
      { $unwind: { path: `$${name}` } },
      { $project: { 
        "fieldType": { $type: `$${name}` }
      } }
    ]).sample(1).exec())[0]
    console.log(_type)

    //set output based on test
    if (_type == 'objectId') {
      out = FieldCase.ComplexArray
    }
  } else {
    //test if field is a complex singlet
    if(myType == 'objectId') {
      out = FieldCase.ComplexSinglet
    }
  }

  return out
}

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

    await dbConnect()   

    //test query ///////////////////////////
    const test: IUser[] = await User.aggregate([
      {
        $lookup: { from: 'roles', localField: 'roles', foreignField: '_id', as: 'roles' },
      },
      {
        $match: { "roles.name": 'Superadmin' }
      }
    ]).exec()
    console.log(`test: ${test.map((obj) => {return JSON.stringify(obj)})}`)
    ////////////////////////////////////

    //grab list of requested users
    let mongoAggregate: Aggregate<any> = User.aggregate([
      {
        $lookup: { from: 'roles', localField: 'roles', foreignField: '_id', as: 'roles' },
      },
    ])
    if(query && query != ""){
      keyVals.forEach(async (value: string, key: string) => {
        mongoAggregate.match({ [key] : value })
        /*const _type: FieldCase = await getFieldCase(key)
        console.log(_type)
        switch (_type) {
          case FieldCase.PrimitiveSinglet:
            mongoAggregate.match({})
            break
          case FieldCase.PrimitiveArray:
            break
          case FieldCase.ComplexSinglet:
            break
          case FieldCase.ComplexArray:
            break
          default:
            throw new Error("unrecognized field case!")
        }*/
      })
    }
    const data = await mongoAggregate.skip(skip)
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