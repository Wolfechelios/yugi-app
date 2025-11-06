import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get scans with card information
    const scans = await db.cardScan.findMany({
      where: {
        userId
      },
      include: {
        card: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Format the response
    const formattedScans = scans.map(scan => ({
      id: scan.id,
      status: scan.status,
      confidence: scan.confidence,
      createdAt: scan.createdAt.toISOString(),
      updatedAt: scan.updatedAt.toISOString(),
      ocrText: scan.ocrText,
      imageUrl: scan.imageUrl,
      card: scan.card ? {
        id: scan.card.id,
        name: scan.card.name,
        type: scan.card.type,
        attribute: scan.card.attribute,
        level: scan.card.level,
        attack: scan.card.attack,
        defense: scan.card.defense,
        description: scan.card.description,
        rarity: scan.card.rarity,
        cardCode: scan.card.cardCode
      } : null
    }))

    return NextResponse.json(formattedScans)

  } catch (error) {
    console.error('Error fetching scan history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan history' },
      { status: 500 }
    )
  }
}