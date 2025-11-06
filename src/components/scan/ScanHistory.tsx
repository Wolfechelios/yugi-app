'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Camera, Search, Filter, Eye, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface ScanHistoryItem {
  id: string
  status: 'pending' | 'identified' | 'failed'
  confidence?: number
  createdAt: string
  card?: {
    id: string
    name: string
    type: string
    attribute?: string
    level?: number
    attack?: number
    defense?: number
    rarity: string
  }
  ocrText?: string
  imageUrl: string
}

interface ScanHistoryProps {
  onCardSelect?: (card: any) => void
  userId?: string
}

export default function ScanHistory({ onCardSelect, userId }: ScanHistoryProps) {
  const [scans, setScans] = useState<ScanHistoryItem[]>([])
  const [filteredScans, setFilteredScans] = useState<ScanHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedScan, setSelectedScan] = useState<ScanHistoryItem | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [retryingScan, setRetryingScan] = useState<string | null>(null)

  useEffect(() => {
    loadScanHistory()
  }, [])

  useEffect(() => {
    filterScans()
  }, [scans, searchTerm, statusFilter])

  const loadScanHistory = async () => {
    setIsLoading(true)
    try {
      if (!userId) {
        toast.error('User not authenticated')
        return
      }
      
      const response = await fetch(`/api/scans/history?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setScans(data)
      } else {
        toast.error('Failed to load scan history')
      }
    } catch (error) {
      console.error('Error loading scan history:', error)
      toast.error('Failed to load scan history')
    } finally {
      setIsLoading(false)
    }
  }

  const filterScans = () => {
    let filtered = scans

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(scan => scan.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(scan => 
        scan.card?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.card?.type?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredScans(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'identified':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      identified: 'default',
      failed: 'destructive',
      pending: 'secondary'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return 'Invalid date'
    }
  }

  const handleScanClick = (scan: ScanHistoryItem) => {
    setSelectedScan(scan)
    setDetailsOpen(true)
  }

  const handleAddToCollection = (card: any) => {
    if (onCardSelect) {
      onCardSelect(card)
      setDetailsOpen(false)
    } else {
      toast.info('Add to collection feature coming soon!')
    }
  }

  const parseOCRAnalysis = (ocrText?: string) => {
    if (!ocrText) return null
    try {
      return JSON.parse(ocrText)
    } catch {
      return null
    }
  }

  const handleRetryScan = async (scanId: string) => {
    if (!userId) {
      toast.error('User not authenticated')
      return
    }

    setRetryingScan(scanId)
    try {
      const response = await fetch('/api/scan/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scanId,
          userId
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Scan retry completed successfully!')
        // Update the scan in the local state
        setScans(prevScans => 
          prevScans.map(scan => 
            scan.id === scanId 
              ? { ...scan, ...result.updatedScan }
              : scan
          )
        )
        
        // If we have the details dialog open, update the selected scan
        if (selectedScan?.id === scanId) {
          setSelectedScan(prev => prev ? { ...prev, ...result.updatedScan } : null)
        }
      } else {
        toast.error(result.error || 'Failed to retry scan')
      }
    } catch (error) {
      console.error('Error retrying scan:', error)
      toast.error('Failed to retry scan')
    } finally {
      setRetryingScan(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Scan History</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            View and manage your card scanning history
          </p>
        </div>
        <Button variant="outline" onClick={loadScanHistory}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by card name or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading scan history...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredScans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {scans.length === 0 
                ? "No scans yet. Start by scanning your first card!" 
                : "No scans match your filters."
              }
            </p>
            {scans.length === 0 && (
              <Button onClick={() => window.location.reload()}>
                <Camera className="w-4 h-4 mr-2" />
                Scan Your First Card
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScans.map((scan) => (
            <Card 
              key={scan.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleScanClick(scan)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(scan.status)}
                    {getStatusBadge(scan.status)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(scan.createdAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {scan.card ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{scan.card.name}</h4>
                      <Badge 
                        className={`${getRarityColor(scan.card.rarity)} text-white text-xs`}
                      >
                        {scan.card.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{scan.card.type}</p>
                    {scan.confidence && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Confidence</span>
                          <span>{Math.round(scan.confidence * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${scan.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">
                      {scan.status === 'failed' ? 'Card not identified' : 'Processing...'}
                    </p>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>View details</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {(scan.status === 'failed' || scan.status === 'pending') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRetryScan(scan.id)
                        }}
                        disabled={retryingScan === scan.id}
                        className="text-xs"
                      >
                        {retryingScan === scan.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            Retrying...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry
                          </>
                        )}
                      </Button>
                    )}
                    {scan.card && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCollection(scan.card)
                        }}
                      >
                        Add to Collection
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scan Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Scan Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedScan && (
            <div className="space-y-6">
              {/* Scan Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Scanned Image</h4>
                  <img
                    src={selectedScan.imageUrl}
                    alt="Scanned card"
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Scan Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(selectedScan.status)}
                          {getStatusBadge(selectedScan.status)}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{formatDate(selectedScan.createdAt)}</span>
                      </div>
                      {selectedScan.confidence && (
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span>{Math.round(selectedScan.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedScan.card && (
                    <div>
                      <h4 className="font-medium mb-2">Card Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{selectedScan.card.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span>{selectedScan.card.type}</span>
                        </div>
                        {selectedScan.card.attribute && (
                          <div className="flex justify-between">
                            <span>Attribute:</span>
                            <span>{selectedScan.card.attribute}</span>
                          </div>
                        )}
                        {selectedScan.card.level && (
                          <div className="flex justify-between">
                            <span>Level:</span>
                            <span>{selectedScan.card.level}</span>
                          </div>
                        )}
                        {selectedScan.card.attack !== undefined && (
                          <div className="flex justify-between">
                            <span>ATK:</span>
                            <span>{selectedScan.card.attack}</span>
                          </div>
                        )}
                        {selectedScan.card.defense !== undefined && (
                          <div className="flex justify-between">
                            <span>DEF:</span>
                            <span>{selectedScan.card.defense}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Rarity:</span>
                          <Badge className={`${getRarityColor(selectedScan.card.rarity)} text-white`}>
                            {selectedScan.card.rarity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* OCR Analysis */}
              {selectedScan.ocrText && (
                <div>
                  <h4 className="font-medium mb-2">OCR Analysis</h4>
                  <Card>
                    <CardContent className="pt-4">
                      {(() => {
                        const ocrAnalysis = parseOCRAnalysis(selectedScan.ocrText)
                        if (ocrAnalysis) {
                          return (
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Overall Confidence:</span>
                                  <span className="text-sm">{ocrAnalysis.confidence}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${ocrAnalysis.confidence}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              {ocrAnalysis.verification && (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Card Name Match:</span>
                                    <span className={`ml-2 ${ocrAnalysis.verification.cardNameMatch ? 'text-green-600' : 'text-red-600'}`}>
                                      {ocrAnalysis.verification.cardNameMatch ? '✓ Yes' : '✗ No'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Text Quality:</span>
                                    <span className={`ml-2 capitalize ${
                                      ocrAnalysis.verification.textQuality === 'high' ? 'text-green-600' :
                                      ocrAnalysis.verification.textQuality === 'medium' ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                      {ocrAnalysis.verification.textQuality}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {ocrAnalysis.regions && ocrAnalysis.regions.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium mb-2">Text Regions:</h5>
                                  <div className="space-y-2">
                                    {ocrAnalysis.regions.map((region: any, index: number) => (
                                      <div key={index} className="border rounded p-2 text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="font-medium capitalize">{region.type}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {region.confidence}% confidence
                                          </span>
                                        </div>
                                        <p className="text-muted-foreground italic">"{region.text}"</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        } else {
                          return (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Raw OCR Text:</p>
                              <p className="text-sm text-muted-foreground italic bg-muted p-3 rounded">
                                {selectedScan.ocrText}
                              </p>
                            </div>
                          )
                        }
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                {(selectedScan.status === 'failed' || selectedScan.status === 'pending') && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleRetryScan(selectedScan.id)}
                    disabled={retryingScan === selectedScan.id}
                  >
                    {retryingScan === selectedScan.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry Scan
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                {selectedScan.card && (
                  <Button onClick={() => handleAddToCollection(selectedScan.card)}>
                    Add to Collection
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}