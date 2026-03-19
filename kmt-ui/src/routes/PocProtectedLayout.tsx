import { Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'

export function PocProtectedLayout() {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.role !== 'POC') {
    return <Navigate to="/login" replace />
  }
  return <AppShell role="POC" userName={user.name} />
}
