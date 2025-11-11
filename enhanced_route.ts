import { supabase } from "@/lib/db"
// optional: import type { NextRequest } from "next/server"

// ✅ add type to req
export async function POST(req: Request) {
  try {
    const { scanId } = await req.json()
    if (!scanId) return Response.json({ error: "Missing scanId" }, { status: 400 })

    // ...your logic...
  } catch (e) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
}