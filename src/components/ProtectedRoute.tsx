import { Navigate, useLocation } from 'react-router-dom'
import { useAuthGate } from '../hooks/useAuthGate'

export type ProtectedRouteProps = {
  children: React.ReactNode
  requireRole?: 'admin' | 'officer' | 'member'
  requireEditAccess?: boolean
}

export default function ProtectedRoute({
  children,
  requireRole,
  requireEditAccess = false,
}: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, role, loading } = useAuthGate()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to="/" replace />
  }

  if (requireEditAccess && (role !== 'admin' && role !== 'officer')) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
