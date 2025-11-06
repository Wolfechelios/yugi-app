/**
 * PriceCharting API Integration Service
 * Provides real-time pricing data for trading cards
 */

export interface PriceChartingCard {
  id: string
  name: string
  set: string
  number: string
  rarity: string
  condition: string
  price: number
  marketPrice: number
  ungradedPrice: number
  gradedPrice: number
  lastUpdated: string
  imageUrl?: string
  productUrl: string
}

export interface PriceHistory {
  date: string
  price: number
  marketPrice: number
}

export interface PriceChartingResponse {
  success: boolean
  data?: PriceChartingCard
  priceHistory?: PriceHistory[]
  error?: string
}

class PriceChartingService {
  private readonly baseUrl = 'https://www.pricecharting.com/api'
  private readonly apiKey = process.env.PRICECHARTING_API_KEY

  /**
   * Search for a card by name and optional set information
   */
  async searchCard(cardName: string, setName?: string): Promise<PriceChartingResponse> {
    try {
      // Build search query
      const query = new URLSearchParams({
        q: cardName,
        type: 'card',
        ...(setName && { set: setName })
      })

      const response = await fetch(`${this.baseUrl}/search?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`PriceCharting API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        // Return the first match
        const card = this.transformPriceChartingCard(data.results[0])
        return {
          success: true,
          data: card
        }
      }

      return {
        success: false,
        error: 'Card not found'
      }

    } catch (error) {
      console.error('PriceCharting search error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search card'
      }
    }
  }

  /**
   * Get detailed price information for a specific card
   */
  async getCardPrice(cardId: string): Promise<PriceChartingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/product/${cardId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`PriceCharting API error: ${response.status}`)
      }

      const data = await response.json()
      const card = this.transformPriceChartingCard(data)

      return {
        success: true,
        data: card
      }

    } catch (error) {
      console.error('PriceCharting price lookup error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get card price'
      }
    }
  }

  /**
   * Get price history for a card
   */
  async getPriceHistory(cardId: string, days: number = 30): Promise<PriceChartingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/product/${cardId}/history?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`PriceCharting API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        priceHistory: data.history || []
      }

    } catch (error) {
      console.error('PriceCharting history error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get price history'
      }
    }
  }

  /**
   * Simulate price lookup (for demo purposes when API is not available)
   */
  async simulatePriceLookup(cardName: string): Promise<PriceChartingResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate realistic mock data based on card name patterns
    const basePrice = Math.floor(Math.random() * 50) + 5
    const marketPrice = basePrice + Math.floor(Math.random() * 20) - 10
    const ungradedPrice = marketPrice * 0.7
    const gradedPrice = marketPrice * 1.5

    const mockCard: PriceChartingCard = {
      id: `mock-${Date.now()}`,
      name: cardName,
      set: this.generateMockSetName(cardName),
      number: `${Math.floor(Math.random() * 100) + 1}`,
      rarity: this.generateMockRarity(),
      condition: 'Near Mint',
      price: basePrice,
      marketPrice,
      ungradedPrice,
      gradedPrice,
      lastUpdated: new Date().toISOString(),
      productUrl: `https://www.pricecharting.com/card/yugioh/${cardName.toLowerCase().replace(/\s+/g, '-')}`
    }

    return {
      success: true,
      data: mockCard
    }
  }

  /**
   * Transform PriceCharting API response to our format
   */
  private transformPriceChartingCard(apiData: any): PriceChartingCard {
    return {
      id: apiData.id || apiData.product_id,
      name: apiData.name || apiData.product_name,
      set: apiData.set_name || apiData.set,
      number: apiData.number || apiData.card_number,
      rarity: apiData.rarity || 'Common',
      condition: apiData.condition || 'Near Mint',
      price: parseFloat(apiData.price || apiData.sold_price || 0),
      marketPrice: parseFloat(apiData.market_price || 0),
      ungradedPrice: parseFloat(apiData.ungraded_price || 0),
      gradedPrice: parseFloat(apiData.graded_price || 0),
      lastUpdated: apiData.last_updated || new Date().toISOString(),
      imageUrl: apiData.image_url,
      productUrl: apiData.url || apiData.product_url
    }
  }

  /**
   * Generate mock set name based on card patterns
   */
  private generateMockSetName(cardName: string): string {
    const sets = [
      'Dark Magician Girl',
      'Blue-Eyes White Dragon',
      'Elemental HERO',
      'Number',
      'Supreme King',
      'Pendulum Evolution',
      'Duelist Alliance',
      'Legendary Collection',
      'Structure Deck',
      'Tournament Pack'
    ]
    
    // Try to match card name to a set
    for (const set of sets) {
      if (cardName.toLowerCase().includes(set.toLowerCase())) {
        return set
      }
    }
    
    return sets[Math.floor(Math.random() * sets.length)]
  }

  /**
   * Generate mock rarity
   */
  private generateMockRarity(): string {
    const rarities = ['Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Secret Rare', 'Parallel Rare']
    const weights = [0.4, 0.25, 0.2, 0.1, 0.04, 0.01] // Probability weights
    
    const random = Math.random()
    let cumulative = 0
    
    for (let i = 0; i < rarities.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return rarities[i]
      }
    }
    
    return 'Common'
  }
}

// Export singleton instance
export const priceChartingService = new PriceChartingService()

// Export convenience functions
export const searchCardPrice = (cardName: string, setName?: string) => 
  priceChartingService.searchCard(cardName, setName)

export const getCardPrice = (cardId: string) => 
  priceChartingService.getCardPrice(cardId)

export const getPriceHistory = (cardId: string, days?: number) => 
  priceChartingService.getPriceHistory(cardId, days)

export const simulatePriceLookup = (cardName: string) => 
  priceChartingService.simulatePriceLookup(cardName)