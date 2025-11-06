'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Camera, Search, Plus, BarChart3, Package, Star, Brain, Grid3X3, Edit3 } from 'lucide-react'
import { toast } from 'sonner'
import ScannerDialog from '@/components/scan/ScannerDialog'
import CreateCollectionDialog from '@/components/collection/CreateCollectionDialog'
import CardSearch from '@/components/search/CardSearch'
import YGOCardSearch from '@/components/search/YGOCardSearch'
import SyntheticDataGenerator from '@/components/synthetic/SyntheticDataGenerator'
import ScanHistory from '@/components/scan/ScanHistory'
import BatchCardScanner from '@/components/scan/BatchCardScanner'
import ManualCardInput from '@/components/cards/ManualCardInput'

interface Collection {
  id: string
  name: string
  description?: string
  _count: {
    cards: number
  }
}

interface CardStats {
  totalCards: number
  totalCollections: number
  recentScans: number
  rareCards: number
}

interface User {
  id: string
  email: string
  name?: string
}

export default function DuelVault() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [stats, setStats] = useState<CardStats>({
    totalCards: 0,
    totalCollections: 0,
    recentScans: 0,
    rareCards: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false)
  const [batchScannerOpen, setBatchScannerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('collections')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        // Initialize database and get default user
        const initResponse = await fetch('/api/init', { method: 'POST' })
        if (initResponse.ok) {
          const initData = await initResponse.json()
          setUser(initData.user)
        }

        // Load collections
        const collectionsResponse = await fetch('/api/collections')
        if (collectionsResponse.ok) {
          const collectionsData = await collectionsResponse.json()
          setCollections(collectionsData)
        }

        // Load stats
        const statsResponse = await fetch('/api/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } catch (error) {
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const refreshData = () => {
    // Don't set loading state to avoid page refresh effect
    fetch('/api/collections')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(collectionsData => setCollections(collectionsData))
      .catch(() => toast.error('Failed to refresh collections'))
    
    fetch('/api/stats')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(statsData => setStats(statsData))
      .catch(() => toast.error('Failed to refresh stats'))
  }

  const handleScanComplete = async (result: any) => {
    if (!user) {
      toast.error('User not initialized. Please refresh the page.')
      return
    }

    if (result.success && result.card) {
      // Don't show duplicate success message - scanner already shows it
      
      let targetCollection = collections[0]
      
      // Create default collection if none exists
      if (collections.length === 0) {
        try {
          const response = await fetch('/api/collections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: 'My Collection',
              description: 'Default collection for scanned cards',
              userId: user.id
            })
          })

          if (response.ok) {
            const newCollection = await response.json()
            targetCollection = newCollection
            toast.success('Created default collection "My Collection"')
          } else {
            toast.error('Failed to create default collection')
            refreshData()
            return
          }
        } catch (error) {
          console.error('Error creating default collection:', error)
          toast.error('Failed to create default collection')
          refreshData()
          return
        }
      }
      
      // Add card to collection
      try {
        const response = await fetch('/api/collections/add-card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            collectionId: targetCollection.id,
            cardId: result.card.id,
            userId: user.id
          })
        })

        if (response.ok) {
          toast.success(`Added "${result.card.name}" to ${targetCollection.name}`)
        } else {
          const error = await response.json()
          toast.error(`Failed to add card to collection: ${error.error}`)
        }
      } catch (error) {
        console.error('Error adding card to collection:', error)
        toast.error('Failed to add card to collection')
      }
      
      // Refresh data in background after a short delay to not interfere with scan results
      setTimeout(() => {
        refreshData()
      }, 1000)
    }
  }

  const handleScanCard = () => {
    setScannerOpen(true)
  }

  const handleAddCard = (card: any) => {
    toast.success(`Added "${card.name}" to collection`)
    // TODO: Implement actual add to collection logic
  }

  const handleCreateCollection = () => {
    if (!user) {
      toast.error('User not initialized. Please refresh the page.')
      return
    }
    setCreateCollectionOpen(true)
  }

  const handleBatchScan = () => {
    setBatchScannerOpen(true)
  }

  const handleManualEntry = () => {
    setActiveTab('manual')
  }

  const handleBatchComplete = (results: any) => {
    toast.success(`Batch scan complete! ${results.successfulScans}/${results.totalCards} cards identified.`)
    refreshData()
  }

  const handleManualCardSave = (card: any) => {
    // Add card to default collection logic similar to scan complete
    if (!user) {
      toast.error('User not initialized. Please refresh the page.')
      return
    }

    // This will be handled by the manual card input component
    // Just refresh the data to show the new card
    setTimeout(() => {
      refreshData()
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DuelVault...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10">
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">DV</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">DuelVault</h1>
                <p className="text-sm text-muted-foreground">Yu-Gi-Oh! Card Collection Manager</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleScanCard} className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Scan Card</span>
              </Button>
              <Button variant="outline" onClick={handleManualEntry} className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Manual Entry</span>
              </Button>
              <Button variant="outline" onClick={handleBatchScan} className="flex items-center space-x-2">
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Batch Scan</span>
              </Button>
              <Button variant="outline" onClick={handleCreateCollection}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Collection</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCards}</div>
              <p className="text-xs text-muted-foreground">Across all collections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCollections}</div>
              <p className="text-xs text-muted-foreground">Active collections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Scans</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentScans}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rare Cards</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rareCards}</div>
              <p className="text-xs text-muted-foreground">Super Rare+</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="recent">Recent Scans</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="search">Card Search</TabsTrigger>
            <TabsTrigger value="ygo-search">YGO Database</TabsTrigger>
            <TabsTrigger value="synthetic">AI Training</TabsTrigger>
          </TabsList>

          <TabsContent value="collections" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => (
                <Card key={collection.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {collection.name}
                      <Badge variant="secondary">{collection._count.cards} cards</Badge>
                    </CardTitle>
                    {collection.description && (
                      <CardDescription>{collection.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Last updated today</p>
                      <Button variant="ghost" size="sm">View →</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <ScanHistory 
              onCardSelect={handleAddCard}
              userId={user?.id}
            />
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <ManualCardInput 
              onCardSave={handleManualCardSave}
              userId={user?.id}
            />
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <CardSearch 
              showAddButton={true}
              onAddCard={handleAddCard}
              onCardSelect={(card) => toast.info(`Selected: ${card.name}`)}
            />
          </TabsContent>

          <TabsContent value="ygo-search" className="space-y-4">
            <YGOCardSearch />
          </TabsContent>

          <TabsContent value="synthetic" className="space-y-4">
            <SyntheticDataGenerator 
              onImagesGenerated={(images) => toast.success(`Generated ${images.length} synthetic training images`)}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Scanner Dialog */}
      <ScannerDialog 
        open={scannerOpen} 
        onOpenChange={setScannerOpen}
        onScanComplete={handleScanComplete}
        userId={user?.id}
      />
      
      {/* Batch Scanner Dialog */}
      <BatchCardScanner 
        open={batchScannerOpen} 
        onOpenChange={setBatchScannerOpen}
        onBatchComplete={handleBatchComplete}
        userId={user?.id}
      />
      
      {/* Create Collection Dialog */}
      <CreateCollectionDialog 
        open={createCollectionOpen} 
        onOpenChange={setCreateCollectionOpen}
        onCollectionCreated={refreshData}
        userId={user?.id}
      />
    </div>
  )
}