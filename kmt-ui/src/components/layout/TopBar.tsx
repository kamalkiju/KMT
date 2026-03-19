import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './TopBar.module.css'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface TopBarProps {
  userName: string
  roleLabel: string
}

export function TopBar({ userName, roleLabel }: TopBarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className={styles.bar}>
      <div className={styles.actions}>
        <button type="button" className={styles.bell} aria-label="Notifications">
          <span className={styles.bellDot} aria-hidden />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5L4 18h16l-2-2z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className={styles.profile}>
          <div className={styles.avatar}>{initials(userName)}</div>
          <div className={styles.names}>
            <span className={styles.name}>{userName}</span>
            <span className={styles.role}>{roleLabel}</span>
          </div>
        </div>
        <button
          type="button"
          className={styles.signOut}
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
