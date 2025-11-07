import { supabase } from "@/lib/db"
import { someFn } from "@/lib/ygo-api"


export async function processScan(scan) {
  try {
    const result = await searchYGOCard(scan.card_name)

    if (!result) {
      await supabase.from("scans")
        .update({ status: "failed", updated_at: new Date() })
        .eq("id", scan.id)
      return
    }

    const ygoId = await saveOfficialYGOCards(result)

    await supabase.from("scans")
      .update({
        status: "success",
        db_match: true,
        official_image_url: result.card_images?.[0]?.image_url,
        ygo_card_id: ygoId,
        updated_at: new Date()
      })
      .eq("id", scan.id)

  } catch (err) {
    console.error("PROCESS ERROR:", err)
  }
}
