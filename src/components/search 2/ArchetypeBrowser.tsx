"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/db"
import CardTile from "./CardTile"
import CardDetailModal from "./CardDetailModal"

export default function ArchetypeBrowser() {
  const [archetypes, setArchetypes] = useState([])
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)

  const load = async () => {
    const { data } = await supabase
      .from("ygo_cards")
      .select("*")

    setCards(data || [])

    const grouped = {}
    data?.forEach(card => {
      if (!card.archetype) return
      if (!grouped[card.archetype]) grouped[card.archetype] = []
      grouped[card.archetype].push(card)
    })

    setArchetypes(Object.entries(grouped))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-xl font-bold">By Archetype</h2>

      {archetypes.length === 0 && (
        <p className="text-gray-500 text-center pt-10">
          No archetypes yet — scan more cards.
        </p>
      )}

      <div className="space-y-6">
        {archetypes.map(([name, cards]) => (
          <div key={name}>
            <h3 className="font-semibold text-lg mb-2">{name}</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cards.map((c, i) => (
                <CardTile 
                  key={i} 
                  card={c} 
                  onClick={() => setSelectedCard(c)} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <CardDetailModal 
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  )
}
