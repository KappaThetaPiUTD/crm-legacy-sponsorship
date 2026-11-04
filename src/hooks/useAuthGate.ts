import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getCurrentProfile } from '../lib/auth'

export function useAuthGate() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState<'admin' | 'officer' | 'member' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!isMounted) return

        if (!data.session) {
          setIsAuthenticated(false)
          setRole(null)
          setLoading(false)
          return
        }

        const profile = await getCurrentProfile()

        if (!isMounted) return

        setIsAuthenticated(true)
        setRole(profile?.role ?? 'member')
      } catch {
        if (!isMounted) return
        setIsAuthenticated(false)
        setRole(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session))

      if (!session) {
        setRole(null)
        setLoading(false)
        return
      }

      void getCurrentProfile().then((profile) => {
        setRole(profile?.role ?? 'member')
        setLoading(false)
      })
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { isAuthenticated, role, loading }
}
