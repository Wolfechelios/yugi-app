import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get total cards count
    const totalCards = await db.collectionCard.aggregate({
      _sum: {
        quantity: true
      }
    })

    // Get total collections count
    const totalCollections = await db.collection.count()

    // Get recent scans (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentScans = await db.cardScan.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Get rare cards count (Super Rare and above)
    const rareCards = await db.card.count({
      where: {
        OR: [
          { rarity: 'Super Rare' },
          { rarity: 'Ultra Rare' },
          { rarity: 'Secret Rare' },
          { rarity: 'Prismatic Secret Rare' },
          { rarity: 'Ultimate Rare' },
          { rarity: 'Ghost Rare' }
        ]
      }
    })

    const stats = {
      totalCards: totalCards._sum.quantity || 0,
      totalCollections,
      recentScans,
      rareCards
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}