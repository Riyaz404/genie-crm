'use client'

import { LeadsProvider } from '@/lib/leads-context'
import { CustomerProfile } from '@/components/customer-profile'
import { useParams } from 'next/navigation'

export default function CustomerPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <LeadsProvider>
      <CustomerProfile leadId={id} />
    </LeadsProvider>
  )
}
