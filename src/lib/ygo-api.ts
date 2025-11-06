
import { supabase } from "./db"

const API = "https://db.ygoprodeck.com/api/v7"

export async function searchYGOCard(name: string) {
  const url = `${API}/cardinfo.php?fname=${encodeURIComponent(name)}`
  const res = await fetch(url)
  const data = await res.json()
  if (!data?.data) return null
  return data.data[0]
}

export async function saveOfficialYGOCards(card) {
  const existing = await supabase
    .from("ygo_cards")
    .select("*")
    .eq("name", card.name)
    .maybeSingle()

  if (existing.data) return existing.data.id

  const { data, error } = await supabase
    .from("ygo_cards")
    .insert({
      name: card.name,
      type: card.type,
      attribute: card.attribute,
      atk: card.atk,
      def: card.def,
      level: card.level,
      passcode: card.id,
      image_url: card.card_images?.[0]?.image_url
    })
    .select()
    .single()

  if (error) return null
  return data.id
}
