import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types/user'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import formStyles from '../../components/ui/FormField.module.css'
import styles from './LoginPage.module.css'

const ROLE_OPTIONS: { value: UserRole | ''; label: string }[] = [
  { value: '', label: 'Select role…' },
  { value: 'POC', label: 'POC — Content Owner' },
  { value: 'BUFM', label: 'BUFM — Finance Approver' },
  { value: 'KMT', label: 'KMT — Governance Authority' },
]

function homePathForRole(r: UserRole): string {
  if (r === 'POC') return '/poc/dashboard'
  if (r === 'BUFM') return '/bufm/dashboard'
  return '/kmt/dashboard'
}

export function LoginPage() {
  const { user, login, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('john.smith@example.com')
  const [password, setPassword] = useState('demo')
  const [role, setRole] = useState<UserRole | ''>('POC')

  if (user) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const ok = await login(email, password, role)
    if (!ok || !role) return
    navigate(homePathForRole(role), { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Knowledge Document Orchestration</h1>
        <p className={styles.sub}>Sign in with your role to open the correct workspace.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          {error ? (
            <div className={styles.error} role="alert">
              {error}
            </div>
          ) : null}
          <FormField label="Email" required>
            <input
              type="email"
              className={formStyles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={clearError}
              autoComplete="username"
            />
          </FormField>
          <FormField label="Password" required>
            <input
              type="password"
              className={formStyles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={clearError}
              autoComplete="current-password"
            />
          </FormField>
          <FormField label="Actor / role" required>
            <select
              className={formStyles.select}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole | '')}
              onFocus={clearError}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
          <Button variant="primary" type="submit">
            Sign in
          </Button>
        </form>
        <p className={styles.footerNote}>
          Frontend demo only — use any non-empty password. Empty password triggers invalid credentials.
        </p>
      </div>
    </div>
  )
}
