// single_scan_route.ts

// -- Tiny helper so OpenAI "content" is always a string (works with older typings)
export function asStringMessage(text: unknown, imageUrl?: unknown) {
  const t = String(text ?? '');
  const u = typeof imageUrl === 'string' && imageUrl ? `\nImage URL: ${imageUrl}` : '';
  return t + u;
}

// -- Minimal message shape your other code can use safely
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Build a user message for "card" scans (string-only content)
export function buildCardMessages(cardPrompt: unknown, imageUrl?: unknown): ChatMessage[] {
  return [
    {
      role: 'user',
      content: asStringMessage(cardPrompt, imageUrl),
    },
  ];
}

// Build a user message for OCR scans (string-only content)
export function buildOcrMessages(ocrPrompt: unknown, imageUrl?: unknown): ChatMessage[] {
  return [
    {
      role: 'user',
      content: asStringMessage(ocrPrompt, imageUrl),
    },
  ];
}

/**
 * Optional route-style handler (harmless if not used).
 * Lets you POST { mode: "card" | "ocr", cardPrompt?, ocrPrompt?, imageUrl? }
 * and get back the messages array. Keeps TS happy either way.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const mode = (body?.mode ?? 'card') as 'card' | 'ocr';
    const imageUrl = body?.imageUrl;

    const messages =
      mode === 'ocr'
        ? buildOcrMessages(body?.ocrPrompt ?? '', imageUrl)
        : buildCardMessages(body?.cardPrompt ?? '', imageUrl);

    return Response.json({ ok: true, messages });
  } catch {
    return Response.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}

// Default export for folks importing the module as a bag of helpers
export default {
  asStringMessage,
  buildCardMessages,
  buildOcrMessages,
};