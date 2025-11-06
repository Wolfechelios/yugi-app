'use client'

import { useState, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Camera, 
  Upload, 
  Grid3X3, 
  Crop, 
  Scissors,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  Layers
} from 'lucide-react'

interface DetectedCard {
  id: string
  x: number
  y: number
  width: number
  height: number
  image: string
  confidence: number
  scanned?: boolean
  result?: any
}

interface BatchScanResult {
  totalCards: number
  successfulScans: number
  failedScans: number
  cards: DetectedCard[]
}

interface BatchCardScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBatchComplete: (results: BatchScanResult) => void
  userId?: string
}

export default function BatchCardScanner({ 
  open, 
  onOpenChange, 
  onBatchComplete,
  userId
}: BatchCardScannerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [detectedCards, setDetectedCards] = useState<DetectedCard[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [currentScanIndex, setCurrentScanIndex] = useState(0)
  const [scanMode, setScanMode] = useState<'auto' | 'manual'>('auto')
  const [selectedCard, setSelectedCard] = useState<DetectedCard | null>(null)
  const [cropMode, setCropMode] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setDetectedCards([])
        setSelectedCard(null)
      }
      reader.readAsDataURL(file)
    } else {
      toast.error('Please select a valid image file')
    }
  }, [])

  const detectCards = async () => {
    if (!selectedImage) return

    setIsDetecting(true)
    try {
      const response = await fetch('/api/scan/detect-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: selectedImage })
      })

      const result = await response.json()
      
      if (result.success && result.cards) {
        setDetectedCards(result.cards)
        toast.success(`Detected ${result.cards.length} cards!`)
      } else {
        toast.error('Failed to detect cards. Try manual mode.')
      }
    } catch (error) {
      console.error('Card detection error:', error)
      toast.error('Failed to detect cards')
    } finally {
      setIsDetecting(false)
    }
  }

  const startBatchScan = async () => {
    if (detectedCards.length === 0 || !userId) return

    setIsScanning(true)
    setScanProgress(0)
    setCurrentScanIndex(0)

    const results: DetectedCard[] = []

    for (let i = 0; i < detectedCards.length; i++) {
      setCurrentScanIndex(i)
      const card = detectedCards[i]
      
      try {
        const response = await fetch('/api/scan/single', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: card.image,
            userId: userId
          })
        })

        const result = await response.json()
        
        const updatedCard = {
          ...card,
          scanned: true,
          result: result
        }
        
        results.push(updatedCard)
        setDetectedCards(prev => 
          prev.map((c, index) => index === i ? updatedCard : c)
        )

        if (result.success) {
          toast.success(`Scanned card ${i + 1}: ${result.card?.name || 'Unknown'}`)
        } else {
          toast.error(`Failed to scan card ${i + 1}`)
        }

      } catch (error) {
        console.error(`Error scanning card ${i}:`, error)
        toast.error(`Error scanning card ${i + 1}`)
      }

      setScanProgress(((i + 1) / detectedCards.length) * 100)
      
      // Small delay between scans
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsScanning(false)
    
    const successful = results.filter(r => r.result?.success).length
    const batchResult: BatchScanResult = {
      totalCards: detectedCards.length,
      successfulScans: successful,
      failedScans: detectedCards.length - successful,
      cards: results
    }

    onBatchComplete(batchResult)
    toast.success(`Batch scan complete! ${successful}/${detectedCards.length} cards identified.`)
  }

  const resetScanner = () => {
    setSelectedImage(null)
    setDetectedCards([])
    setSelectedCard(null)
    setScanProgress(0)
    setCurrentScanIndex(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadCardImages = () => {
    detectedCards.forEach((card, index) => {
      const link = document.createElement('a')
      link.download = `card-${index + 1}.png`
      link.href = card.image
      link.click()
    })
    toast.success('Downloaded all card images')
  }

  const renderCanvas = () => {
    if (!selectedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Draw detected card boundaries
      if (showGrid && detectedCards.length > 0) {
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2
        detectedCards.forEach((card, index) => {
          ctx.strokeRect(card.x, card.y, card.width, card.height)
          
          // Draw card number
          ctx.fillStyle = '#00ff00'
          ctx.font = '16px Arial'
          ctx.fillText(`${index + 1}`, card.x + 5, card.y + 20)
          
          // Draw confidence
          ctx.fillStyle = '#ffff00'
          ctx.font = '12px Arial'
          ctx.fillText(`${Math.round(card.confidence * 100)}%`, card.x + 5, card.y + 35)
        })
      }

      // Draw 9-card grid overlay for manual mode
      if (showGrid && scanMode === 'manual') {
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        
        const cols = 3
        const rows = 3
        const cellWidth = canvas.width / cols
        const cellHeight = canvas.height / rows
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            ctx.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight)
          }
        }
        ctx.setLineDash([])
      }
    }
    img.src = selectedImage
  }

  const createManualGrid = () => {
    if (!selectedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const cols = 3
    const rows = 3
    const cellWidth = canvas.width / cols
    const cellHeight = canvas.height / rows
    
    const cards: DetectedCard[] = []
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellWidth
        const y = row * cellHeight
        
        // Create cropped image for this card
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = cellWidth
        tempCanvas.height = cellHeight
        const tempCtx = tempCanvas.getContext('2d')
        
        if (tempCtx) {
          const img = new Image()
          img.onload = () => {
            tempCtx.drawImage(img, x, y, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight)
            
            cards.push({
              id: `manual-${row}-${col}`,
              x,
              y,
              width: cellWidth,
              height: cellHeight,
              image: tempCanvas.toDataURL(),
              confidence: 0.8 // Manual grid gets default confidence
            })
            
            if (cards.length === 9) {
              setDetectedCards(cards)
              toast.success('Created 9-card grid manually')
            }
          }
          img.src = selectedImage
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Grid3X3 className="w-5 h-5" />
            <span>Batch Card Scanner</span>
            <Badge variant="secondary">9-Card Folder</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          {!selectedImage ? (
            <Card>
              <CardContent className="pt-6">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    
                    <div>
                      <p className="text-lg font-medium">Upload 9-Card Folder Image</p>
                      <p className="text-sm text-muted-foreground">
                        Take a photo of your 9-card folder page for automatic detection
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                      id="batch-file-upload"
                    />
                    
                    <Button asChild>
                      <label htmlFor="batch-file-upload" className="cursor-pointer">
                        <Camera className="w-4 h-4 mr-2" />
                        Select Folder Image
                      </label>
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      For best results: Use good lighting, avoid glare, ensure all 9 cards are visible
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Image and Detection */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Folder Image</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowGrid(!showGrid)}
                        >
                          <Grid3X3 className="w-4 h-4 mr-1" />
                          Grid
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetScanner}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-auto border rounded-lg"
                        style={{ maxHeight: '500px' }}
                      />
                      {renderCanvas()}
                    </div>
                  </CardContent>
                </Card>

                {/* Detection Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Detection Mode</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={scanMode} onValueChange={(value: any) => setScanMode(value)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="auto">Auto Detect</TabsTrigger>
                        <TabsTrigger value="manual">Manual Grid</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="auto" className="space-y-4">
                        <Alert>
                          <Camera className="w-4 h-4" />
                          <AlertDescription>
                            AI will automatically detect individual cards in the folder image.
                            Works best with clear, well-lit images.
                          </AlertDescription>
                        </Alert>
                        <Button 
                          onClick={detectCards}
                          disabled={isDetecting}
                          className="w-full"
                        >
                          {isDetecting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Detecting Cards...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Detect Cards
                            </>
                          )}
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="manual" className="space-y-4">
                        <Alert>
                          <Grid3X3 className="w-4 h-4" />
                          <AlertDescription>
                            Creates a 3x3 grid over the image. Works when cards are arranged 
                            in a standard 9-card folder layout.
                          </AlertDescription>
                        </Alert>
                        <Button 
                          onClick={createManualGrid}
                          className="w-full"
                        >
                          <Layers className="w-4 h-4 mr-2" />
                          Create 9-Card Grid
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Detected Cards */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Layers className="w-4 h-4" />
                        <span>Detected Cards ({detectedCards.length})</span>
                      </span>
                      {detectedCards.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadCardImages}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                          <Button
                            onClick={startBatchScan}
                            disabled={isScanning || detectedCards.length === 0}
                          >
                            {isScanning ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Scanning...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Batch Scan
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isScanning && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Scanning card {currentScanIndex + 1} of {detectedCards.length}</span>
                          <span>{Math.round(scanProgress)}%</span>
                        </div>
                        <Progress value={scanProgress} className="w-full" />
                      </div>
                    )}

                    {detectedCards.length === 0 ? (
                      <div className="text-center py-8">
                        <Grid3X3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No cards detected yet. Select a detection mode to begin.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                        {detectedCards.map((card, index) => (
                          <div
                            key={card.id}
                            className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                              selectedCard?.id === card.id ? 'ring-2 ring-primary' : ''
                            } ${card.scanned ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                            onClick={() => setSelectedCard(card)}
                          >
                            <img
                              src={card.image}
                              alt={`Card ${index + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                              {index + 1}
                            </div>
                            <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                              {Math.round(card.confidence * 100)}%
                            </div>
                            {card.scanned && (
                              <div className="absolute bottom-1 right-1">
                                {card.result?.success ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Selected Card Details */}
                {selectedCard && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Card {detectedCards.indexOf(selectedCard) + 1} Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <img
                          src={selectedCard.image}
                          alt="Selected card"
                          className="w-full rounded-lg border"
                        />
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Confidence:</span>
                            <span className="ml-2">{Math.round(selectedCard.confidence * 100)}%</span>
                          </div>
                          <div>
                            <span className="font-medium">Position:</span>
                            <span className="ml-2">({selectedCard.x}, {selectedCard.y})</span>
                          </div>
                          <div>
                            <span className="font-medium">Size:</span>
                            <span className="ml-2">{selectedCard.width}×{selectedCard.height}</span>
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <span className="ml-2">
                              {selectedCard.scanned ? 
                                (selectedCard.result?.success ? '✓ Identified' : '✗ Failed') 
                                : 'Pending'
                              }
                            </span>
                          </div>
                        </div>

                        {selectedCard.result?.card && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <p className="font-medium">{selectedCard.result.card.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedCard.result.card.type}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}