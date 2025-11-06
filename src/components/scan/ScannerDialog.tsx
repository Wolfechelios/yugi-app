'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import EnhancedCardScanner from '@/components/scan/EnhancedCardScanner'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'

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
}

interface ScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanComplete?: (result: ScanResult) => void
  userId?: string
}

export default function ScannerDialog({ open, onOpenChange, onScanComplete, userId }: ScannerDialogProps) {
  const handleScanComplete = (result: ScanResult) => {
    // Call parent callback first
    onScanComplete?.(result)
    
    // Don't auto-close - let user review the results and close manually
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Scan Yu-Gi-Oh! Card</span>
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogHeader>
        <EnhancedCardScanner 
          onScanComplete={handleScanComplete}
          onClose={() => onOpenChange(false)}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  )
}