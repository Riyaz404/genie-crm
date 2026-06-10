'use client'

import { LeadsProvider } from '@/lib/leads-context'
import { DashboardStats } from '@/components/dashboard-stats'
import { LeadsTable } from '@/components/leads-table'
import { AddLeadDialog } from '@/components/add-lead-dialog'
import { ImportLeadsDialog } from '@/components/import-leads-dialog'
import { LogoutButton } from '@/components/logout-button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

function DashboardContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">Dashboard</h1>
              <p className="mt-1 hidden sm:block text-sm text-muted-foreground">Manage your real estate leads and sales pipeline</p>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-4">
              <AddLeadDialog />
              <ImportLeadsDialog />
              <div className="border-l pl-2 lg:pl-4">
                <LogoutButton />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-muted"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 flex flex-col gap-3 border-t pt-4">
              <AddLeadDialog fullWidth />
              <ImportLeadsDialog fullWidth />
              <LogoutButton fullWidth />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="space-y-6 sm:space-y-8">
          <DashboardStats />
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">All Leads</h2>
            <LeadsTable />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <LeadsProvider>
      <DashboardContent />
    </LeadsProvider>
  )
}
