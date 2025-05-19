import { NextRequest, NextResponse } from "next/server";
import { getLoc } from "@/util/loc";

export async function POST(req: NextRequest){
    const zip: string = await req.json()
    const res: string[] = await getLoc(zip)

    return NextResponse.json(res)
}