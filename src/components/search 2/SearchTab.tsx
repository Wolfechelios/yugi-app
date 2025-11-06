"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { searchYGOCard } from "@/lib/ygo-api"
import CardTile from "./CardTile"
import CardDetailModal from "./CardDetailModal"
import SearchFilters from "./SearchFilters"
import SuggestionsBox from "./SuggestionsBox"
import RecommendedCards from "./RecommendedCards"

export default function SearchTab() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  const performSearch = async () => {
    if (!query.trim()) return toast.error("Type something")

    setLoading(true)
    try {
      const card = await searchYGOCard(query)
      if (!card) return toast.error("No results")

      setResults([card])
    } catch (e) {
      toast.error("Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Search bar */}
      <div className="flex gap-2 p-2">
        <Input 
          placeholder="Search card…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={performSearch} disabled={loading}>
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search />}
        </Button>
      </div>

      {/* Live suggestions */}
      <SuggestionsBox query={query} onSelect={(v) => { setQuery(v); performSearch(); }} />

      {/* Filters */}
      <SearchFilters onFilter={() => performSearch()} />

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map((card, i) => (
          <CardTile key={i} card={card} onClick={() => setSelected(card)} />
        ))}
      </div>

      {/* Recommended section */}
      {results.length > 0 && (
        <RecommendedCards base={results[0]} onSelect={(c) => setSelected(c)} />
      )}

      <CardDetailModal card={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
