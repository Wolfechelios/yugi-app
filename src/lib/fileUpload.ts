import { supabase } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

type UploadOpts = { contentType?: string; ext?: string };

// Backward-compatible: allow second arg as string like "jpg" or "image/jpeg"
function normalizeOpts(arg?: string | UploadOpts): UploadOpts {
  if (!arg) return { contentType: "image/jpeg", ext: "jpg" };
  if (typeof arg === "string") {
    // map simple shorthands
    const s = arg.toLowerCase();
    if (s.includes("/")) return { contentType: s };
    if (s === "jpg" || s === "jpeg") return { contentType: "image/jpeg", ext: "jpg" };
    if (s === "png") return { contentType: "image/png", ext: "png" };
    if (s === "webp") return { contentType: "image/webp", ext: "webp" };
    return { contentType: "application/octet-stream" };
  }
  return { contentType: arg.contentType ?? "image/jpeg", ext: arg.ext };
}

/**
 * Uploads an image to the 'scans' bucket. Accepts Buffer/Uint8Array/ArrayBuffer/base64 string.
 * Backward-compatible signature: uploadScanImage(data, "jpg") or uploadScanImage(data, { contentType: "image/jpeg" })
 * Returns { publicUrl, path }.
 */
export async function uploadScanImage(
  input: ArrayBuffer | Uint8Array | Buffer | string,
  opts?: string | UploadOpts
) {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_SCANS_BUCKET || "scans";
  const id = uuidv4();
  const norm = normalizeOpts(opts);
  const ext = norm.ext ?? (norm.contentType?.split("/")[1] || "jpg");
  const path = `${id}.${ext}`;

  let data: Uint8Array;
  if (typeof input === "string") {
    const base = input.startsWith("data:") ? input.split(",", 2)[1] : input;
    data = Buffer.from(base, "base64");
  } else if (input instanceof ArrayBuffer) {
    data = new Uint8Array(input);
  } else {
    data = input as Uint8Array;
  }

  const { error } = await supabase.storage.from(bucket).upload(path, data, {
    contentType: norm.contentType ?? "image/jpeg",
    upsert: false,
  });
  if (error) throw error;

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: pub.publicUrl, path };
}
