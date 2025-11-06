import { NextRequest, NextResponse } from 'next/server'
import { searchCardPrice, simulatePriceLookup } from '@/lib/pricecharting'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cardName = searchParams.get('cardName')
    const setName = searchParams.get('setName')

    if (!cardName) {
      return NextResponse.json(
        { error: 'Card name is required' },
        { status: 400 }
      )
    }

    // Try to get real price data first
    const priceResult = await searchCardPrice(cardName, setName || undefined)
    
    if (!priceResult.success || !priceResult.data) {
      // Fall back to simulated data for demo purposes
      const simulatedResult = await simulatePriceLookup(cardName)
      return NextResponse.json({
        success: true,
        data: simulatedResult.data,
        simulated: true,
        message: 'Using simulated price data for demo'
      })
    }

    return NextResponse.json({
      success: true,
      data: priceResult.data,
      simulated: false,
      message: 'Price data loaded successfully'
    })

  } catch (error) {
    console.error('Price lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup price information' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cardName, setName } = body

    if (!cardName) {
      return NextResponse.json(
        { error: 'Card name is required' },
        { status: 400 }
      )
    }

    // Try to get real price data first
    const priceResult = await searchCardPrice(cardName, setName)
    
    if (!priceResult.success || !priceResult.data) {
      // Fall back to simulated data for demo purposes
      const simulatedResult = await simulatePriceLookup(cardName)
      return NextResponse.json({
        success: true,
        data: simulatedResult.data,
        simulated: true,
        message: 'Using simulated price data for demo'
      })
    }

    return NextResponse.json({
      success: true,
      data: priceResult.data,
      simulated: false,
      message: 'Price data loaded successfully'
    })

  } catch (error) {
    console.error('Price lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup price information' },
      { status: 500 }
    )
  }
}