import { NextRequest, NextResponse } from "next/server";
import { uploadScanImage } from "@/lib/fileUpload";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: "form-data required" }, { status: 400 });
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "file field required" }, { status: 400 });
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploaded = await uploadScanImage(buffer, { contentType: file.type || "image/jpeg" });
    return NextResponse.json({ ok: true, uploaded }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
