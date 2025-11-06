'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Image as ImageIcon, Settings, Download, Info } from 'lucide-react'
import { toast } from 'sonner'
import AnnotationGuidelines from './AnnotationGuidelines'

interface SyntheticImage {
  cardId: string
  cardName: string
  syntheticImage: string
  metadata: {
    generatedAt: string
    background: string
    rotation: number
    purpose: string
  }
}

interface SyntheticDataGeneratorProps {
  onImagesGenerated?: (images: SyntheticImage[]) => void
}

export default function SyntheticDataGenerator({ onImagesGenerated }: SyntheticDataGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedImages, setGeneratedImages] = useState<SyntheticImage[]>([])
  const [count, setCount] = useState([10])
  const [backgrounds, setBackgrounds] = useState(['table', 'mat', 'floor'])
  const [capabilities, setCapabilities] = useState<any>(null)

  const loadCapabilities = async () => {
    try {
      const response = await fetch('/api/synthetic')
      const data = await response.json()
      setCapabilities(data)
    } catch (error) {
      console.error('Failed to load capabilities:', error)
    }
  }

  useState(() => {
    loadCapabilities()
  }, [])

  const generateSyntheticData = async () => {
    setIsGenerating(true)
    setProgress(0)

    try {
      const response = await fetch('/api/synthetic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: count[0],
          backgrounds,
          variations: true
        })
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedImages(result.images)
        setProgress(100)
        toast.success(result.message)
        onImagesGenerated?.(result.images)
      } else {
        toast.error(result.error || 'Failed to generate synthetic data')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate synthetic data')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = (image: SyntheticImage, index: number) => {
    try {
      const link = document.createElement('a')
      link.href = `data:image/png;base64,${image.syntheticImage}`
      link.download = `synthetic_${image.cardName.replace(/\s+/g, '_')}_${index}.png`
      link.click()
      toast.success('Image downloaded')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  const backgroundOptions = [
    { value: 'table', label: 'Wooden Table' },
    { value: 'mat', label: 'Playmat' },
    { value: 'floor', label: 'Floor Surface' },
    { value: 'desk', label: 'Desk' },
    { value: 'cloth', label: 'Cloth Surface' }
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Data Generator</TabsTrigger>
          <TabsTrigger value="guidelines">Annotation Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
      {/* Research Context */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This feature implements synthetic data generation inspired by the <strong>gabraken/mtg-detection</strong> dataset methodology. 
          It creates realistic training images to improve card detection robustness in real-world conditions.
        </AlertDescription>
      </Alert>

      {/* Capabilities Overview */}
      {capabilities && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Synthetic Data Capabilities</span>
            </CardTitle>
            <CardDescription>
              AI-powered synthetic training data generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Supported Variations</h4>
                <div className="flex flex-wrap gap-1">
                  {capabilities.capabilities.supportedVariations.map((variation: string) => (
                    <Badge key={variation} variant="secondary" className="text-xs">
                      {variation.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Technical Details</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Max batch size: {capabilities.capabilities.maxBatchSize} images</li>
                  <li>Output: {capabilities.capabilities.outputFormat}</li>
                  <li>Inspired by: {capabilities.capabilities.researchInspiration}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Generation Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Number of Images: {count[0]}
            </label>
            <Slider
              value={count}
              onValueChange={setCount}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Background Types</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {backgroundOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={backgrounds.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBackgrounds([...backgrounds, option.value])
                      } else {
                        setBackgrounds(backgrounds.filter(b => b !== option.value))
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button 
            onClick={generateSyntheticData} 
            disabled={isGenerating || backgrounds.length === 0}
            className="w-full"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Synthetic Data'}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generation Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Results */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>Generated Images ({generatedImages.length})</span>
            </CardTitle>
            <CardDescription>
              Synthetic training images for improved model robustness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative group">
                    <img
                      src={`data:image/png;base64,${image.syntheticImage}`}
                      alt={`Synthetic training image of ${image.cardName} Yu-Gi-Oh! card`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        onClick={() => downloadImage(image, index)}
                        className="bg-white/90 hover:bg-white text-black"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{image.cardName}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Background: {image.metadata.background}</span>
                      <span>Rotation: {image.metadata.rotation}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="guidelines">
          <AnnotationGuidelines />
        </TabsContent>
      </Tabs>
    </div>
  )
}