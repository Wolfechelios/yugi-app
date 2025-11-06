'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Filter, X, Plus, Eye } from 'lucide-react'
import { toast } from 'sonner'
import CardDetailsDialog from '@/components/card/CardDetailsDialog'

interface Card {
  id: string
  name: string
  type: string
  attribute?: string
  level?: number
  attack?: number
  defense?: number
  description?: string
  rarity: string
  archetype?: string
  imageUrl?: string
}

interface CardSearchProps {
  onCardSelect?: (card: Card) => void
  showAddButton?: boolean
  onAddCard?: (card: Card) => void
}

const CARD_TYPES = ['All', 'Monster', 'Spell', 'Trap']
const ATTRIBUTES = ['All', 'DARK', 'LIGHT', 'EARTH', 'WIND', 'WATER', 'FIRE', 'DIVINE']
const RARITIES = ['All', 'Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Secret Rare', 'Prismatic Secret Rare', 'Ultimate Rare', 'Ghost Rare']

export default function CardSearch({ onCardSelect, showAddButton = false, onAddCard }: CardSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedAttribute, setSelectedAttribute] = useState('All')
  const [selectedRarity, setSelectedRarity] = useState('All')
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Mock data for demonstration - in real app, this would come from API
  const mockCards: Card[] = [
    {
      id: '1',
      name: 'Blue-Eyes White Dragon',
      type: 'Monster',
      attribute: 'LIGHT',
      level: 8,
      attack: 3000,
      defense: 2500,
      description: 'This legendary dragon is a powerful engine of destruction!',
      rarity: 'Ultra Rare',
      archetype: 'Blue-Eyes'
    },
    {
      id: '2',
      name: 'Dark Magician',
      type: 'Monster',
      attribute: 'DARK',
      level: 7,
      attack: 2500,
      defense: 2100,
      description: 'The ultimate wizard in terms of attack and defense.',
      rarity: 'Ultra Rare',
      archetype: 'Dark Magician'
    },
    {
      id: '3',
      name: 'Pot of Greed',
      type: 'Spell',
      description: 'Draw 2 cards.',
      rarity: 'Super Rare'
    },
    {
      id: '4',
      name: 'Mirror Force',
      type: 'Trap',
      description: 'When an opponent\'s monster declares an attack: Destroy all Attack Position monsters your opponent controls.',
      rarity: 'Super Rare'
    },
    {
      id: '5',
      name: 'Exodia the Forbidden One',
      type: 'Monster',
      attribute: 'DARK',
      level: 3,
      attack: 1000,
      defense: 1000,
      description: 'An automatic victory can be declared by the player who gathers all 5 pieces of "Exodia" in their hand.',
      rarity: 'Ultra Rare',
      archetype: 'Exodia'
    }
  ]

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/cards')
      // const data = await response.json()
      
      // Using mock data for now
      setTimeout(() => {
        setCards(mockCards)
        setIsLoading(false)
      }, 500)
    } catch (error) {
      toast.error('Failed to load cards')
      setIsLoading(false)
    }
  }

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (card.archetype && card.archetype.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesType = selectedType === 'All' || card.type === selectedType
      const matchesAttribute = selectedAttribute === 'All' || card.attribute === selectedAttribute
      const matchesRarity = selectedRarity === 'All' || card.rarity === selectedRarity

      return matchesSearch && matchesType && matchesAttribute && matchesRarity
    })
  }, [cards, searchTerm, selectedType, selectedAttribute, selectedRarity])

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
    setDetailsOpen(true)
    onCardSelect?.(card)
  }

  const handleAddCard = (card: Card, e: React.MouseEvent) => {
    e.stopPropagation()
    onAddCard?.(card)
  }

  const handleViewDetails = (card: Card, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedCard(card)
    setDetailsOpen(true)
  }

  const clearFilters = () => {
    setSelectedType('All')
    setSelectedAttribute('All')
    setSelectedRarity('All')
    setSearchTerm('')
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
      case 'prismatic secret rare':
        return 'bg-orange-500'
      case 'ultimate rare':
        return 'bg-red-500'
      case 'ghost rare':
        return 'bg-cyan-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getAttributeColor = (attribute?: string) => {
    switch (attribute?.toLowerCase()) {
      case 'dark':
        return 'bg-purple-600'
      case 'light':
        return 'bg-yellow-500'
      case 'earth':
        return 'bg-orange-600'
      case 'wind':
        return 'bg-green-500'
      case 'water':
        return 'bg-blue-500'
      case 'fire':
        return 'bg-red-500'
      case 'divine':
        return 'bg-gradient-to-r from-purple-600 to-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by card name, effect, or archetype..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {(selectedType !== 'All' || selectedAttribute !== 'All' || selectedRarity !== 'All') && (
            <Badge variant="secondary" className="ml-1">
              {(selectedType !== 'All' ? 1 : 0) + 
               (selectedAttribute !== 'All' ? 1 : 0) + 
               (selectedRarity !== 'All' ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Filters</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Attribute</label>
                <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRIBUTES.map(attribute => (
                      <SelectItem key={attribute} value={attribute}>{attribute}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rarity</label>
                <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RARITIES.map(rarity => (
                      <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cards...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || selectedType !== 'All' || selectedAttribute !== 'All' || selectedRarity !== 'All'
                ? 'No cards found matching your criteria'
                : 'No cards available'
              }
            </p>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground mb-4">
            Found {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
          </div>
        )}

        <ScrollArea className="h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card) => (
              <Card 
                key={card.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick(card)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{card.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <span>{card.type}</span>
                        {card.attribute && (
                          <>
                            <span>•</span>
                            <Badge className={`${getAttributeColor(card.attribute)} text-white text-xs`}>
                              {card.attribute}
                            </Badge>
                          </>
                        )}
                        {card.level && (
                          <>
                            <span>•</span>
                            <span>Lv {card.level}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={`${getRarityColor(card.rarity)} text-white text-xs`}>
                        {card.rarity}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleViewDetails(card, e)}
                          className="h-6 px-2 text-xs"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {showAddButton && (
                          <Button
                            size="sm"
                            onClick={(e) => handleAddCard(card, e)}
                            className="h-6 px-2 text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {card.attack !== undefined && card.defense !== undefined && (
                    <div className="flex items-center space-x-4 text-sm mb-2">
                      <span className="font-medium">ATK {card.attack}</span>
                      <span className="font-medium">DEF {card.defense}</span>
                    </div>
                  )}
                  {card.description && (
                    <p className="text-sm text-muted-foreground italic line-clamp-3">
                      {card.description}
                    </p>
                  )}
                  {card.archetype && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {card.archetype}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Card Details Dialog */}
      <CardDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        card={selectedCard}
        showActions={showAddButton}
        onAddCard={onAddCard}
      />
    </div>
  )
}