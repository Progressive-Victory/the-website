import dbConnect from "@/util/libmongo";
import { User} from "@/models/User"
import { checkAuthPermissions, PermissionName, ResponseCode } from "@/util/auth";
import { NextRequest, NextResponse } from "next/server";
import { URLWrapper } from "@/util/url-wrapper";
import { Query } from "mongoose";

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
    console.log(query)
    const keyVals: Map<string, string> = new Map<string, string>()
    let count: number
    if(query){
      try {
        const queryArgs: string[] = query.split(',')
        queryArgs.map((str) => {
          const pair: string[] = str.split('%3A')
          keyVals.set(pair[0], pair[1])
          console.log(keyVals.get('name'))
        })
      } catch(err) {
        console.error(err)
      }

      await dbConnect()
      
      let data: Query<any, any> = User.find()
      keyVals.forEach((value: string, key: string) => {
        data = data.where(key).equals(value)
      })

      count = await data.countDocuments()
    } else {
      await dbConnect()
      count = await User.countDocuments()
    }

    return NextResponse.json(count)
}