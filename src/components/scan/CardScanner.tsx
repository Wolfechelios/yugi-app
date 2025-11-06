'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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

interface CardScannerProps {
  onClose?: () => void
  onScanComplete?: (result: ScanResult) => void
  userId?: string
}

export default function CardScanner({ onClose, onScanComplete, userId }: CardScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setScanResult(null)
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

  const processScan = async () => {
    if (!selectedImage || !userId) {
      if (!userId) {
        toast.error('User not authenticated. Please refresh the page.')
      }
      return
    }

    setIsScanning(true)
    setScanProgress(0)

    try {
      // Convert base64 to blob for upload
      const response = await fetch(selectedImage)
      const blob = await response.blob()
      const file = new File([blob], 'card-scan.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('image', file)
      formData.append('userId', userId)

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

      const result: ScanResult = await scanResponse.json()
      
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
      } else {
        toast.error(result.message || 'Scan failed')
      }

      setScanResult(result)
      onScanComplete?.(result)

    } catch (error) {
      console.error('Scan error:', error)
      toast.error('Failed to process scan')
    } finally {
      setIsScanning(false)
    }
  }

  const resetScanner = () => {
    setSelectedImage(null)
    setScanResult(null)
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Card Scanner</span>
            </CardTitle>
            <CardDescription>
              Upload or capture an image of a Yu-Gi-Oh! card for identification
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
              )}

              {/* OCR Analysis Display */}
              {scanResult?.ocrAnalysis && (
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