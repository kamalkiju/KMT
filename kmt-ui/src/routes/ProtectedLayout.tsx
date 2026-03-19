import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AppShell } from '../components/layout/AppShell'
import type { UserRole } from '../types/user'

export function ProtectedLayout({ allowed }: { allowed: UserRole }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.role !== allowed) {
    return <Navigate to="/login" replace />
  }
  return <AppShell role={user.role} userName={user.name} />
}
