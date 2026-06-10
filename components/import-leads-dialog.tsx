'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useLeads } from '@/lib/leads-context'
import { Lead } from '@/lib/types'
import Papa from 'papaparse'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'

interface CSVRow {
  [key: string]: string
}

export function ImportLeadsDialog({ fullWidth }: { fullWidth?: boolean }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<'upload' | 'mapping' | 'result'>('upload')
  const [csvData, setCSVData] = useState<CSVRow[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [importResult, setImportResult] = useState<{ successful: number; duplicates: number } | null>(null)
  const { addLeads } = useLeads()

  const requiredFields = ['firstName', 'lastName', 'phone', 'property', 'value']
  const csvColumns = csvData.length > 0 ? Object.keys(csvData[0]) : []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCSVData(results.data as CSVRow[])
          // Auto-map columns with matching names
          const autoMapping: Record<string, string> = {}
          requiredFields.forEach((field) => {
            const matchingColumn = (results.data as CSVRow[]).length > 0
              ? Object.keys((results.data as CSVRow[])[0]).find(
                  (col) => col.toLowerCase() === field.toLowerCase()
                )
              : undefined
            if (matchingColumn) {
              autoMapping[field] = matchingColumn
            }
          })
          setColumnMapping(autoMapping)
        },
      })
    }
  }

  const handleMapping = (field: string, column: string) => {
    setColumnMapping({ ...columnMapping, [field]: column })
  }

  const handleImport = async () => {
    const newLeads: Lead[] = []

    for (const row of csvData) {
      const firstName = row[columnMapping.firstName] || 'Unknown'
      const lastName = row[columnMapping.lastName] || 'Lead'
      const phone = row[columnMapping.phone]

      if (!phone) continue

      newLeads.push({
        id: crypto.randomUUID(),
        firstName,
        lastName,
        phone,
        property: row[columnMapping.property] || 'Not Specified',
        status: 'new',
        source: 'website',
        value: parseInt(row[columnMapping.value], 10) || 0,
        notes: row[columnMapping.notes] || '',
        createdAt: new Date(),
      })
    }

    try {
      const result = await addLeads(newLeads)
      setImportResult(result)
      setStep('result')
    } catch (error) {
      console.error('Failed to import leads:', error)
      alert('Failed to import leads')
    }
  }

  const handleReset = () => {
    setFile(null)
    setStep('upload')
    setCSVData([])
    setColumnMapping({})
    setImportResult(null)
    setOpen(false)
  }

  const mappingComplete = requiredFields.every((field) => columnMapping[field])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className={`gap-2 ${fullWidth ? 'w-full' : ''}`}>
            <Upload className="h-4 w-4" />
            Import Leads
          </Button>
        }
      />
      <DialogContent className="max-w-2xl w-11/12 sm:w-full">
        <DialogHeader>
          <DialogTitle>Import Leads from Excel/CSV</DialogTitle>
          <DialogDescription>Upload a file and map columns to your lead data</DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed p-8 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">CSV or Excel files</p>
              </label>
            </div>
            {file && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                ✓ File selected: {file.name} ({csvData.length} rows)
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={() => setStep('mapping')}
                disabled={!file || csvData.length === 0}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Next: Map Columns
              </Button>
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Map your CSV columns to lead fields:</p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {requiredFields.map((field) => (
                <div key={field} className="grid grid-cols-2 gap-2">
                  <label className="flex items-center text-sm font-medium capitalize">{field}</label>
                  <select
                    value={columnMapping[field] || ''}
                    onChange={(e) => handleMapping(field, e.target.value)}
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select column...</option>
                    {csvColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              Preview: {csvData.length} leads ready to import
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={!mappingComplete}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Import Leads
              </Button>
            </div>
          </div>
        )}

        {step === 'result' && importResult && (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Import successful!</p>
                  <p className="mt-1 text-sm text-green-800">
                    {importResult.successful} leads imported
                    {importResult.duplicates > 0 && ` (${importResult.duplicates} duplicates skipped)`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleReset} className="flex-1 bg-primary hover:bg-primary/90">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
