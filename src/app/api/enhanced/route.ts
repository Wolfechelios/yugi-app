import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export const runtime = "nodejs"; // make explicit; change to "edge" if needed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    // Example: basic health check or placeholder logic
    // const { data, error } = await supabase.from("items").select("*").limit(1);
    return NextResponse.json({ ok: true, received: body }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
