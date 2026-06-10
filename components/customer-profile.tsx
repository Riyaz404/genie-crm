'use client'

import { useLeads } from '@/lib/leads-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Lead, Call } from '@/lib/types'
import { ArrowLeft, Phone, MapPin, DollarSign, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { LeadStatusBadge } from './lead-status-badge'

interface CustomerProfileProps {
  leadId: string
}

export function CustomerProfile({ leadId }: CustomerProfileProps) {
  const { getLeadById, updateLead, getLeadCalls, addCall, teamMembers } = useLeads()
  const lead = getLeadById(leadId)
  const calls = getLeadCalls(leadId)

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(lead)
  const [showNewCall, setShowNewCall] = useState(false)
  const [newCallData, setNewCallData] = useState({
    duration: '',
    notes: '',
    outcome: 'positive' as const,
  })

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Lead not found</h2>
          <Link href="/" className="text-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const handleSaveChanges = async () => {
    if (editData) {
      try {
        await updateLead(leadId, editData)
        setIsEditing(false)
      } catch (error) {
        console.error('Failed to update lead:', error)
        alert('Failed to save changes')
      }
    }
  }

  const handleAddCall = async () => {
    const call: Call = {
      id: crypto.randomUUID(),
      leadId,
      duration: parseInt(newCallData.duration, 10) || 0,
      date: new Date(),
      notes: newCallData.notes,
      outcome: newCallData.outcome,
      summary: '',
    }

    try {
      await addCall(call)
      setNewCallData({ duration: '', notes: '', outcome: 'positive' })
      setShowNewCall(false)
    } catch (error) {
      console.error('Failed to add call:', error)
      alert('Failed to log call')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTeamMemberName = (memberId?: string) => {
    return teamMembers.find((m) => m.id === memberId)?.name || 'Unassigned'
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {lead.firstName} {lead.lastName}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <LeadStatusBadge status={lead.status} />
                <span className="text-sm text-muted-foreground">{lead.source}</span>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Contact Info Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{lead.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Property Interest</p>
                  <p className="text-sm font-medium">{lead.property}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Deal Value</p>
                  <p className="text-sm font-medium">{formatCurrency(lead.value)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Details Card */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lead Details</CardTitle>
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditData(lead)
                      setIsEditing(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && editData ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value as Lead['status'] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Assigned To</Label>
                      <Select
                        value={editData.assignedTo || ''}
                        onValueChange={(value) => {
                          if (value) setEditData({ ...editData, assignedTo: value })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      className="min-h-24"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium capitalize">{lead.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned To</p>
                      <p className="text-sm font-medium">{getTeamMemberName(lead.assignedTo)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">{formatDate(lead.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Contacted</p>
                      <p className="text-sm font-medium">
                        {lead.lastContactedAt ? formatDate(lead.lastContactedAt) : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm bg-muted p-3 rounded-md">{lead.notes || 'No notes yet'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call History */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Call History</CardTitle>
              <CardDescription>{calls.length} calls recorded</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowNewCall(!showNewCall)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Log Call
            </Button>
          </CardHeader>
          <CardContent>
            {showNewCall && (
              <div className="mb-6 p-4 border rounded-lg bg-muted/20 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={newCallData.duration}
                      onChange={(e) => setNewCallData({ ...newCallData, duration: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outcome">Outcome</Label>
                    <Select value={newCallData.outcome} onValueChange={(value) => setNewCallData({ ...newCallData, outcome: value as any })}>
                      <SelectTrigger id="outcome">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Call Notes</Label>
                  <Textarea
                    id="notes"
                    value={newCallData.notes}
                    onChange={(e) => setNewCallData({ ...newCallData, notes: e.target.value })}
                    placeholder="What was discussed..."
                    className="min-h-20"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddCall} className="flex-1 bg-primary hover:bg-primary/90">
                    Save Call
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewCall(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {calls.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No calls logged yet</p>
              ) : (
                calls
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((call) => (
                    <div key={call.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="font-medium">{call.duration} minutes</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            call.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                            call.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {call.outcome}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(call.date)}</span>
                      </div>
                      {call.notes && <p className="text-sm text-muted-foreground">{call.notes}</p>}
                      {call.summary && (
                        <div className="bg-blue-50 p-3 rounded text-sm text-blue-900">
                          <strong>AI Summary:</strong> {call.summary}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
