import { supabase } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a scan image (Buffer or Uint8Array or base64 string) to the 'scans' bucket.
 * Returns { publicUrl, path }.
 */
export async function uploadScanImage(input: ArrayBuffer | Uint8Array | Buffer | string, opts?: { contentType?: string }) {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_SCANS_BUCKET || "scans";
  const id = uuidv4();
  const path = `${id}.jpg`;

  let data: Uint8Array;
  if (typeof input === "string") {
    // assume base64 or data URL
    const base = input.startsWith("data:") ? input.split(",", 2)[1] : input;
    data = Buffer.from(base, "base64");
  } else if (input instanceof ArrayBuffer) {
    data = new Uint8Array(input);
  } else {
    data = input as Uint8Array;
  }

  const { error } = await supabase.storage.from(bucket).upload(path, data, {
    contentType: opts?.contentType ?? "image/jpeg",
    upsert: false,
  });
  if (error) throw error;

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: pub.publicUrl, path };
}
