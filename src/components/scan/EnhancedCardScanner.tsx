'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, Upload, X, CheckCircle, AlertCircle, Loader2, TrendingUp, DollarSign, ExternalLink, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { PriceChartingCard } from '@/lib/pricecharting'

interface ScanResult {
  success: boolean
  scan: {
    id: string
    status: string
    confidence?: number
    ocrText?: string
  }
  card?: {
    id: string
    name: string
    type: string
    attribute?: string
    level?: number
    attack?: number
    defense?: number
    description?: string
    rarity: string
  }
  message: string
  ocrAnalysis?: {
    fullText: string
    confidence: number
    regions: Array<{
      text: string
      confidence: number
      type: string
    }>
    verification: {
      cardNameMatch: boolean
      textQuality: 'high' | 'medium' | 'low'
    }
  }
}

interface EnhancedCardScannerProps {
  onClose?: () => void
  onScanComplete?: (result: ScanResult) => void
  userId?: string
}

export default function EnhancedCardScanner({ onClose, onScanComplete, userId }: EnhancedCardScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [priceData, setPriceData] = useState<PriceChartingCard | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setScanResult(null)
        setPriceData(null)
      }
      reader.readAsDataURL(file)
    } else {
      toast.error('Please select a valid image file')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const lookupPrice = async (cardName: string) => {
    setIsLoadingPrice(true)
    try {
      const response = await fetch('/api/price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cardName })
      })

      const result = await response.json()
      
      if (result.success && result.data) {
        setPriceData(result.data)
        if (result.simulated) {
          toast.info('Using simulated price data for demo')
        } else {
          toast.success('Price data loaded successfully')
        }
      } else {
        toast.error(result.error || 'Failed to load price data')
      }
    } catch (error) {
      console.error('Price lookup failed:', error)
      toast.error('Failed to lookup price information')
    } finally {
      setIsLoadingPrice(false)
    }
  }

  const processScan = async () => {
    if (!selectedImage || !userId) {
      if (!userId) {
        toast.error('User not authenticated. Please refresh the page.')
      }
      return
    }

    console.log('Starting scan process...')
    console.log('UserId:', userId)
    console.log('Selected image length:', selectedImage.length)

    setIsScanning(true)
    setScanProgress(0)

    try {
      // Convert base64 to blob for upload
      const response = await fetch(selectedImage)
      const blob = await response.blob()
      const file = new File([blob], 'card-scan.jpg', { type: 'image/jpeg' })

      console.log('Created file:', file.name, file.size, file.type)

      const formData = new FormData()
      formData.append('image', file)
      formData.append('userId', userId)

      console.log('Sending request to /api/scan...')

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const scanResponse = await fetch('/api/scan', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setScanProgress(100)

      console.log('Scan response status:', scanResponse.status)
      console.log('Scan response ok:', scanResponse.ok)

      const result: ScanResult = await scanResponse.json()
      console.log('Scan result:', result)
      
      // Parse OCR analysis if available
      if (result.scan.ocrText) {
        try {
          result.ocrAnalysis = JSON.parse(result.scan.ocrText)
        } catch (parseError) {
          console.warn('Failed to parse OCR analysis:', parseError)
        }
      }
      
      if (result.success) {
        toast.success(result.message)
        // Automatically lookup price if card was identified
        if (result.card?.name) {
          await lookupPrice(result.card.name)
        }
        toast.info('Review your scan results below, then close the dialog when done.')
      } else {
        toast.error(result.message || 'Scan failed')
        console.error('Scan failed:', result)
      }

      setScanResult(result)
      onScanComplete?.(result)

    } catch (error) {
      console.error('Scan error:', error)
      toast.error(`Failed to process scan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsScanning(false)
    }
  }

  const resetScanner = () => {
    setSelectedImage(null)
    setScanResult(null)
    setPriceData(null)
    setScanProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'bg-gray-500'
      case 'rare':
        return 'bg-blue-500'
      case 'super rare':
        return 'bg-green-500'
      case 'ultra rare':
        return 'bg-purple-500'
      case 'secret rare':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const getPriceChangeColor = (current: number, market: number) => {
    if (current > market) return 'text-green-600'
    if (current < market) return 'text-red-600'
    return 'text-gray-600'
  }

  const getPriceChangeIcon = (current: number, market: number) => {
    if (current > market) return '↗'
    if (current < market) return '↘'
    return '→'
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Enhanced Card Scanner</span>
              <Badge variant="secondary" className="ml-2">with PriceCharting</Badge>
            </CardTitle>
            <CardDescription>
              Upload or capture an image of a Yu-Gi-Oh! card for identification and pricing
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {!selectedImage ? (
            // Upload Area
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                
                <div>
                  <p className="text-lg font-medium">Drop card image here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-upload"
                />
                
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select Image
                  </label>
                </Button>

                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WebP formats. Max 10MB.
                </p>
              </div>
            </div>
          ) : (
            // Image Preview and Processing
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Card scan"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={resetScanner}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {isScanning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing scan...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <Progress value={scanProgress} className="w-full" />
                </div>
              )}

              {scanResult && (
                <Alert className={scanResult.success ? 'border-green-500' : 'border-red-500'}>
                  <div className="flex items-center space-x-2">
                    {scanResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <AlertDescription>{scanResult.message}</AlertDescription>
                  </div>
                </Alert>
              )}

              {scanResult?.card && (
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Card Details</TabsTrigger>
                    <TabsTrigger value="pricing">Market Pricing</TabsTrigger>
                    <TabsTrigger value="ocr">OCR Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {scanResult.card.name}
                          <Badge className={`${getRarityColor(scanResult.card.rarity)} text-white`}>
                            {scanResult.card.rarity}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{scanResult.card.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {scanResult.card.attribute && (
                            <div>
                              <span className="font-medium">Attribute:</span> {scanResult.card.attribute}
                            </div>
                          )}
                          {scanResult.card.level && (
                            <div>
                              <span className="font-medium">Level:</span> {scanResult.card.level}
                            </div>
                          )}
                          {scanResult.card.attack !== undefined && (
                            <div>
                              <span className="font-medium">ATK:</span> {scanResult.card.attack}
                            </div>
                          )}
                          {scanResult.card.defense !== undefined && (
                            <div>
                              <span className="font-medium">DEF:</span> {scanResult.card.defense}
                            </div>
                          )}
                        </div>
                        {scanResult.card.description && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Effect:</p>
                            <p className="text-sm text-muted-foreground italic">
                              {scanResult.card.description}
                            </p>
                          </div>
                        )}
                        {scanResult.scan.confidence && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm">
                              <span>Recognition Confidence:</span>
                              <span>{Math.round(scanResult.scan.confidence * 100)}%</span>
                            </div>
                            <Progress value={scanResult.scan.confidence * 100} className="w-full mt-1" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    {isLoadingPrice ? (
                      <Card>
                        <CardContent className="flex items-center justify-center py-8">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading price data...</span>
                          </div>
                        </CardContent>
                      </Card>
                    ) : priceData ? (
                      <div className="space-y-4">
                        <Card className="bg-green-50 dark:bg-green-950/20">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <DollarSign className="w-5 h-5" />
                              <span>Current Market Value</span>
                            </CardTitle>
                            <CardDescription>
                              Real-time pricing data from PriceCharting
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                  {formatPrice(priceData.price)}
                                </p>
                                <p className="text-sm text-muted-foreground">Recent Sale</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">
                                  {formatPrice(priceData.marketPrice)}
                                </p>
                                <p className="text-sm text-muted-foreground">Market Price</p>
                              </div>
                              <div className="text-center">
                                <p className={`text-2xl font-bold ${getPriceChangeColor(priceData.price, priceData.marketPrice)}`}>
                                  {getPriceChangeIcon(priceData.price, priceData.marketPrice)} {formatPrice(Math.abs(priceData.price - priceData.marketPrice))}
                                </p>
                                <p className="text-sm text-muted-foreground">vs Market</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Price Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Ungraded Price:</span>
                                <span className="font-medium">{formatPrice(priceData.ungradedPrice)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Graded Price:</span>
                                <span className="font-medium">{formatPrice(priceData.gradedPrice)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Condition:</span>
                                <Badge variant="outline">{priceData.condition}</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Set:</span>
                                <span className="font-medium">{priceData.set}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Card Number:</span>
                                <span className="font-medium">#{priceData.number}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1" asChild>
                            <a 
                              href={priceData.productUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center space-x-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>View on PriceCharting</span>
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => scanResult?.card?.name && lookupPrice(scanResult.card.name)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-8">
                          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">No price data available</p>
                          <Button 
                            onClick={() => scanResult?.card?.name && lookupPrice(scanResult.card.name)}
                            disabled={isLoadingPrice}
                          >
                            {isLoadingPrice ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Lookup Price
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="ocr" className="space-y-4">
                    {scanResult.ocrAnalysis && (
                      <Card className="bg-blue-50 dark:bg-blue-950/20">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>OCR Analysis</span>
                            <Badge variant={scanResult.ocrAnalysis.verification.cardNameMatch ? "default" : "secondary"}>
                              {scanResult.ocrAnalysis.verification.cardNameMatch ? "Verified" : "Unverified"}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Text extraction quality: {scanResult.ocrAnalysis.confidence}% confidence
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span>Overall OCR Confidence:</span>
                                <span>{scanResult.ocrAnalysis.confidence}%</span>
                              </div>
                              <Progress value={scanResult.ocrAnalysis.confidence} className="w-full" />
                            </div>

                            <div>
                              <p className="text-sm font-medium mb-2">Text Quality:</p>
                              <Badge variant={
                                scanResult.ocrAnalysis.verification.textQuality === 'high' ? 'default' :
                                scanResult.ocrAnalysis.verification.textQuality === 'medium' ? 'secondary' : 'destructive'
                              }>
                                {scanResult.ocrAnalysis.verification.textQuality.toUpperCase()}
                              </Badge>
                            </div>

                            {scanResult.ocrAnalysis.regions && scanResult.ocrAnalysis.regions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Detected Text Regions:</p>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {scanResult.ocrAnalysis.regions.map((region, index) => (
                                    <div key={index} className="text-xs p-2 bg-background rounded border">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{region.type}:</span>
                                        <span>{region.confidence}%</span>
                                      </div>
                                      <p className="text-muted-foreground mt-1">{region.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {scanResult.ocrAnalysis.fullText && (
                              <div>
                                <p className="text-sm font-medium mb-2">Extracted Text:</p>
                                <div className="text-xs p-3 bg-background rounded border max-h-24 overflow-y-auto">
                                  <p className="text-muted-foreground italic">{scanResult.ocrAnalysis.fullText}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              )}

              <div className="flex space-x-2">
                {!isScanning && !scanResult && (
                  <Button onClick={processScan} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Scan Card
                  </Button>
                )}
                {isScanning && (
                  <Button disabled className="flex-1">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </Button>
                )}
                <Button variant="outline" onClick={resetScanner}>
                  {scanResult ? 'Scan Another' : 'Reset'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}