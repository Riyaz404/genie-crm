'use client'

import { useState } from 'react'
import { useLeads } from '@/lib/leads-context'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { LeadStatusBadge } from './lead-status-badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function LeadsTable() {
  const { leads, deleteLead, teamMembers } = useLeads()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getTeamMemberName = (memberId?: string) => {
    return teamMembers.find((m) => m.id === memberId)?.name || 'Unassigned'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Search Leads</label>
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-40">
          <label className="mb-1 block text-sm font-medium">Status</label>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (value) setStatusFilter(value)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-40">
          <label className="mb-1 block text-sm font-medium">Source</label>
          <Select
            value={sourceFilter}
            onValueChange={(value) => {
              if (value) setSourceFilter(value)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="cold-call">Cold Call</SelectItem>
              <SelectItem value="social-media">Social Media</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="w-12 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-muted/50">
                <TableCell>
                  <Link href={`/customer/${lead.id}`} className="font-medium text-primary hover:underline">
                    {lead.firstName} {lead.lastName}
                  </Link>
                </TableCell>
                <TableCell className="text-sm font-medium">{lead.phone}</TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-sm">{lead.property}</TableCell>
                <TableCell className="font-medium">{formatCurrency(lead.value)}</TableCell>
                <TableCell className="text-sm">{getTeamMemberName(lead.assignedTo)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await deleteLead(lead.id)
                      } catch (error) {
                        console.error('Failed to delete lead:', error)
                        alert('Failed to delete lead')
                      }
                    }}
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {filteredLeads.map((lead) => (
          <Link key={lead.id} href={`/customer/${lead.id}`} className="block">
            <div className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-medium text-foreground">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{lead.phone}</p>
                </div>
                <LeadStatusBadge status={lead.status} />
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">{lead.property}</p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium">{formatCurrency(lead.value)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async (e) => {
                      e.preventDefault()
                      try {
                        await deleteLead(lead.id)
                      } catch (error) {
                        console.error('Failed to delete lead:', error)
                        alert('Failed to delete lead')
                      }
                    }}
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No leads found matching your filters.</p>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Showing {filteredLeads.length} of {leads.length} leads
      </div>
    </div>
  )
}
