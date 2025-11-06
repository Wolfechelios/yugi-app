'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Save, FileText, HelpCircle, Sparkles, Upload, Clipboard, Layout } from 'lucide-react'

interface CardData {
  name: string
  type: 'monster' | 'spell' | 'trap'
  attribute?: string
  level?: number
  rank?: number
  attack?: number
  defense?: number
  effect?: string
  description?: string
  rarity: 'common' | 'rare' | 'super_rare' | 'ultra_rare' | 'secret_rare'
  cardNumber?: string
  setCode?: string
  archetype?: string
  limit?: number
}

interface CardTemplate {
  name: string
  description: string
  data: Partial<CardData>
}

const cardTemplates: CardTemplate[] = [
  {
    name: "Blue-Eyes White Dragon",
    description: "Classic Normal Monster template",
    data: {
      type: "monster",
      attribute: "LIGHT",
      level: 8,
      attack: 3000,
      defense: 2500,
      rarity: "rare",
      effect: "This legendary dragon is a powerful engine of destruction."
    }
  },
  {
    name: "Dark Magician",
    description: "Spellcaster-type Monster template",
    data: {
      type: "monster",
      attribute: "DARK",
      level: 7,
      attack: 2500,
      defense: 2100,
      rarity: "rare",
      archetype: "Dark Magician",
      effect: "The ultimate wizard in terms of attack and defense."
    }
  },
  {
    name: "Valkyrie Funfte",
    description: "Fairy-type Effect Monster template",
    data: {
      type: "monster",
      attribute: "LIGHT",
      level: 2,
      attack: 800,
      defense: 1200,
      rarity: "common",
      archetype: "Valkyrie",
      effect: "\"Valkyrie\" monsters you control gain 200 ATK for each of your opponent's banished monsters. If you control a \"Valkyrie\" monster other than \"Valkyrie Funfte\": You can send 1 Spell/Trap from your Deck to the GY. You can only use this effect of \"Valkyrie Funfte\" once per turn."
    }
  },
  {
    name: "Spell Card Template",
    description: "Standard Spell Card structure",
    data: {
      type: "spell",
      rarity: "common",
      effect: "Activate this card to..."
    }
  },
  {
    name: "Trap Card Template",
    description: "Standard Trap Card structure",
    data: {
      type: "trap",
      rarity: "common",
      effect: "When your opponent..."
    }
  },
  {
    name: "XYZ Monster",
    description: "XYZ Monster template",
    data: {
      type: "monster",
      rank: 4,
      attack: 2500,
      defense: 2100,
      rarity: "super_rare",
      effect: "2 Level 4 monsters"
    }
  }
]

const monsterAttributes = ["DARK", "DIVINE", "EARTH", "FIRE", "LIGHT", "WATER", "WIND"]
const spellTypes = ["Normal", "Quick-Play", "Continuous", "Equip", "Field", "Ritual"]
const trapTypes = ["Normal", "Continuous", "Counter"]

// Function to parse YGOJSON format
const parseYGOJSON = (jsonData: any): Partial<CardData> => {
  try {
    const card: Partial<CardData> = {}
    
    // Basic information
    if (jsonData.text?.en?.name) {
      card.name = jsonData.text.en.name
    }
    
    if (jsonData.cardType) {
      card.type = jsonData.cardType.toLowerCase() as 'monster' | 'spell' | 'trap'
    }
    
    if (jsonData.attribute) {
      card.attribute = jsonData.attribute.toUpperCase()
    }
    
    // Monster specific fields
    if (jsonData.cardType === 'monster') {
      if (jsonData.level) {
        card.level = jsonData.level
      }
      if (jsonData.atk !== undefined) {
        card.attack = jsonData.atk
      }
      if (jsonData.def !== undefined) {
        card.defense = jsonData.def
      }
    }
    
    // Effect text
    if (jsonData.text?.en?.effect) {
      card.effect = jsonData.text.en.effect
    }
    
    // Rarity from Master Duel or Duel Links
    if (jsonData.masterDuel?.rarity) {
      const rarityMap: Record<string, CardData['rarity']> = {
        'n': 'common',
        'r': 'rare', 
        'sr': 'super_rare',
        'ur': 'ultra_rare',
        'scr': 'secret_rare'
      }
      card.rarity = rarityMap[jsonData.masterDuel.rarity] || 'common'
    }
    
    // Card number/password
    if (jsonData.passwords && jsonData.passwords.length > 0) {
      card.cardNumber = jsonData.passwords[0].toString()
    }
    
    // Archetype from series or card name
    if (jsonData.series && jsonData.series.length > 0) {
      // Extract archetype from card name if possible
      const name = jsonData.text?.en?.name || ''
      if (name.includes('Valkyrie')) {
        card.archetype = 'Valkyrie'
      } else if (name.includes('Blue-Eyes')) {
        card.archetype = 'Blue-Eyes'
      } else if (name.includes('Dark Magician')) {
        card.archetype = 'Dark Magician'
      } else if (name.includes('Elemental HERO')) {
        card.archetype = 'Elemental HERO'
      }
    }
    
    return card
  } catch (error) {
    console.error('Error parsing YGOJSON:', error)
    return {}
  }
}

export default function ManualCardInput({ onCardSave, userId }: { onCardSave: (card: CardData) => void, userId?: string }) {
  const [cardData, setCardData] = useState<CardData>({
    name: '',
    type: 'monster',
    rarity: 'common'
  })
  
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [guideDialogOpen, setGuideDialogOpen] = useState(false)
  const [jsonImportOpen, setJsonImportOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState('')

  const handleInputChange = (field: keyof CardData, value: any) => {
    setCardData(prev => ({ ...prev, [field]: value }))
  }

  const applyTemplate = (template: CardTemplate) => {
    setCardData(prev => ({ ...prev, ...template.data }))
    setTemplateDialogOpen(false)
    toast.success(`Applied template: ${template.name}`)
  }

  const handleJsonImport = () => {
    try {
      const jsonData = JSON.parse(jsonInput)
      const parsedCard = parseYGOJSON(jsonData)
      
      if (parsedCard.name) {
        setCardData(prev => ({ 
          ...prev, 
          ...parsedCard,
          rarity: parsedCard.rarity || 'common'
        }))
        setJsonImportOpen(false)
        setJsonInput('')
        toast.success(`Imported card: ${parsedCard.name}`)
      } else {
        toast.error('Invalid card data format')
      }
    } catch (error) {
      toast.error('Invalid JSON format')
    }
  }

  const handlePasteJson = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setJsonInput(clipboardText)
      toast.success('JSON pasted from clipboard')
    } catch (error) {
      toast.error('Failed to read clipboard')
    }
  }

  const validateCard = (): boolean => {
    if (!cardData.name.trim()) {
      toast.error('Card name is required')
      return false
    }
    
    if (cardData.type === 'monster') {
      if (!cardData.attribute) {
        toast.error('Monster attribute is required')
        return false
      }
      if (!cardData.level && !cardData.rank) {
        toast.error('Monster must have either Level or Rank')
        return false
      }
      if (cardData.attack === undefined || cardData.defense === undefined) {
        toast.error('Monster must have both Attack and Defense values')
        return false
      }
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateCard()) return
    
    try {
      // First create the card
      const response = await fetch('/api/cards/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...cardData,
          userId
        })
      })

      if (response.ok) {
        const savedCard = await response.json()
        
        // Then add it to the first available collection or create a default one
        try {
          const collectionsResponse = await fetch('/api/collections')
          if (collectionsResponse.ok) {
            const collections = await collectionsResponse.json()
            
            let targetCollection = collections[0]
            
            // Create default collection if none exists
            if (!targetCollection && userId) {
              const createCollectionResponse = await fetch('/api/collections', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  name: 'My Collection',
                  description: 'Default collection for manually entered cards',
                  userId
                })
              })
              
              if (createCollectionResponse.ok) {
                targetCollection = await createCollectionResponse.json()
              }
            }
            
            // Add card to collection
            if (targetCollection && userId) {
              await fetch('/api/collections/add-card', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  collectionId: targetCollection.id,
                  cardId: savedCard.id,
                  userId
                })
              })
            }
          }
        } catch (collectionError) {
          console.error('Error adding card to collection:', collectionError)
        }
        
        onCardSave(savedCard)
        toast.success(`Card "${cardData.name}" saved successfully!`)
        
        // Reset form
        setCardData({
          name: '',
          type: 'monster',
          rarity: 'common'
        })
      } else {
        const error = await response.json()
        toast.error(`Failed to save card: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving card:', error)
      toast.error('Failed to save card')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manual Card Entry</h2>
          <p className="text-muted-foreground">Input Yu-Gi-Oh! card information manually</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Card Templates</DialogTitle>
                <DialogDescription>
                  Choose a template to quickly fill in common card structures
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {cardTemplates.map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge variant={template.data.type === 'monster' ? 'default' : 'secondary'}>
                          {template.data.type?.toUpperCase()}
                        </Badge>
                        {template.data.attribute && (
                          <Badge variant="outline">{template.data.attribute}</Badge>
                        )}
                        {template.data.level && (
                          <Badge variant="outline">Level {template.data.level}</Badge>
                        )}
                        {template.data.rank && (
                          <Badge variant="outline">Rank {template.data.rank}</Badge>
                        )}
                        {template.data.attack && (
                          <span className="text-sm">ATK {template.data.attack}</span>
                        )}
                        {template.data.defense && (
                          <span className="text-sm">DEF {template.data.defense}</span>
                        )}
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => applyTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={jsonImportOpen} onOpenChange={setJsonImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Card from JSON</DialogTitle>
                <DialogDescription>
                  Import card data from YGOJSON format or other JSON sources
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="jsonInput">JSON Data</Label>
                  <Textarea
                    id="jsonInput"
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste your JSON card data here..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handlePasteJson}>
                    <Clipboard className="w-4 h-4 mr-2" />
                    Paste from Clipboard
                  </Button>
                  <Button onClick={handleJsonImport}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Card
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Supported formats:</strong></p>
                  <ul className="list-disc list-inside mt-1">
                    <li>YGOJSON format (standard Yu-Gi-Oh! JSON schema)</li>
                    <li>Card names from text.en.name field</li>
                    <li>Attributes, levels, ATK/DEF values</li>
                    <li>Effect text from text.en.effect field</li>
                    <li>Rarity from masterDuel.rarity field</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={guideDialogOpen} onOpenChange={setGuideDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <HelpCircle className="w-4 h-4 mr-2" />
                Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Card Information Guide</DialogTitle>
                <DialogDescription>
                  Learn how to properly input Yu-Gi-Oh! card information
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basics" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basics">Basics</TabsTrigger>
                  <TabsTrigger value="monsters">Monsters</TabsTrigger>
                  <TabsTrigger value="spells">Spells</TabsTrigger>
                  <TabsTrigger value="traps">Traps</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Card Name</h4>
                        <p className="text-sm text-muted-foreground">
                          The official name of the card as printed on the card.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: "Blue-Eyes White Dragon"
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Card Type</h4>
                        <p className="text-sm text-muted-foreground">
                          Choose between Monster, Spell, or Trap.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Rarity</h4>
                        <p className="text-sm text-muted-foreground">
                          The card's rarity level.
                        </p>
                        <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                          <li>Common - Black or white name</li>
                          <li>Rare - Silver name</li>
                          <li>Super Rare - Gold name</li>
                          <li>Ultra Rare - Gold name with holographic</li>
                          <li>Secret Rare - Rainbow holographic name</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="monsters" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monster Cards</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Attribute</h4>
                        <p className="text-sm text-muted-foreground">
                          The monster's elemental attribute.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Options: DARK, DIVINE, EARTH, FIRE, LIGHT, WATER, WIND
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Level vs Rank</h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>Level:</strong> For normal monsters (1-12 stars)<br/>
                          <strong>Rank:</strong> For XYZ monsters (1-13 stars)
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Attack & Defense</h4>
                        <p className="text-sm text-muted-foreground">
                          The monster's ATK and DEF values. Use ? for unknown values.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: ATK 3000 / DEF 2500
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Effect Text</h4>
                        <p className="text-sm text-muted-foreground">
                          The monster's effect description or flavor text for normal monsters.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="spells" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Spell Cards</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Spell Types</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          <li><strong>Normal:</strong> One-time use, sent to Graveyard after activation</li>
                          <li><strong>Quick-Play:</strong> Can be activated during opponent's turn</li>
                          <li><strong>Continuous:</strong> Remains on field after activation</li>
                          <li><strong>Equip:</strong> Equips to a monster</li>
                          <li><strong>Field:</strong> Affects the entire field</li>
                          <li><strong>Ritual:</strong> Used for Ritual Summoning</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Effect Text</h4>
                        <p className="text-sm text-muted-foreground">
                          The spell's activation condition and effect.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: "Target 1 monster on the field; destroy it."
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="traps" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trap Cards</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Trap Types</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          <li><strong>Normal:</strong> One-time use, sent to Graveyard after activation</li>
                          <li><strong>Continuous:</strong> Remains on field after activation</li>
                          <li><strong>Counter:</strong> Responds to opponent's actions</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">Effect Text</h4>
                        <p className="text-sm text-muted-foreground">
                          The trap's activation condition and effect.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: "When your opponent declares an attack: Target the attacking monster; destroy it."
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Card
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Card Information</CardTitle>
          <CardDescription>
            Fill in the details for your Yu-Gi-Oh! card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Card Name *</Label>
                <Input
                  id="name"
                  value={cardData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter card name"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Card Type *</Label>
                <Select value={cardData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monster">Monster</SelectItem>
                    <SelectItem value="spell">Spell</SelectItem>
                    <SelectItem value="trap">Trap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rarity">Rarity</Label>
                <Select value={cardData.rarity} onValueChange={(value) => handleInputChange('rarity', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="super_rare">Super Rare</SelectItem>
                    <SelectItem value="ultra_rare">Ultra Rare</SelectItem>
                    <SelectItem value="secret_rare">Secret Rare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="cardNumber">Card Number (Optional)</Label>
                <Input
                  id="cardNumber"
                  value={cardData.cardNumber || ''}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="e.g., LOB-000"
                />
              </div>
              
              <div>
                <Label htmlFor="setCode">Set Code (Optional)</Label>
                <Input
                  id="setCode"
                  value={cardData.setCode || ''}
                  onChange={(e) => handleInputChange('setCode', e.target.value)}
                  placeholder="e.g., LOB, SDY"
                />
              </div>
            </div>
            
            {/* Type-specific Information */}
            <div className="space-y-4">
              {cardData.type === 'monster' && (
                <>
                  <div>
                    <Label htmlFor="attribute">Attribute *</Label>
                    <Select value={cardData.attribute || ''} onValueChange={(value) => handleInputChange('attribute', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select attribute" />
                      </SelectTrigger>
                      <SelectContent>
                        {monsterAttributes.map(attr => (
                          <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="level">Level</Label>
                      <Input
                        id="level"
                        type="number"
                        min="1"
                        max="12"
                        value={cardData.level || ''}
                        onChange={(e) => handleInputChange('level', parseInt(e.target.value) || undefined)}
                        placeholder="1-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rank">Rank</Label>
                      <Input
                        id="rank"
                        type="number"
                        min="1"
                        max="13"
                        value={cardData.rank || ''}
                        onChange={(e) => handleInputChange('rank', parseInt(e.target.value) || undefined)}
                        placeholder="1-13"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="attack">Attack *</Label>
                      <Input
                        id="attack"
                        type="number"
                        min="0"
                        max="10000"
                        value={cardData.attack || ''}
                        onChange={(e) => handleInputChange('attack', parseInt(e.target.value) || undefined)}
                        placeholder="ATK"
                      />
                    </div>
                    <div>
                      <Label htmlFor="defense">Defense *</Label>
                      <Input
                        id="defense"
                        type="number"
                        min="0"
                        max="10000"
                        value={cardData.defense || ''}
                        onChange={(e) => handleInputChange('defense', parseInt(e.target.value) || undefined)}
                        placeholder="DEF"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="archetype">Archetype (Optional)</Label>
                <Input
                  id="archetype"
                  value={cardData.archetype || ''}
                  onChange={(e) => handleInputChange('archetype', e.target.value)}
                  placeholder="e.g., Blue-Eyes, Dark Magician"
                />
              </div>
            </div>
          </div>
          
          {/* Effect/Description */}
          <div className="mt-6">
            <Label htmlFor="effect">Effect Text / Description</Label>
            <Textarea
              id="effect"
              value={cardData.effect || ''}
              onChange={(e) => handleInputChange('effect', e.target.value)}
              placeholder="Enter the card's effect text or description..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Card Preview</CardTitle>
          <CardDescription>
            Preview of how your card information will be saved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">{cardData.name || 'Card Name'}</h3>
              <div className="flex justify-center space-x-2">
                <Badge variant={cardData.type === 'monster' ? 'default' : 'secondary'}>
                  {cardData.type?.toUpperCase()}
                </Badge>
                {cardData.attribute && (
                  <Badge variant="outline">{cardData.attribute}</Badge>
                )}
                <Badge variant="outline">{cardData.rarity?.replace('_', ' ').toUpperCase()}</Badge>
              </div>
              
              {cardData.type === 'monster' && (
                <div className="text-sm space-y-1">
                  {cardData.level && <span>Level {cardData.level}</span>}
                  {cardData.rank && <span>Rank {cardData.rank}</span>}
                  {(cardData.attack !== undefined || cardData.defense !== undefined) && (
                    <div>
                      ATK {cardData.attack ?? '?'} / DEF {cardData.defense ?? '?'}
                    </div>
                  )}
                </div>
              )}
              
              {cardData.effect && (
                <div className="text-sm text-left mt-3 p-3 bg-background rounded">
                  {cardData.effect}
                </div>
              )}
              
              {cardData.cardNumber && (
                <div className="text-xs text-muted-foreground">
                  {cardData.cardNumber}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}