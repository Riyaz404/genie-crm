'use client'

import { useLeads } from '@/lib/leads-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, DollarSign, Target } from 'lucide-react'

export function DashboardStats() {
  const { leads } = useLeads()

  const stats = [
    {
      label: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Closed Deals',
      value: leads.filter((l) => l.status === 'closed').length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Pipeline Value',
      value: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        notation: 'compact',
        minimumFractionDigits: 1,
      }).format(leads.reduce((sum, l) => sum + l.value, 0)),
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Qualified Leads',
      value: leads.filter((l) => l.status === 'qualified' || l.status === 'proposal').length,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardDescription className="text-xs sm:text-sm font-medium">{stat.label}</CardDescription>
                <div className={`rounded-lg p-1.5 sm:p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold break-words">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
