'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface CardDetails {
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
  cardCode?: string
  createdAt?: string
  updatedAt?: string
}

interface CardDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: CardDetails | null
  showActions?: boolean
  onAddCard?: (card: CardDetails) => void
  onEditCard?: (card: CardDetails) => void
  onDeleteCard?: (card: CardDetails) => void
}

export default function CardDetailsDialog({
  open,
  onOpenChange,
  card,
  showActions = false,
  onAddCard,
  onEditCard,
  onDeleteCard
}: CardDetailsDialogProps) {
  if (!card) return null

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

  const handleAddCard = () => {
    onAddCard?.(card)
    onOpenChange(false)
  }

  const handleEditCard = () => {
    onEditCard?.(card)
  }

  const handleDeleteCard = () => {
    if (window.confirm(`Are you sure you want to delete "${card.name}"?`)) {
      onDeleteCard?.(card)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">{card.name}</DialogTitle>
          <div className="flex items-center space-x-2">
            <Badge className={`${getRarityColor(card.rarity)} text-white`}>
              {card.rarity}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Image */}
          <div className="space-y-4">
            {card.imageUrl ? (
              <div className="relative">
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <div className="aspect-[2.5:3.5] bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="text-6xl mb-2">🃏</div>
                  <p className="text-sm font-medium">No Image Available</p>
                </div>
              </div>
            )}

            {/* Card Actions */}
            {showActions && (
              <div className="flex flex-wrap gap-2">
                {onAddCard && (
                  <Button onClick={handleAddCard} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Collection
                  </Button>
                )}
                {onEditCard && (
                  <Button variant="outline" onClick={handleEditCard}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onDeleteCard && (
                  <Button variant="destructive" onClick={handleDeleteCard}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Card Details */}
          <div className="space-y-4">
            {/* Basic Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Type</span>
                    <span className="font-medium">{card.type}</span>
                  </div>
                  
                  {card.attribute && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Attribute</span>
                      <Badge className={`${getAttributeColor(card.attribute)} text-white`}>
                        {card.attribute}
                      </Badge>
                    </div>
                  )}

                  {card.level && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Level</span>
                      <span className="font-medium">Level {card.level}</span>
                    </div>
                  )}

                  {card.attack !== undefined && card.defense !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Stats</span>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium text-red-600">ATK {card.attack}</span>
                        <span className="font-medium text-blue-600">DEF {card.defense}</span>
                      </div>
                    </div>
                  )}

                  {card.archetype && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Archetype</span>
                      <Badge variant="outline">{card.archetype}</Badge>
                    </div>
                  )}

                  {card.cardCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Card Code</span>
                      <span className="font-mono text-sm">{card.cardCode}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card Description */}
            {card.description && (
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-3">Card Effect</h4>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            {(card.createdAt || card.updatedAt) && (
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-3">Information</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {card.createdAt && (
                      <div>
                        Added: {new Date(card.createdAt).toLocaleDateString()}
                      </div>
                    )}
                    {card.updatedAt && (
                      <div>
                        Updated: {new Date(card.updatedAt).toLocaleDateString()}
                      </div>
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