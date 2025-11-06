import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { collectionId, cardId, userId } = await request.json()

    if (!collectionId || !cardId || !userId) {
      return NextResponse.json(
        { error: 'Collection ID, Card ID, and User ID are required' },
        { status: 400 }
      )
    }

    // Check if collection exists and belongs to user
    const collection = await db.collection.findFirst({
      where: {
        id: collectionId,
        userId: userId
      }
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found or access denied' },
        { status: 404 }
      )
    }

    // Check if card is already in collection
    const existingCard = await db.collectionCard.findFirst({
      where: {
        collectionId: collectionId,
        cardId: cardId
      }
    })

    if (existingCard) {
      return NextResponse.json(
        { error: 'Card already exists in collection' },
        { status: 409 }
      )
    }

    // Add card to collection
    const collectionCard = await db.collectionCard.create({
      data: {
        collectionId: collectionId,
        cardId: cardId
      }
    })

    return NextResponse.json({
      success: true,
      collectionCard,
      message: 'Card added to collection successfully'
    })

  } catch (error) {
    console.error('Error adding card to collection:', error)
    return NextResponse.json(
      { error: 'Failed to add card to collection' },
      { status: 500 }
    )
  }
}