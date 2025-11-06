import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import Tesseract from 'tesseract.js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    console.log('Processing OCR for image:', image.name, image.type, image.size)

    // Convert image to buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Preprocess image with Sharp for better OCR results
    let processedBuffer
    try {
      processedBuffer = await sharp(buffer)
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
      processedBuffer = buffer
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

    // Extract meaningful text regions
    const words = ocrResult.words
      .filter(word => word.confidence > 30) // Filter low-confidence words
      .map(word => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox,
        type: classifyWordType(word.text)
      }))

    // Try to identify card components
    const cardComponents = extractCardComponents(words, ocrResult.text)

    return NextResponse.json({
      success: true,
      text: ocrResult.text.trim(),
      confidence: Math.round(ocrResult.confidence),
      words: words,
      components: cardComponents,
      regions: [
        {
          text: ocrResult.text.trim(),
          confidence: Math.round(ocrResult.confidence),
          type: 'full_text'
        }
      ]
    })

  } catch (error) {
    console.error('OCR processing error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'OCR processing failed',
        text: '',
        confidence: 0,
        words: [],
        components: null,
        regions: []
      },
      { status: 500 }
    )
  }
}

function classifyWordType(word: string): string {
  const upperWord = word.toUpperCase()
  
  // Check for attributes
  if (['DARK', 'LIGHT', 'EARTH', 'WIND', 'WATER', 'FIRE', 'DIVINE'].includes(upperWord)) {
    return 'attribute'
  }
  
  // Check for card types
  if (['MONSTER', 'SPELL', 'TRAP'].includes(upperWord)) {
    return 'type'
  }
  
  // Check for rarity indicators
  if (['COMMON', 'RARE', 'SUPER', 'ULTRA', 'SECRET', 'PARALLEL', 'STARFOIL'].includes(upperWord)) {
    return 'rarity'
  }
  
  // Check for level/rank
  if (upperWord.startsWith('LEVEL') || upperWord.startsWith('RANK')) {
    return 'level'
  }
  
  // Check for ATK/DEF
  if (upperWord.includes('ATK') || upperWord.includes('DEF')) {
    return 'stats'
  }
  
  // Numbers might be stats
  if (/^\d+$/.test(word)) {
    return 'number'
  }
  
  return 'text'
}

function extractCardComponents(words: any[], fullText: string) {
  const components = {
    name: '',
    attribute: '',
    type: '',
    level: '',
    attack: '',
    defense: '',
    effect: ''
  }

  // Try to extract card name (usually first few words, larger font)
  const titleWords = words.filter(w => 
    w.type === 'text' && 
    w.confidence > 60 && 
    w.bbox.y0 < 200 // Assuming name is in upper portion
  )
  
  if (titleWords.length > 0) {
    components.name = titleWords.slice(0, 3).map(w => w.text).join(' ')
  }

  // Extract attribute
  const attributeWords = words.filter(w => w.type === 'attribute')
  if (attributeWords.length > 0) {
    components.attribute = attributeWords[0].text
  }

  // Extract type
  const typeWords = words.filter(w => w.type === 'type')
  if (typeWords.length > 0) {
    components.type = typeWords[0].text
  }

  // Extract ATK/DEF
  const statsWords = words.filter(w => w.type === 'stats' || w.type === 'number')
  const atkMatch = fullText.match(/ATK\s*(\d+)/i)
  const defMatch = fullText.match(/DEF\s*(\d+)/i)
  
  if (atkMatch) components.attack = atkMatch[1]
  if (defMatch) components.defense = defMatch[1]

  // Extract level
  const levelMatch = fullText.match(/(?:LEVEL|RANK)\s*(\d+)/i)
  if (levelMatch) components.level = levelMatch[1]

  // Extract effect text (usually longer text in middle/lower portion)
  const effectWords = words.filter(w => 
    w.type === 'text' && 
    w.confidence > 50 && 
    w.bbox.y0 > 200 // Assuming effect is in lower portion
  )
  
  if (effectWords.length > 0) {
    components.effect = effectWords.map(w => w.text).join(' ')
  }

  return components
}