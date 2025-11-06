import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const cardData = await request.json()
    
    // Validate required fields
    if (!cardData.name || !cardData.type) {
      return NextResponse.json(
        { error: 'Card name and type are required' },
        { status: 400 }
      )
    }
    
    // Additional validation for monsters
    if (cardData.type === 'monster') {
      if (!cardData.attribute) {
        return NextResponse.json(
          { error: 'Monster attribute is required' },
          { status: 400 }
        )
      }
      if (!cardData.level && !cardData.rank) {
        return NextResponse.json(
          { error: 'Monster must have either level or rank' },
          { status: 400 }
        )
      }
      if (cardData.attack === undefined || cardData.defense === undefined) {
        return NextResponse.json(
          { error: 'Monster must have both attack and defense values' },
          { status: 400 }
        )
      }
    }
    
    // Create the card in the database
    const card = await db.card.create({
      data: {
        name: cardData.name,
        type: cardData.type,
        attribute: cardData.attribute || null,
        level: cardData.level || null,
        rank: cardData.rank || null,
        attack: cardData.attack || null,
        defense: cardData.defense || null,
        effect: cardData.effect || null,
        rarity: cardData.rarity || 'common',
        cardNumber: cardData.cardNumber || null,
        setCode: cardData.setCode || null,
        archetype: cardData.archetype || null,
        description: cardData.description || null,
        limit: cardData.limit || null,
        imageUrl: `/api/placeholder/card/${Date.now()}`, // Generate placeholder image
        userId: cardData.userId || null
      }
    })
    
    // Create scan history entry
    if (cardData.userId) {
      await db.scanHistory.create({
        data: {
          cardId: card.id,
          userId: cardData.userId,
          scanType: 'MANUAL',
          ocrResult: 'Manual entry',
          confidence: 100,
          processingTime: 0
        }
      })
    }
    
    return NextResponse.json(card)
    
  } catch (error) {
    console.error('Error creating manual card:', error)
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    )
  }
}