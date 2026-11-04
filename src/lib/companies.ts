import { supabase } from './supabase'

export type SponsorTier = 'gold' | 'silver' | 'bronze' | 'partner' | 'unknown'
export type SponsorStatus =
  | 'prospect'
  | 'contacted'
  | 'in_talks'
  | 'committed'
  | 'received'
  | 'inactive'

export type CompanyRecord = {
  id: string
  name: string
  industry: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  tier: SponsorTier
  notes: string | null
  status: SponsorStatus
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type CompanyInsert = {
  name: string
  industry?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  tier?: SponsorTier
  notes?: string | null
  status?: SponsorStatus
}

export async function listCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as CompanyRecord[]
}

export async function getCompanyById(id: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as CompanyRecord | null
}

export async function createCompany(input: CompanyInsert) {
  const { data, error } = await supabase
    .from('companies')
    .insert([
      {
        ...input,
        tier: input.tier ?? 'unknown',
        status: input.status ?? 'prospect',
      },
    ])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as CompanyRecord
}

export async function updateCompany(id: string, input: Partial<CompanyInsert>) {
  const { data, error } = await supabase
    .from('companies')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as CompanyRecord
}

export async function deleteCompany(id: string) {
  const { error } = await supabase.from('companies').delete().eq('id', id)

  if (error) {
    throw error
  }
}
