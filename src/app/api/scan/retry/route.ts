import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'
import sharp from 'sharp'
import Tesseract from 'tesseract.js'

export async function POST(request: NextRequest) {
  try {
    const { scanId, userId } = await request.json()

    if (!scanId || !userId) {
      return NextResponse.json(
        { error: 'Scan ID and user ID are required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Invalid user' },
        { status: 400 }
      )
    }

    // Get the original scan
    const originalScan = await db.cardScan.findUnique({
      where: { id: scanId },
      include: { card: true }
    })

    if (!originalScan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      )
    }

    if (originalScan.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to retry this scan' },
        { status: 403 }
      )
    }

    // Only allow retry for failed or pending scans
    if (originalScan.status !== 'failed' && originalScan.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only retry failed or pending scans' },
        { status: 400 }
      )
    }

    console.log('Retrying scan:', scanId, 'for user:', userId)

    // Update scan status to processing
    await db.cardScan.update({
      where: { id: scanId },
      data: { status: 'pending' }
    })

    try {
      // Extract image data from the stored imageUrl
      const imageUrl = originalScan.imageUrl
      let imageBuffer: Buffer

      if (imageUrl.startsWith('data:')) {
        // Base64 encoded image
        const base64Data = imageUrl.split(',')[1]
        imageBuffer = Buffer.from(base64Data, 'base64')
      } else {
        // URL-based image (fetch it)
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch original image')
        }
        const imageArrayBuffer = await imageResponse.arrayBuffer()
        imageBuffer = Buffer.from(imageArrayBuffer)
      }

      console.log('Image extracted for retry, size:', imageBuffer.length)

      // Initialize card info
      const cardInfo = {
        name: `Retry Scan ${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5).replace(/:/g, '')}`,
        type: 'Unknown',
        attribute: null,
        level: null,
        attack: null,
        defense: null,
        description: 'Card from retry scan. Use the edit feature to add card details manually.',
        cardCode: null
      }

      // Perform OCR processing
      let ocrData = {
        text: 'OCR processing not available',
        confidence: 0,
        regions: []
      }

      try {
        console.log('Starting OCR processing for retry...')
        
        // Preprocess image with Sharp for better OCR results
        let processedBuffer
        try {
          processedBuffer = await sharp(imageBuffer)
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
          processedBuffer = imageBuffer
        }

        // Perform OCR with Tesseract
        console.log('Starting Tesseract OCR for retry...')
        const { data: ocrResult } = await Tesseract.recognize(
          processedBuffer,
          'eng',
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`Retry OCR Progress: ${Math.round(m.progress * 100)}%`)
              }
            }
          }
        )

        console.log('Retry OCR completed. Text found:', ocrResult.text.length > 0 ? 'Yes' : 'No')
        console.log('Retry OCR Confidence:', ocrResult.confidence)

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

          console.log('Updated card info with retry OCR:', cardInfo)

          // Try to find matching card in Yu-Gi-Oh! database
          if (components.name && components.name.length > 2) {
            console.log('Searching Yu-Gi-Oh! database for retry card:', components.name)
            try {
              // First try exact name match
              let ygoData: any = null
              let foundCard: any = null
              
              try {
                const exactResponse = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(components.name)}`)
                if (exactResponse.ok) {
                  ygoData = await exactResponse.json()
                  if (ygoData.data && ygoData.data.length > 0) {
                    foundCard = ygoData.data[0]
                    console.log('Found exact match in retry:', foundCard.name)
                  }
                }
              } catch (apiError) {
                console.warn('Yu-Gi-Oh! API call failed in retry (exact):', apiError)
              }
              
              // If no exact match, try fuzzy search
              if (!foundCard) {
                console.log('No exact match found in retry, trying fuzzy search...')
                const fuzzyName = components.name.split(' ').slice(0, 2).join(' ')
                if (fuzzyName.length > 3) {
                  try {
                    const fuzzyResponse = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(fuzzyName)}`)
                    
                    if (fuzzyResponse.ok) {
                      ygoData = await fuzzyResponse.json()
                      if (ygoData.data && ygoData.data.length > 0) {
                        foundCard = ygoData.data.find((card: any) => 
                          card.name.toLowerCase().includes(components.name.toLowerCase()) ||
                          components.name.toLowerCase().includes(card.name.toLowerCase())
                        ) || ygoData.data[0]
                        console.log('Found fuzzy match in retry:', foundCard.name)
                      }
                    }
                  } catch (apiError) {
                    console.warn('Yu-Gi-Oh! API call failed in retry (fuzzy):', apiError)
                  }
                }
              }
              
              if (foundCard) {
                console.log('Using Yu-Gi-Oh! database data for retry:', foundCard.name)
                
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
                
                console.log('Updated card info with Yu-Gi-Oh! database data in retry:', cardInfo)
              }
            } catch (ygoError) {
              console.warn('Error calling Yu-Gi-Oh! API in retry:', ygoError)
            }
          }
        }

      } catch (ocrError) {
        console.warn('OCR processing failed in retry:', ocrError)
      }

      // Create or update card
      let card = null
      
      if (originalScan.cardId) {
        // Update existing card
        card = await db.card.update({
          where: { id: originalScan.cardId },
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
            imageUrl: cardInfo.imageUrl || imageUrl
          }
        })
        console.log('Updated existing card in retry:', card.id, card.name)
      } else {
        // Create new card
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
            imageUrl: cardInfo.imageUrl || imageUrl
          }
        })
        console.log('Created new card in retry:', card.id, card.name)
      }

      // Update scan record with results
      const updatedScan = await db.cardScan.update({
        where: { id: scanId },
        data: {
          cardId: card.id,
          confidence: Math.min((ocrData.confidence / 100), 1.0),
          ocrText: JSON.stringify({
            fullText: ocrData.text,
            confidence: ocrData.confidence,
            regions: ocrData.regions,
            verification: {
              cardNameMatch: cardInfo.name ? ocrData.text.toLowerCase().includes(cardInfo.name.toLowerCase()) : false,
              textQuality: ocrData.confidence > 70 ? 'high' : ocrData.confidence > 50 ? 'medium' : 'low'
            },
            retryAttempt: true,
            retryTimestamp: new Date().toISOString()
          }),
          status: 'identified'
        }
      })

      return NextResponse.json({
        success: true,
        updatedScan,
        card,
        message: cardInfo.cardCode ? 
          `Retry successful! Official Yu-Gi-Oh! card "${card.name}" identified!` : 
          'Retry successful! Card has been reprocessed.'
      })

    } catch (processingError) {
      console.error('Retry processing error:', processingError)
      
      // Update scan as failed
      const failedScan = await db.cardScan.update({
        where: { id: scanId },
        data: {
          status: 'failed',
          ocrText: JSON.stringify({
            error: processingError instanceof Error ? processingError.message : 'Unknown error',
            retryAttempt: true,
            retryTimestamp: new Date().toISOString()
          })
        }
      })

      return NextResponse.json({
        success: false,
        updatedScan: failedScan,
        error: 'Retry processing failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Retry scan error:', error)
    return NextResponse.json(
      { error: 'Failed to retry scan' },
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