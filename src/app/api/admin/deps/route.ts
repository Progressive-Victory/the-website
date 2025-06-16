import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const reqArgs = await req.json()
  const schema = reqArgs["schema"]
  console.log(`Schema: ${schema}`)
}