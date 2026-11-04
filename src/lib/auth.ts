import { supabase } from './supabase'
import type { UserRole } from './permissions'

export type UserProfile = {
  id: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return data.user
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as UserProfile | null
}

export async function getCurrentRole() {
  const profile = await getCurrentProfile()
  return profile?.role ?? null
}

export async function canCurrentUserEditCompanies() {
  const role = await getCurrentRole()
  return role === 'admin' || role === 'officer'
}
