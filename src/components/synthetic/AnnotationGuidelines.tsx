'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, AlertTriangle, Info, BookOpen, Target, Eye } from 'lucide-react'

export default function AnnotationGuidelines() {
  return (
    <div className="space-y-6">
      {/* Research Context */}
      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          These annotation guidelines are based on best practices from TCG OCR research and the methodologies used in leading datasets like <strong>GotThatData/sports-cards</strong> and <strong>gabraken/mtg-detection</strong>.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="text-annotation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text-annotation">Text Annotation</TabsTrigger>
          <TabsTrigger value="card-detection">Card Detection</TabsTrigger>
          <TabsTrigger value="quality-control">Quality Control</TabsTrigger>
        </TabsList>

        <TabsContent value="text-annotation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Text Region Annotation Guidelines</span>
              </CardTitle>
              <CardDescription>
                Best practices for annotating text regions on Yu-Gi-Oh! cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Required Text Regions</span>
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Card Name (title area)</li>
                    <li>• Effect Text (description box)</li>
                    <li>• ATK/DEF Values (for monsters)</li>
                    <li>• Level/Rank Stars</li>
                    <li>• Attribute Symbols</li>
                    <li>• Set Codes/Collector Numbers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span>Annotation Standards</span>
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Use tight bounding boxes</li>
                    <li>• Include all visible text characters</li>
                    <li>• Preserve original text case</li>
                    <li>• Include special symbols and punctuation</li>
                    <li>• Transcribe text exactly as written</li>
                    <li>• Note text orientation (horizontal/vertical)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Text Quality Classification</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">High - Clear, readable text</Badge>
                  <Badge variant="secondary">Medium - Slightly blurred or small</Badge>
                  <Badge variant="destructive">Low - Poor quality or obscured</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="card-detection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Card Detection Annotation Guidelines</span>
              </CardTitle>
              <CardDescription>
                Guidelines for annotating card boundaries and corners, inspired by gabraken/mtg-detection methodology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Corner Annotation Format</h4>
                  <div className="text-sm space-y-2 bg-muted p-3 rounded">
                    <p><strong>Each corner requires:</strong></p>
                    <ul className="space-y-1">
                      <li>• X, Y coordinates (relative or absolute)</li>
                      <li>• Visibility status (true/false)</li>
                      <li>• Angle to next corner</li>
                      <li>• Corner identifier (TL, TR, BR, BL)</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Detection Scenarios</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Full card visible (4 corners)</li>
                    <li>• Partially occluded (2-3 corners)</li>
                    <li>• Edge cases (1 corner visible)</li>
                    <li>• Multiple cards in frame</li>
                    <li>• Cards at various angles</li>
                    <li>• Different lighting conditions</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Quality Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded">
                    <p className="font-medium text-green-700 dark:text-green-300">Excellent</p>
                    <p>All 4 corners visible, clear boundaries</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                    <p className="font-medium text-yellow-700 dark:text-yellow-300">Acceptable</p>
                    <p>2-3 corners visible, partial occlusion</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded">
                    <p className="font-medium text-red-700 dark:text-red-300">Poor</p>
                    <p>1 corner visible, heavily obscured</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality-control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Quality Control & Validation</span>
              </CardTitle>
              <CardDescription>
                Ensuring annotation consistency and accuracy across the dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Validation Checklist</h4>
                  <ul className="text-sm space-y-1">
                    <li>✓ Text transcription matches card exactly</li>
                    <li>✓ Bounding boxes tightly fit text regions</li>
                    <li>✓ All required regions are annotated</li>
                    <li>✓ Corner coordinates are accurate</li>
                    <li>✓ Quality scores are consistent</li>
                    <li>✓ No duplicate or missing annotations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Common Issues to Avoid</h4>
                  <ul className="text-sm space-y-1">
                    <li>⚠️ Including background in text boxes</li>
                    <li>⚠️ Missing special characters or symbols</li>
                    <li>⚠️ Incorrect corner ordering</li>
                    <li>⚠️ Inconsistent text formatting</li>
                    <li>⚠️ Ignoring partially visible text</li>
                    <li>⚠️ Inaccurate quality assessments</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Review Process</h4>
                <div className="text-sm space-y-2 bg-muted p-3 rounded">
                  <p><strong>Multi-stage validation approach:</strong></p>
                  <ol className="space-y-1">
                    <li>1. Initial annotation by trained annotator</li>
                    <li>2. Automated validation checks (format, completeness)</li>
                    <li>3. Peer review for accuracy and consistency</li>
                    <li>4. Expert validation for edge cases</li>
                    <li>5. Final quality assurance before dataset inclusion</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}