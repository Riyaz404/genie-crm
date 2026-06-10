import { Call, Lead } from './types'

export interface LeadRow {
  id: string
  first_name: string
  last_name: string
  phone: string
  email?: string | null
  property: string
  status: Lead['status']
  source: Lead['source']
  value: number
  notes: string
  created_at: string
  last_contacted_at?: string | null
  assigned_to?: string | null
}

export interface CallRow {
  id: string
  lead_id: string
  duration: number
  date: string
  notes: string
  summary?: string | null
  outcome: Call['outcome']
}

function toDate(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined
  return value instanceof Date ? value : new Date(value)
}

function toIsoString(value: Date | string | undefined): string | undefined {
  if (!value) return undefined
  return value instanceof Date ? value.toISOString() : value
}

export function mapLeadRowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email ?? undefined,
    property: row.property,
    status: row.status,
    source: row.source,
    value: row.value,
    notes: row.notes ?? '',
    createdAt: new Date(row.created_at),
    lastContactedAt: toDate(row.last_contacted_at),
    assignedTo: row.assigned_to ?? undefined,
  }
}

export function mapLeadToRow(lead: Lead): LeadRow {
  return {
    id: lead.id,
    first_name: lead.firstName,
    last_name: lead.lastName,
    phone: lead.phone,
    email: lead.email ?? null,
    property: lead.property,
    status: lead.status,
    source: lead.source,
    value: lead.value,
    notes: lead.notes,
    created_at: toIsoString(lead.createdAt) ?? new Date().toISOString(),
    last_contacted_at: toIsoString(lead.lastContactedAt) ?? null,
    assigned_to: lead.assignedTo ?? null,
  }
}

export function mapLeadUpdatesToRow(updates: Partial<Lead>): Partial<LeadRow> {
  const row: Partial<LeadRow> = {}

  if (updates.firstName !== undefined) row.first_name = updates.firstName
  if (updates.lastName !== undefined) row.last_name = updates.lastName
  if (updates.phone !== undefined) row.phone = updates.phone
  if (updates.email !== undefined) row.email = updates.email ?? null
  if (updates.property !== undefined) row.property = updates.property
  if (updates.status !== undefined) row.status = updates.status
  if (updates.source !== undefined) row.source = updates.source
  if (updates.value !== undefined) row.value = updates.value
  if (updates.notes !== undefined) row.notes = updates.notes
  if (updates.createdAt !== undefined) row.created_at = toIsoString(updates.createdAt)
  if (updates.lastContactedAt !== undefined) {
    row.last_contacted_at = toIsoString(updates.lastContactedAt) ?? null
  }
  if (updates.assignedTo !== undefined) row.assigned_to = updates.assignedTo ?? null

  return row
}

export function mapCallRowToCall(row: CallRow): Call {
  return {
    id: row.id,
    leadId: row.lead_id,
    duration: row.duration,
    date: new Date(row.date),
    notes: row.notes ?? '',
    summary: row.summary ?? undefined,
    outcome: row.outcome,
  }
}

export function mapCallToRow(call: Call): CallRow {
  return {
    id: call.id,
    lead_id: call.leadId,
    duration: call.duration,
    date: toIsoString(call.date) ?? new Date().toISOString(),
    notes: call.notes,
    summary: call.summary ?? null,
    outcome: call.outcome,
  }
}
