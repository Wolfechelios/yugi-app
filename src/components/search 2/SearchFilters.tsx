"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"

export default function SearchFilters({ cards, setFiltered }) {
  const [search, setSearch] = useState("")
  const [type, setType] = useState("all")

  useEffect(() => {
    let res = cards

    if (search.trim() !== "") {
      const s = search.toLowerCase()
      res = res.filter(c => c.name.toLowerCase().includes(s))
    }

    if (type !== "all") {
      res = res.filter(c => c.type === type)
    }

    setFiltered(res)
  }, [search, type, cards])

  // Get unique card types for filter dropdown
  const types = Array.from(new Set(cards.map(c => c.type))).sort()

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      
      {/* Search Bar */}
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your cards..."
        className="w-full sm:max-w-sm"
      />

      {/* Type Filter */}
      <Select onValueChange={setType} defaultValue="all">
        <SelectTrigger className="w-full sm:w-40">
          {type === "all" ? "All Types" : type}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {types.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
