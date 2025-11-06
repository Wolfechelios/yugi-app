import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { image, userId } = await request.json()

    if (!image || !userId) {
      return NextResponse.json(
        { error: 'Image and userId are required' },
        { status: 400 }
      )
    }

    try {
      // Initialize ZAI SDK
      const zai = await ZAI.create()

      // Card identification prompt
      const cardPrompt = `
        Identify this Yu-Gi-Oh! card from the provided image.
        
        Extract:
        1. Card name (exact text from the card)
        2. Card type (Monster, Spell, Trap)
        3. Attribute (if monster: DARK, LIGHT, EARTH, WIND, WATER, FIRE, DIVINE)
        4. Level/Rank (if applicable)
        5. Attack/Defense points (if monster)
        6. Card description/effect text
        7. Rarity (if visible: Common, Rare, Super Rare, Ultra Rare, Secret Rare)

        Format as JSON: {
          "name": "Card Name",
          "type": "Monster",
          "attribute": "DARK",
          "level": "8",
          "attack": "3000",
          "defense": "2500",
          "description": "Card effect text",
          "rarity": "Ultra Rare",
          "confidence": 95
        }
      `

      const cardResult = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert Yu-Gi-Oh! card identifier. Extract information accurately from card images.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: cardPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })

      const cardInfo = JSON.parse(cardResult.choices[0].message.content || '{}')

      // OCR verification
      const ocrPrompt = `
        Extract and verify all text from this Yu-Gi-Oh! card image.
        Provide confidence assessment for text quality.
        
        Return JSON: {
          "fullText": "all extracted text",
          "confidence": 85,
          "regions": [
            {"text": "card name", "confidence": 90, "type": "name"},
            {"text": "effect text", "confidence": 80, "type": "effect"}
          ],
          "verification": {
            "cardNameMatch": true,
            "textQuality": "high"
          }
        }
      `

      const ocrResult = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an OCR specialist providing text extraction and quality assessment.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: ocrPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.1
      })

      let ocrData
      try {
        ocrData = JSON.parse(ocrResult.choices[0].message.content || '{}')
      } catch (parseError) {
        ocrData = {
          fullText: cardInfo.name || '',
          confidence: cardInfo.confidence || 70,
          regions: [],
          verification: {
            cardNameMatch: !!cardInfo.name,
            textQuality: 'medium'
          }
        }
      }

      // Find or create card in database
      let card = await db.card.findFirst({
        where: {
          OR: [
            { name: cardInfo.name },
            { name: { contains: cardInfo.name, mode: 'insensitive' } }
          ]
        }
      })

      if (!card && cardInfo.name) {
        card = await db.card.create({
          data: {
            name: cardInfo.name,
            description: cardInfo.description,
            type: cardInfo.type || 'Unknown',
            attribute: cardInfo.attribute,
            level: cardInfo.level ? parseInt(cardInfo.level) : null,
            attack: cardInfo.attack ? parseInt(cardInfo.attack) : null,
            defense: cardInfo.defense ? parseInt(cardInfo.defense) : null,
            rarity: cardInfo.rarity || 'Common',
            cardCode: `BATCH-${Date.now()}`,
            imageUrl: image
          }
        })
      }

      // Create scan record
      const scan = await db.cardScan.create({
        data: {
          userId,
          imageUrl: image,
          cardId: card?.id,
          confidence: Math.min((cardInfo.confidence || 70) / 100, 1.0),
          ocrText: JSON.stringify(ocrData),
          status: card ? 'identified' : 'failed'
        }
      })

      return NextResponse.json({
        success: !!card,
        scan,
        card,
        message: card ? 'Card identified successfully' : 'Card could not be identified',
        confidence: cardInfo.confidence || 70
      })

    } catch (aiError) {
      console.error('AI processing error:', aiError)
      
      return NextResponse.json({
        success: false,
        error: 'AI processing failed',
        message: 'Failed to process card image'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Single card scan error:', error)
    return NextResponse.json(
      { error: 'Failed to scan card' },
      { status: 500 }
    )
  }
}