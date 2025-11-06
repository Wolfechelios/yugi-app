"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/db"
import CardTile from "./CardTile"
import CardDetailModal from "./CardDetailModal"

export default function RecommendedCards() {
  const [saved, setSaved] = useState([])
  const [recommended, setRecommended] = useState([])
  const [selected, setSelected] = useState(null)

  const load = async () => {
    const { data } = await supabase.from("ygo_cards").select("*")
    setSaved(data || [])

    if (!data || data.length === 0) return

    // Most common card type
    const counts = {}
    data.forEach((c) => {
      counts[c.type] = (counts[c.type] || 0) + 1
    })

    const beloved = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]

    // Pull 20 new cards of that type from YGO ProDeck
    const res = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?type=${encodeURIComponent(
        beloved
      )}`
    )

    const json = await res.json()
    const list = json.data.slice(0, 20)

    // Exclude cards you already saved
    const filtered = list.filter(
      (x) => !data.some((s) => s.name === x.name)
    )

    setRecommended(filtered)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-xl font-bold">Recommended For You</h2>

      {recommended.length === 0 && (
        <p className="text-gray-500 text-center">
          Not enough data yet — scan some cards.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {recommended.map((c, i) => (
          <CardTile 
            key={i} 
            card={c} 
            onClick={() => setSelected(c)}
          />
        ))}
      </div>

      <CardDetailModal 
        card={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
