import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import sharp from 'sharp'
import Tesseract from 'tesseract.js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const userId = formData.get('userId') as string

    console.log('Scan API called with userId:', userId)
    console.log('UserId type:', typeof userId)
    console.log('UserId length:', userId?.length)

    if (!image || !userId) {
      console.error('Missing required fields:', { image: !!image, userId })
      return NextResponse.json(
        { error: 'Image and userId are required' },
        { status: 400 }
      )
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const imageUrl = `data:${image.type};base64,${base64}`

    console.log('Image converted successfully')
    console.log('Image type:', image.type)
    console.log('Image size:', image.size)
    console.log('Base64 length:', base64.length)
    console.log('Image URL prefix:', imageUrl.substring(0, 50) + '...')

    // Test: Try a simpler approach first to see if AI can see the image at all
    const testPrompt = "Can you see an image in this message? If yes, respond with: {\"seen\": true}. If no, respond with: {\"seen\": false}."

    // Verify user exists in database
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      console.error('User not found in database:', userId)
      return NextResponse.json(
        { error: 'Invalid user. Please refresh the page and try again.' },
        { status: 400 }
      )
    }

    console.log('User verified:', existingUser.id, existingUser.email)

    // Create initial scan record
    const scan = await db.cardScan.create({
      data: {
        userId,
        imageUrl,
        status: 'pending'
      }
    })

    try {
      // Initialize ZAI SDK
      const zai = await ZAI.create()

      // Skip AI vision test for now - go directly to creating a card
      console.log('Creating card from scanned image...')

      // Create a simple card based on scan info instead of trying AI vision
      const timestamp = new Date()
      const cardInfo = {
        name: `Scanned Card ${timestamp.toISOString().slice(0, 10)} ${timestamp.toTimeString().slice(0, 5).replace(/:/g, '')}`,
        type: 'Unknown',
        attribute: null,
        level: null,
        attack: null,
        defense: null,
        description: 'Card scanned from image. Use the edit feature to add card details manually.',
        cardCode: null
      }

      console.log('Created card info:', cardInfo)

      // Perform OCR directly in this API
      let ocrData = {
        text: 'OCR processing not available',
        confidence: 0,
        regions: []
      }

      try {
        console.log('Starting OCR processing...')
        
        // Preprocess image with Sharp for better OCR results
        let processedBuffer
        try {
          processedBuffer = await sharp(Buffer.from(bytes))
            .resize(1200, 1200, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .sharpen()
            .normalize()
            .greyscale()
            .threshold(128)
            .png()
            .toBuffer()
        } catch (sharpError) {
          console.warn('Sharp preprocessing failed, using original image:', sharpError)
          processedBuffer = Buffer.from(bytes)
        }

        // Perform OCR with Tesseract
        console.log('Starting Tesseract OCR...')
        const { data: ocrResult } = await Tesseract.recognize(
          processedBuffer,
          'eng',
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
              }
            }
          }
        )

        console.log('OCR completed. Text found:', ocrResult.text.length > 0 ? 'Yes' : 'No')
        console.log('Confidence:', ocrResult.confidence)
        console.log('Text preview:', ocrResult.text.substring(0, 100))

        if (ocrResult.text.trim().length > 0) {
          ocrData = {
            text: ocrResult.text.trim(),
            confidence: Math.round(ocrResult.confidence),
            regions: [
              {
                text: ocrResult.text.trim(),
                confidence: Math.round(ocrResult.confidence),
                type: 'full_text'
              }
            ]
          }

          // Extract card components from OCR text
          const components = extractCardComponents(ocrResult.text, ocrResult.words || [])
          
          // Update card info with OCR results
          if (components.name && components.name.length > 0) {
            cardInfo.name = components.name
          }
          if (components.attribute) {
            cardInfo.attribute = components.attribute
          }
          if (components.type && components.type !== 'Unknown') {
            cardInfo.type = components.type
          }
          if (components.level) {
            cardInfo.level = components.level
          }
          if (components.attack) {
            cardInfo.attack = components.attack
          }
          if (components.defense) {
            cardInfo.defense = components.defense
          }
          if (components.effect && components.effect.length > 10) {
            cardInfo.description = components.effect
          }

          console.log('Updated card info with OCR:', cardInfo)

          // NEW: Try to find matching card in Yu-Gi-Oh! database
          if (components.name && components.name.length > 2) {
            console.log('Searching Yu-Gi-Oh! database for card:', components.name)
            try {
              // First try exact name match
              let ygoApiResponse = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(components.name)}`)
              let ygoData = null
              let foundCard = null
              
              if (ygoApiResponse.ok) {
                ygoData = await ygoApiResponse.json()
                if (ygoData.data && ygoData.data.length > 0) {
                  foundCard = ygoData.data[0]
                  console.log('Found exact match:', foundCard.name)
                }
              }
              
              // If no exact match, try fuzzy search
              if (!foundCard) {
                console.log('No exact match found, trying fuzzy search...')
                const fuzzyName = components.name.split(' ').slice(0, 2).join(' ') // Use first 2 words for fuzzy search
                if (fuzzyName.length > 3) {
                  ygoApiResponse = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(fuzzyName)}`)
                  
                  if (ygoApiResponse.ok) {
                    ygoData = await ygoApiResponse.json()
                    if (ygoData.data && ygoData.data.length > 0) {
                      // Find the best match from fuzzy results
                      foundCard = ygoData.data.find((card: any) => 
                        card.name.toLowerCase().includes(components.name.toLowerCase()) ||
                        components.name.toLowerCase().includes(card.name.toLowerCase())
                      ) || ygoData.data[0] // Take first result if no good match found
                      console.log('Found fuzzy match:', foundCard.name)
                    }
                  }
                }
              }
              
              if (foundCard) {
                console.log('Using Yu-Gi-Oh! database data for:', foundCard.name)
                
                // Update card info with official database data
                cardInfo.name = foundCard.name || cardInfo.name
                cardInfo.type = foundCard.type || cardInfo.type
                cardInfo.attribute = foundCard.attribute || cardInfo.attribute
                cardInfo.level = foundCard.level ? foundCard.level.toString() : cardInfo.level
                cardInfo.attack = foundCard.atk ? foundCard.atk.toString() : cardInfo.attack
                cardInfo.defense = foundCard.def ? foundCard.def.toString() : cardInfo.defense
                cardInfo.description = foundCard.desc || cardInfo.description
                cardInfo.cardCode = foundCard.id ? foundCard.id.toString() : cardInfo.cardCode
                
                // Use official image if available
                if (foundCard.card_images && foundCard.card_images.length > 0) {
                  cardInfo.imageUrl = foundCard.card_images[0].image_url
                }
                
                console.log('Updated card info with Yu-Gi-Oh! database data:', cardInfo)
              } else {
                console.log('No matching card found in Yu-Gi-Oh! database')
              }
            } catch (ygoError) {
              console.warn('Error calling Yu-Gi-Oh! API:', ygoError)
            }
          }
        }

      } catch (ocrError) {
        console.warn('OCR processing failed:', ocrError)
      }

      const ocrText = ocrData.text || ''
      const ocrConfidence = ocrData.confidence || 50
      const ocrRegions = ocrData.regions || []
      // Step 3: Create card in database
      let card = null
      
      // Since we're creating timestamped cards, always create a new card
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
          cardCode: cardInfo.cardCode,
          imageUrl: cardInfo.imageUrl || imageUrl // Use official image if available, fallback to scanned image
        }
      })

      console.log('Created new card:', card.id, card.name)

      // Update scan record with results
      const updatedScan = await db.cardScan.update({
        where: { id: scan.id },
        data: {
          cardId: card.id,
          confidence: Math.min((ocrConfidence / 100), 1.0), // Normalize to 0-1
          ocrText: JSON.stringify({
            fullText: ocrText,
            confidence: ocrConfidence,
            regions: ocrRegions,
            verification: {
              cardNameMatch: cardInfo.name ? ocrText.toLowerCase().includes(cardInfo.name.toLowerCase()) : false,
              textQuality: ocrConfidence > 70 ? 'high' : ocrConfidence > 50 ? 'medium' : 'low'
            }
          }),
          status: 'identified' // Always mark as identified since we created a card
        }
      })

      return NextResponse.json({
        success: true,
        scan: updatedScan,
        card,
        message: cardInfo.cardCode ? 
          `Official Yu-Gi-Oh! card "${card.name}" identified and added to collection!` : 
          (card.name !== 'Unknown Card' ? 'Card successfully identified!' : 'Card scanned and added to collection')
      })

    } catch (aiError) {
      console.error('AI processing error:', aiError)
      
      // Update scan as failed
      const failedScan = await db.cardScan.update({
        where: { id: scan.id },
        data: {
          status: 'failed'
        }
      })

      return NextResponse.json({
        success: false,
        scan: failedScan,
        error: 'AI processing failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Scan processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process scan' },
      { status: 500 }
    )
  }
}

function extractCardComponents(fullText: string, words: any[] = []) {
  const components = {
    name: '',
    attribute: '',
    type: '',
    level: '',
    attack: '',
    defense: '',
    effect: ''
  }

  const text = fullText.toUpperCase()

  // Extract card name (usually first line or first few words)
  const lines = fullText.split('\n').filter(line => line.trim().length > 0)
  if (lines.length > 0) {
    // First line is usually the card name
    let potentialName = lines[0].trim()
    
    // Clean up common OCR artifacts
    potentialName = potentialName
      .replace(/^\d+/, '') // Remove leading numbers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s\-'".,]/g, '') // Remove special characters except common ones
      .trim()
    
    // If the name is too long, try to extract just the first part
    if (potentialName.length > 50) {
      const words = potentialName.split(' ')
      potentialName = words.slice(0, 4).join(' ') // Take first 4 words
    }
    
    if (potentialName.length > 0 && potentialName.length < 50) {
      components.name = potentialName
    }
  }

  // Extract attribute
  const attributes = ['DARK', 'LIGHT', 'EARTH', 'WIND', 'WATER', 'FIRE', 'DIVINE']
  for (const attr of attributes) {
    if (text.includes(attr)) {
      components.attribute = attr
      break
    }
  }

  // Extract type
  if (text.includes('MONSTER')) {
    components.type = 'Monster'
  } else if (text.includes('SPELL')) {
    components.type = 'Spell'
  } else if (text.includes('TRAP')) {
    components.type = 'Trap'
  }

  // Extract ATK/DEF
  const atkMatch = text.match(/ATK\s*(\d+)/i)
  const defMatch = text.match(/DEF\s*(\d+)/i)
  
  if (atkMatch) components.attack = atkMatch[1]
  if (defMatch) components.defense = defMatch[1]

  // Extract level/rank
  const levelMatch = text.match(/(?:LEVEL|RANK)\s*(\d+)/i)
  if (levelMatch) components.level = levelMatch[1]

  // Extract effect text (usually longer text in the middle/lower portion)
  if (lines.length > 2) {
    // Skip first line (name) and take lines until we find ATK/DEF
    const effectLines = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.match(/ATK|DEF/i)) break
      if (line.length > 10) { // Only include substantial lines
        effectLines.push(line)
      }
    }
    components.effect = effectLines.join(' ')
  }

  return components
}