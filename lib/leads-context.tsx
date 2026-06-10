'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react'

import { supabase } from './supabase'
import { Lead, Call, TeamMember } from './types'
import { mockTeamMembers } from './mock-data'
import {
  mapCallRowToCall,
  mapCallToRow,
  mapLeadRowToLead,
  mapLeadToRow,
  mapLeadUpdatesToRow,
} from './db-mappers'

interface LeadsContextType {
  leads: Lead[]
  calls: Call[]
  teamMembers: TeamMember[]
  isLoading: boolean

  addLead: (lead: Lead) => Promise<void>
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  addLeads: (leads: Lead[]) => Promise<{
    successful: number
    duplicates: number
  }>
  addCall: (call: Call) => Promise<void>

  getLeadCalls: (leadId: string) => Call[]
  getLeadById: (id: string) => Lead | undefined
  getTeamMemberLeads: (memberId: string) => Lead[]
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [calls, setCalls] = useState<Call[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })

        if (leadsError) {
          console.error('Failed to load leads:', leadsError)
        } else if (isMounted && leadsData) {
          setLeads(leadsData.map(mapLeadRowToLead))
        }

        const { data: callsData, error: callsError } = await supabase
          .from('call_logs')
          .select('*')
          .order('date', { ascending: false })

        if (callsError) {
          console.error('Failed to load call logs:', callsError)
        } else if (isMounted && callsData) {
          setCalls(callsData.map(mapCallRowToCall))
        }
      } catch (error) {
        console.error('Failed to load CRM data:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  const addLead = useCallback(async (lead: Lead) => {
    const leadWithId: Lead = {
      ...lead,
      id: lead.id || crypto.randomUUID(),
    }

    const { data, error } = await supabase
      .from('leads')
      .insert(mapLeadToRow(leadWithId))
      .select()
      .single()

    if (error) {
      console.error('Add lead error:', error)
      throw error
    }

    if (data) {
      setLeads((prev) => [mapLeadRowToLead(data), ...prev])
    }
  }, [])

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    const rowUpdates = mapLeadUpdatesToRow(updates)

    const { data, error } = await supabase
      .from('leads')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update lead error:', error)
      throw error
    }

    if (data) {
      const updatedLead = mapLeadRowToLead(data)
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? updatedLead : lead))
      )
    }
  }, [])

  const deleteLead = useCallback(async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id)

    if (error) {
      console.error('Delete lead error:', error)
      throw error
    }

    setLeads((prev) => prev.filter((lead) => lead.id !== id))
    setCalls((prev) => prev.filter((call) => call.leadId !== id))
  }, [])

  const addLeads = useCallback(
    async (newLeads: Lead[]) => {
      let duplicates = 0

      const phoneSet = new Set(leads.map((lead) => lead.phone))

      const filteredLeads = newLeads
        .filter((lead) => {
          if (phoneSet.has(lead.phone)) {
            duplicates++
            return false
          }

          phoneSet.add(lead.phone)
          return true
        })
        .map((lead) => ({
          ...lead,
          id: lead.id || crypto.randomUUID(),
        }))

      if (filteredLeads.length === 0) {
        return { successful: 0, duplicates }
      }

      const { data, error } = await supabase
        .from('leads')
        .insert(filteredLeads.map(mapLeadToRow))
        .select()

      if (error) {
        console.error('Bulk add leads error:', error)
        throw error
      }

      if (data) {
        const mappedLeads = data.map(mapLeadRowToLead)
        setLeads((prev) => [...mappedLeads, ...prev])
      }

      return {
        successful: filteredLeads.length,
        duplicates,
      }
    },
    [leads]
  )

  const addCall = useCallback(async (call: Call) => {
    const callWithId: Call = {
      ...call,
      id: call.id || crypto.randomUUID(),
    }

    const { data, error } = await supabase
      .from('call_logs')
      .insert(mapCallToRow(callWithId))
      .select()
      .single()

    if (error) {
      console.error('Add call error:', error)
      throw error
    }

    if (data) {
      setCalls((prev) => [mapCallRowToCall(data), ...prev])
    }
  }, [])

  const getLeadCalls = useCallback(
    (leadId: string) => {
      return calls.filter((call) => call.leadId === leadId)
    },
    [calls]
  )

  const getLeadById = useCallback(
    (id: string) => {
      return leads.find((lead) => lead.id === id)
    },
    [leads]
  )

  const getTeamMemberLeads = useCallback(
    (memberId: string) => {
      return leads.filter((lead) => lead.assignedTo === memberId)
    },
    [leads]
  )

  return (
    <LeadsContext.Provider
      value={{
        leads,
        calls,
        teamMembers,
        isLoading,
        addLead,
        updateLead,
        deleteLead,
        addLeads,
        addCall,
        getLeadCalls,
        getLeadById,
        getTeamMemberLeads,
      }}
    >
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeads() {
  const context = useContext(LeadsContext)

  if (!context) {
    throw new Error('useLeads must be used within LeadsProvider')
  }

  return context
}
