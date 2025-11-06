import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { originalScanId, enhancementMode, manualHints, userId } = await request.json()

    if (!originalScanId || !userId) {
      return NextResponse.json(
        { error: 'Original scan ID and userId are required' },
        { status: 400 }
      )
    }

    // Get the original scan
    const originalScan = await db.cardScan.findUnique({
      where: { id: originalScanId },
      include: { card: true }
    })

    if (!originalScan) {
      return NextResponse.json(
        { error: 'Original scan not found' },
        { status: 404 }
      )
    }

    try {
      // Initialize ZAI SDK
      const zai = await ZAI.create()

      // Create enhanced prompt based on mode and hints
      let enhancedPrompt = ''

      if (enhancementMode === 'auto') {
        enhancedPrompt = `
          This is a SECOND ATTEMPT to identify a Yu-Gi-Oh! card that failed in the first scan.
          Use advanced image analysis techniques:
          1. Enhance image contrast and brightness mentally
          2. Look for card borders, symbols, and distinctive features
          3. Try multiple OCR angles and approaches
          4. Cross-reference with known card databases
          5. Consider partial text matches and similar card names

          Original OCR data: ${originalScan.ocrText || 'None'}
          Original attempt: ${originalScan.card?.name || 'Failed to identify'}

          Provide your best identification with:
          - name (exact card name)
          - type (Monster/Spell/Trap)
          - attribute (if applicable)
          - level/rank, attack/defense (if applicable)
          - description/effect text
          - confidence level (0-100)
          - reasoning for your identification

          Format as JSON with: name, type, attribute, level, attack, defense, description, confidence, reasoning
        `
      } else if (enhancementMode === 'manual') {
        enhancedPrompt = `
          Identify this Yu-Gi-Oh! card using the provided human hints:
          
          Card Name Hint: "${manualHints.cardName || 'None'}"
          Card Type Hint: "${manualHints.cardType || 'None'}"
          Attribute Hint: "${manualHints.attribute || 'None'}"
          Known Text: "${manualHints.knownText || 'None'}"
          Description: "${manualHints.description || 'None'}"

          Original OCR data: ${originalScan.ocrText || 'None'}

          Use these hints to make the best possible identification. Even partial information can help identify the card.
          Cross-reference the hints with what you can see in the image.

          Provide your identification with:
          - name (exact card name)
          - type (Monster/Spell/Trap)
          - attribute (if applicable)
          - level/rank, attack/defense (if applicable)
          - description/effect text
          - confidence level (0-100)
          - how the hints helped in identification

          Format as JSON with: name, type, attribute, level, attack, defense, description, confidence, reasoning
        `
      } else { // hybrid mode
        enhancedPrompt = `
          ENHANCED IDENTIFICATION: Combine AI analysis with human hints for this Yu-Gi-Oh! card.
          
          Human Hints:
          - Card Name: "${manualHints.cardName || 'None'}"
          - Type: "${manualHints.cardType || 'None'}"
          - Attribute: "${manualHints.attribute || 'None'}"
          - Known Text: "${manualHints.knownText || 'None'}"
          - Description: "${manualHints.description || 'None'}"

          Previous Attempt Data:
          - OCR Result: ${originalScan.ocrText || 'None'}
          - Previous ID: ${originalScan.card?.name || 'Failed'}

          TASK: Use both advanced image analysis AND the human hints to identify this card.
          1. Apply image enhancement techniques mentally
          2. Look for text, symbols, and card features
          3. Cross-reference hints with visual evidence
          4. Consider similar card names if exact match not found
          5. Use hints to clarify ambiguous text

          Provide your best identification with:
          - name (exact card name)
          - type (Monster/Spell/Trap)
          - attribute (if applicable)
          - level/rank, attack/defense (if applicable)
          - description/effect text
          - confidence level (0-100)
          - detailed reasoning combining hints and visual analysis

          Format as JSON with: name, type, attribute, level, attack, defense, description, confidence, reasoning
        `
      }

      const enhancedResult = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert Yu-Gi-Oh! card identifier with advanced image analysis capabilities. You excel at identifying cards from poor quality images using enhancement techniques and human-provided hints.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: enhancedPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: originalScan.imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      })

      const cardInfo = JSON.parse(enhancedResult.choices[0].message.content || '{}')

      // Step 2: Enhanced OCR with context
      const ocrPrompt = `
        Perform enhanced OCR analysis on this Yu-Gi-Oh! card using the context:
        Identified Card: ${cardInfo.name || 'Unknown'}
        Card Type: ${cardInfo.type || 'Unknown'}
        Human Hints: ${JSON.stringify(manualHints)}

        Focus on:
        1. Confirming the card name matches what you see
        2. Extracting clear effect/description text
        3. Reading ATK/DEF values accurately
        4. Identifying level/rank stars
        5. Noting any symbols or attributes

        Provide detailed OCR analysis with:
        - Full extracted text
        - Confidence score (0-100)
        - Text regions with individual confidence
        - Verification of card name match
        - Overall text quality assessment

        Format as JSON: {
          "fullText": "all extracted text",
          "confidence": 85,
          "regions": [
            {"text": "region text", "confidence": 90, "type": "name/effect/stats"}
          ],
          "verification": {
            "cardNameMatch": true,
            "textQuality": "high/medium/low"
          }
        }
      `

      const ocrResult = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an advanced OCR specialist with context-aware text extraction capabilities.'
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
                  url: originalScan.imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })

      let ocrData
      try {
        ocrData = JSON.parse(ocrResult.choices[0].message.content || '{}')
      } catch (parseError) {
        ocrData = {
          text: ocrResult.choices[0].message.content || '',
          confidence: 50,
          regions: []
        }
      }

      // Step 3: Find or create card in database
      let card = await db.card.findFirst({
        where: {
          OR: [
            { name: cardInfo.name },
            { name: { contains: cardInfo.name, mode: 'insensitive' } }
          ]
        }
      })

      if (!card && cardInfo.name) {
        // Create new card entry
        card = await db.card.create({
          data: {
            name: cardInfo.name,
            description: cardInfo.description,
            type: cardInfo.type || 'Unknown',
            attribute: cardInfo.attribute,
            level: cardInfo.level ? parseInt(cardInfo.level) : null,
            attack: cardInfo.attack ? parseInt(cardInfo.attack) : null,
            defense: cardInfo.defense ? parseInt(cardInfo.defense) : null,
            rarity: 'Common',
            cardCode: `ENH-${Date.now()}`,
            imageUrl: originalScan.imageUrl
          }
        })
      }

      // Create new enhanced scan record
      const enhancedScan = await db.cardScan.create({
        data: {
          userId,
          imageUrl: originalScan.imageUrl,
          cardId: card?.id,
          confidence: Math.min((cardInfo.confidence || 70) / 100, 1.0),
          ocrText: JSON.stringify({
            ...ocrData,
            enhancementMode,
            manualHints,
            originalScanId,
            reasoning: cardInfo.reasoning
          }),
          status: card ? 'identified' : 'failed'
        }
      })

      return NextResponse.json({
        success: !!card,
        scan: enhancedScan,
        card,
        message: card 
          ? `Card successfully identified with enhanced scanning! (Confidence: ${cardInfo.confidence}%)`
          : 'Enhanced scan could not identify the card',
        enhancementMode,
        reasoning: cardInfo.reasoning
      })

    } catch (aiError) {
      console.error('Enhanced AI processing error:', aiError)
      
      return NextResponse.json({
        success: false,
        error: 'Enhanced AI processing failed',
        message: 'The enhanced scanning encountered an error. Please try again with different hints.'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Enhanced scan processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process enhanced scan' },
      { status: 500 }
    )
  }
}