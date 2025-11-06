'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Camera, 
  RefreshCw, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Type,
  Image as ImageIcon,
  Zap,
  Eye,
  Edit3
} from 'lucide-react'

interface RescanResult {
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
  ocrAnalysis?: any
}

interface EnhancedRescanProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  originalScan: {
    id: string
    imageUrl: string
    ocrText?: string
    card?: any
  }
  onRescanComplete: (result: RescanResult) => void
}

export default function EnhancedRescan({ 
  open, 
  onOpenChange, 
  originalScan, 
  onRescanComplete 
}: EnhancedRescanProps) {
  const [isRescanning, setIsRescanning] = useState(false)
  const [rescanProgress, setRescanProgress] = useState(0)
  const [rescanResult, setRescanResult] = useState<RescanResult | null>(null)
  const [enhancementMode, setEnhancementMode] = useState<'auto' | 'manual' | 'hybrid'>('hybrid')
  const [manualHints, setManualHints] = useState({
    cardName: '',
    cardType: '',
    attribute: '',
    knownText: '',
    description: ''
  })

  const handleEnhancedRescan = async () => {
    setIsRescanning(true)
    setRescanProgress(0)
    setRescanResult(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setRescanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 8
        })
      }, 300)

      const response = await fetch('/api/scan/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalScanId: originalScan.id,
          enhancementMode,
          manualHints,
          userId: 'default-user'
        })
      })

      clearInterval(progressInterval)
      setRescanProgress(100)

      const result: RescanResult = await response.json()
      
      if (result.success) {
        toast.success('Card successfully identified with enhanced scanning!')
      } else {
        toast.error('Enhanced scan failed. Try providing more specific hints.')
      }

      setRescanResult(result)
      onRescanComplete(result)

    } catch (error) {
      console.error('Enhanced scan error:', error)
      toast.error('Failed to process enhanced scan')
    } finally {
      setIsRescanning(false)
    }
  }

  const parseOriginalOCR = () => {
    if (!originalScan.ocrText) return null
    try {
      return JSON.parse(originalScan.ocrText)
    } catch {
      return { fullText: originalScan.ocrText }
    }
  }

  const originalOCR = parseOriginalOCR()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5" />
            <span>Enhanced Card Re-scan</span>
            <Badge variant="secondary">AI-Assisted</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Original Image and Analysis */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Original Scan</span>
                </CardTitle>
                <CardDescription>
                  The original image that failed to identify
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={originalScan.imageUrl}
                  alt="Original scan"
                  className="w-full rounded-lg shadow-md"
                />
                {originalScan.card && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">Previous Attempt:</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {originalScan.card.name} ({originalScan.card.type})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Original OCR Analysis */}
            {originalOCR && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Type className="w-4 h-4" />
                    <span>Original OCR Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {originalOCR.confidence && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Confidence:</span>
                          <span>{originalOCR.confidence}%</span>
                        </div>
                        <Progress value={originalOCR.confidence} className="w-full" />
                      </div>
                    )}
                    
                    {originalOCR.fullText && (
                      <div>
                        <p className="text-sm font-medium mb-1">Extracted Text:</p>
                        <p className="text-sm text-muted-foreground italic bg-muted p-2 rounded">
                          {originalOCR.fullText}
                        </p>
                      </div>
                    )}

                    {originalOCR.regions && originalOCR.regions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Text Regions:</p>
                        <div className="space-y-1">
                          {originalOCR.regions.map((region: any, index: number) => (
                            <div key={index} className="text-xs p-2 bg-muted rounded">
                              <span className="font-medium capitalize">{region.type}:</span>
                              <span className="ml-2">"{region.text}"</span>
                              <span className="ml-2 text-muted-foreground">({region.confidence}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Enhancement Controls */}
          <div className="space-y-4">
            {/* Enhancement Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Enhancement Mode</span>
                </CardTitle>
                <CardDescription>
                  Choose how the AI should enhance the scanning process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={enhancementMode} onValueChange={(value: any) => setEnhancementMode(value)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="auto">Auto</TabsTrigger>
                    <TabsTrigger value="manual">Manual</TabsTrigger>
                    <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="auto" className="space-y-2">
                    <Alert>
                      <Eye className="w-4 h-4" />
                      <AlertDescription>
                        AI will automatically apply multiple enhancement techniques 
                        including contrast adjustment, noise reduction, and advanced OCR models.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  <TabsContent value="manual" className="space-y-2">
                    <Alert>
                      <Edit3 className="w-4 h-4" />
                      <AlertDescription>
                        Provide specific hints and information to guide the AI identification.
                        Best for cards with partial text or distinctive features.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  <TabsContent value="hybrid" className="space-y-2">
                    <Alert>
                      <Zap className="w-4 h-4" />
                      <AlertDescription>
                        Combines automatic enhancement with your manual hints for the highest success rate.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Manual Hints Input */}
            {(enhancementMode === 'manual' || enhancementMode === 'hybrid') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Manual Hints</span>
                  </CardTitle>
                  <CardDescription>
                    Provide any information you know about this card
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">Card Name (or partial name)</Label>
                    <Input
                      id="cardName"
                      placeholder="e.g., Blue-Eyes White Dragon or just Blue-Eyes"
                      value={manualHints.cardName}
                      onChange={(e) => setManualHints(prev => ({ ...prev, cardName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardType">Card Type</Label>
                    <Input
                      id="cardType"
                      placeholder="e.g., Monster, Spell, Trap"
                      value={manualHints.cardType}
                      onChange={(e) => setManualHints(prev => ({ ...prev, cardType: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="attribute">Attribute (if monster)</Label>
                    <Input
                      id="attribute"
                      placeholder="e.g., LIGHT, DARK, FIRE, WATER, etc."
                      value={manualHints.attribute}
                      onChange={(e) => setManualHints(prev => ({ ...prev, attribute: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="knownText">Visible Text (any text you can read)</Label>
                    <Textarea
                      id="knownText"
                      placeholder="Type any text you can clearly read on the card..."
                      value={manualHints.knownText}
                      onChange={(e) => setManualHints(prev => ({ ...prev, knownText: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Card Description (if readable)</Label>
                    <Textarea
                      id="description"
                      placeholder="Type the card effect or description text..."
                      value={manualHints.description}
                      onChange={(e) => setManualHints(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rescan Button and Progress */}
            <Card>
              <CardContent className="pt-6">
                {isRescanning && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Enhanced scanning...</span>
                      <span>{rescanProgress}%</span>
                    </div>
                    <Progress value={rescanProgress} className="w-full" />
                  </div>
                )}

                <Button 
                  onClick={handleEnhancedRescan}
                  disabled={isRescanning}
                  className="w-full"
                >
                  {isRescanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enhanced Scanning...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Enhanced Scan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {rescanResult && (
              <Card className={rescanResult.success ? 'border-green-500' : 'border-red-500'}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {rescanResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>Enhanced Scan Result</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className={rescanResult.success ? 'border-green-500' : 'border-red-500'}>
                    <AlertDescription>{rescanResult.message}</AlertDescription>
                  </Alert>
                  
                  {rescanResult.card && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h4 className="font-medium mb-2">Identified Card:</h4>
                      <p className="text-sm"><strong>{rescanResult.card.name}</strong></p>
                      <p className="text-sm text-muted-foreground">{rescanResult.card.type}</p>
                      {rescanResult.scan.confidence && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>New Confidence:</span>
                            <span>{Math.round(rescanResult.scan.confidence * 100)}%</span>
                          </div>
                          <Progress value={rescanResult.scan.confidence * 100} className="w-full mt-1" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Close
                    </Button>
                    {rescanResult.success && (
                      <Button onClick={() => {
                        onRescanComplete(rescanResult)
                        onOpenChange(false)
                      }}>
                        Add to Collection
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}