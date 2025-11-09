import { NextRequest, NextResponse } from "next/server";
import { uploadScanImage } from "@/lib/fileUpload";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64 } = body || {};
    if (!imageBase64) {
      return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
    }
    const uploaded = await uploadScanImage(imageBase64);
    return NextResponse.json({ ok: true, uploaded }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
