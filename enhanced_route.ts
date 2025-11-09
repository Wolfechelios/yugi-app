
import { supabase } from "@/lib/db"

export async function POST(req) {
  try {
    const { scanId } = await req.json()
    if (!scanId) return Response.json({ error: "Missing scanId" }, { status: 400 })

    await supabase.from("retry_jobs").insert({
      scan_id: scanId,
      status: "queued",
      created_at: new Date().toISOString()
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error("RETRY ERROR:", err)
    return Response.json({ error: "Retry failed" }, { status: 500 })
  }
}
