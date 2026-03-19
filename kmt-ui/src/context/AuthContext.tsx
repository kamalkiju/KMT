import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, UserRole } from '../types/user'

const STORAGE_KEY = 'kmt.session.v1'

interface AuthContextValue {
  user: AuthUser | null
  login: (
    email: string,
    password: string,
    role: UserRole | '',
  ) => Promise<boolean>
  logout: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(
    async (email: string, password: string, role: UserRole | '') => {
      setError(null)
      if (!email.trim()) {
        setError('Enter your email address.')
        return false
      }
      if (!password) {
        setError('Invalid credentials.')
        return false
      }
      if (!role) {
        setError('Contact Administrator: no role assigned to this account.')
        return false
      }

      const next: AuthUser = {
        id: 'demo-user',
        name:
          role === 'POC'
            ? 'John Smith'
            : role === 'BUFM'
              ? 'Alex Rivera'
              : 'Jordan Lee',
        email: email.trim(),
        role,
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setUser(next)
      return true
    },
    [],
  )

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({ user, login, logout, error, clearError }),
    [user, login, logout, error, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
