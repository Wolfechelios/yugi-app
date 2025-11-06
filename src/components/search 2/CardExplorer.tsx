"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/db"
import CardTile from "./CardTile"
import CardDetailModal from "./CardDetailModal"
import SearchFilters from "./SearchFilters"

export default function CardExplorer() {
  const [cards, setCards] = useState([])
  const [filtered, setFiltered] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load your saved cards
  const loadCards = async () => {
    const { data, error } = await supabase
      .from("ygo_cards")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) console.error(error)
    else {
      setCards(data)
      setFiltered(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadCards()
  }, [])

  return (
    <div className="p-4 space-y-5">
      <h2 className="text-xl font-bold">Your Yugi-Scan Collection</h2>

      <SearchFilters cards={cards} setFiltered={setFiltered} />

      {loading && (
        <p className="text-gray-500 text-center pt-10">Loading your cards…</p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-gray-500 text-center pt-10">
          No cards yet. Scan some to start your vault.
        </p>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((card, i) => (
          <CardTile
            key={i}
            card={card}
            onClick={() => setSelectedCard(card)}
          />
        ))}
      </div>

      <CardDetailModal 
        card={selectedCard} 
        onClose={() => setSelectedCard(null)} 
      />
    </div>
  )
}
