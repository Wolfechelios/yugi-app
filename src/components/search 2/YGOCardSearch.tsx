"use client"

import { useState } from "react"
import SearchTab from "./SearchTab"
import ArchetypeBrowser from "./ArchetypeBrowser"
import CardExplorer from "./CardExplorer"
import CompareMode from "./CompareMode"
import { Button } from "@/components/ui/button"

export default function YGOCardSearch() {
  const [tab, setTab] = useState<"search" | "archetypes" | "explorer" | "compare">("search")

  const tabButton = (label: string, value: any) => (
    <Button
      variant={tab === value ? "default" : "outline"}
      className="flex-1"
      onClick={() => setTab(value)}
    >
      {label}
    </Button>
  )

  return (
    <div className="space-y-4 pb-20">

      {/* TAB NAVIGATION */}
      <div className="grid grid-cols-4 gap-2 sticky top-0 bg-white z-20 p-2 border-b">
        {tabButton("Search", "search")}
        {tabButton("Archetypes", "archetypes")}
        {tabButton("Explorer", "explorer")}
        {tabButton("Compare", "compare")}
      </div>

      {/* TAB CONTENT */}
      {tab === "search" && <SearchTab />}
      {tab === "archetypes" && <ArchetypeBrowser />}
      {tab === "explorer" && <CardExplorer />}
      {tab === "compare" && <CompareMode />}
    </div>
  )
}
