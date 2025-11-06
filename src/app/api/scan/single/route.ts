import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const image = body.image
    const userId = body.userId

    if (!image || !userId) {
      return Response.json(
        { success: false, error: 'Image and userId are required' },
        { status: 400 }
      )
    }

    // Create a scan record first
    const scan = await db.cardScan.create({
      data: {
        userId,
        imageUrl: image,
        status: 'pending',
        confidence: null,
        ocrText: null,
        cardId: null
      }
    })

    try {
      // Mock card data for testing
      const mockCardData = {
        name: 'Dark Magician',
        type: 'Monster',
        attribute: 'DARK',
        level: 7,
        attack: 2500,
        defense: 2100,
        rarity: 'Super Rare',
        description: 'The ultimate wizard in terms of attack and defense.',
        archetype: 'Dark Magician'
      }

      // Find or create the card in the database
      let card = await db.card.findFirst({
        where: {
          name: mockCardData.name
        }
      })

      if (!card) {
        card = await db.card.create({
          data: {
            ...mockCardData,
            cardCode: 'SDK-001',
            imageUrl: image
          }
        })
      }

      // Update the scan with the results
      const updatedScan = await db.cardScan.update({
        where: { id: scan.id },
        data: {
          status: 'identified',
          confidence: 0.89,
          ocrText: JSON.stringify({
            extractedText: mockCardData.name,
            confidence: 0.89,
            processingTime: '1.2s'
          }),
          cardId: card.id
        },
        include: {
          card: true
        }
      })

      return Response.json({
        success: true,
        scan: updatedScan,
        card: card
      })

    } catch (aiError) {
      console.error('AI processing error:', aiError)
      
      // Update scan as failed
      await db.cardScan.update({
        where: { id: scan.id },
        data: {
          status: 'failed',
          ocrText: JSON.stringify({
            error: 'AI processing failed',
            details: aiError instanceof Error ? aiError.message : 'Unknown error'
          })
        }
      })

      return Response.json({
        success: false,
        error: 'Failed to identify card',
        scanId: scan.id
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Single scan error:', error)
    return Response.json(
      { success: false, error: 'Failed to process scan' },
      { status: 500 }
    )
  }
}