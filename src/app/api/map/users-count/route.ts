import dbConnect from "@/util/libmongo";
import { User } from "@/models/User"
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect()
  const userCount = await User.countDocuments().exec()
  return NextResponse.json(userCount)
}