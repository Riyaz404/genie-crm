import { Badge } from '@/components/ui/badge'
import { Lead } from '@/lib/types'

interface LeadStatusBadgeProps {
  status: Lead['status']
}

const statusConfig: Record<Lead['status'], { color: string; label: string }> = {
  new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
  contacted: { color: 'bg-purple-100 text-purple-800', label: 'Contacted' },
  qualified: { color: 'bg-green-100 text-green-800', label: 'Qualified' },
  proposal: { color: 'bg-orange-100 text-orange-800', label: 'Proposal' },
  closed: { color: 'bg-emerald-100 text-emerald-800', label: 'Closed' },
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge className={`${config.color} capitalize`}>{config.label}</Badge>
}
