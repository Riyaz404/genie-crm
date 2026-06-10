export interface Lead {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  property: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed'
  source: 'website' | 'referral' | 'cold-call' | 'social-media' | 'other'
  value: number
  notes: string
  createdAt: Date
  lastContactedAt?: Date
  assignedTo?: string
}

export interface Call {
  id: string
  leadId: string
  duration: number
  date: Date
  notes: string
  summary?: string
  outcome: 'positive' | 'neutral' | 'negative'
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'agent' | 'manager'
  leadsAssigned: number
}

export interface ImportResult {
  successful: number
  failed: number
  duplicates: number
  errors: string[]
}
