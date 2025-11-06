"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import CardTile from "./CardTile"

export default function CompareMode() {
  const [compareList, setCompareList] = useState<any[]>([])

  return (
    <div className="space-y-4 p-2">
      <h2 className="text-xl font-bold">Compare Cards</h2>

      {compareList.length === 0 && (
        <p className="text-gray-500 text-center">
          Tap “Compare” on any card to add it here.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {compareList.map((c, i) => (
          <Card key={i} className="shadow-md">
            <CardContent className="p-2">
              <CardTile card={c} onClick={() => {}} />

              <div className="text-center mt-2 text-sm">
                <p>ATK: {c.atk ?? "-"}</p>
                <p>DEF: {c.def ?? "-"}</p>
                <p>Level: {c.level ?? "-"}</p>
                <p>{c.attribute}</p>
              </div>

              <button
                className="mt-2 text-red-500 text-xs w-full"
                onClick={() =>
                  setCompareList((prev) => prev.filter((x) => x.name !== c.name))
                }
              >
                Remove
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
