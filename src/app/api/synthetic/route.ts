import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { count = 10, backgrounds = ['table', 'mat', 'floor'], variations = true } = await request.json()

    // Get existing cards from database
    const cards = await db.card.findMany({
      take: Math.min(count, 50), // Limit to prevent excessive generation
      orderBy: { createdAt: 'desc' }
    })

    if (cards.length === 0) {
      return NextResponse.json(
        { error: 'No cards found in database. Add some cards first.' },
        { status: 404 }
      )
    }

    const syntheticImages = []

    for (const card of cards) {
      try {
        const zai = await ZAI.create()

        // Generate synthetic image with card in random position
        const prompt = `
          Create a realistic photograph of a Yu-Gi-Oh! trading card "${card.name}" placed on a ${backgrounds[Math.floor(Math.random() * backgrounds.length)]} surface.
          
          Requirements:
          - Card should be at a slight angle (5-15 degrees rotation)
          - Natural lighting conditions
          - Slight shadow for depth
          - Background should have some texture but not distract from the card
          - Card should appear as if photographed by a smartphone
          - Include minor imperfections like slight glare or reflection
          - Card should occupy approximately 60-80% of the frame
          
          Style: Photorealistic, natural lighting, smartphone photography
        `

        const response = await zai.images.generations.create({
          prompt,
          size: '1024x1024'
        })

        const syntheticImage = response.data[0].base64

        syntheticImages.push({
          cardId: card.id,
          cardName: card.name,
          syntheticImage,
          metadata: {
            generatedAt: new Date().toISOString(),
            background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
            rotation: Math.floor(Math.random() * 10) + 5, // 5-15 degrees
            purpose: 'synthetic_training_data'
          }
        })

      } catch (error) {
        console.error(`Failed to generate synthetic image for card ${card.name}:`, error)
        continue
      }
    }

    return NextResponse.json({
      success: true,
      generated: syntheticImages.length,
      images: syntheticImages,
      message: `Generated ${syntheticImages.length} synthetic training images`
    })

  } catch (error) {
    console.error('Synthetic data generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate synthetic data' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return information about synthetic data capabilities
    return NextResponse.json({
      capabilities: {
        syntheticGeneration: true,
        supportedVariations: [
          'backgrounds',
          'lighting_conditions',
          'angles_and_perspectives',
          'card_conditions',
          'protective_sleeves'
        ],
        researchInspiration: 'gabraken/mtg-detection dataset methodology',
        maxBatchSize: 50,
        outputFormat: 'base64_images_with_metadata'
      },
      usage: {
        endpoint: '/api/synthetic',
        method: 'POST',
        parameters: {
          count: 'number of images to generate (max 50)',
          backgrounds: 'array of background types',
          variations: 'boolean to enable variations'
        }
      }
    })
  } catch (error) {
    console.error('Synthetic info error:', error)
    return NextResponse.json(
      { error: 'Failed to get synthetic data info' },
      { status: 500 }
    )
  }
}