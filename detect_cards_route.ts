
import { supabase } from "@/lib/db"
import { uploadScanImage } from "@/src/lib/fileUpload"
import { v4 as uuidv4 } from "uuid"

export async function POST(req) {
  try {
    const body = await req.formData()
    const file = body.get("file")

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const upload = await uploadScanImage(buffer, "jpg")

    if (!upload) {
      return Response.json({ error: "Upload failed" }, { status: 500 })
    }

    const scanId = uuidv4()

    await supabase.from("scans").insert({
      id: scanId,
      status: "pending",
      image_url: upload.url,
      created_at: new Date().toISOString(),
    })

    return Response.json({ scanId, imageUrl: upload.url })
  } catch (err) {
    console.error("SCAN ERROR:", err)
    return Response.json({ error: "Internal error" }, { status: 500 })
  }
}
