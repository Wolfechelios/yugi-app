// app/api/message/route.ts
import { NextResponse } from "next/server";
import { pusher } from "@/lib/pusher";

export async function POST(req: Request) {
  const { text, senderId } = await req.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }

  // Broadcast to a public channel "chat" with event "message"
  await pusher.trigger("chat", "message", {
    text,
    senderId: senderId ?? "anonymous",
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}