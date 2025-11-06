import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const imageUrl = body.imageUrl

    if (!imageUrl) {
      return Response.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Simple mock response for testing
    const mockDetectedCards = [
      {
        id: 'detected-1',
        x: 50,
        y: 50,
        width: 200,
        height: 280,
        image: imageUrl,
        confidence: 0.92
      }
    ]

    return Response.json({
      success: true,
      cards: mockDetectedCards,
      totalCards: mockDetectedCards.length
    })

  } catch (error) {
    console.error('Card detection error:', error)
    return Response.json(
      { success: false, error: 'Failed to detect cards' },
      { status: 500 }
    )
  }
}