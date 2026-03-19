import { Outlet } from 'react-router-dom'
import type { UserRole } from '../../types/user'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import styles from './AppShell.module.css'

interface AppShellProps {
  role: UserRole
  userName: string
}

const ROLE_LABEL: Record<UserRole, string> = {
  POC: 'POC',
  BUFM: 'BUFM',
  KMT: 'KMT',
}

export function AppShell({ role, userName }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar role={role} />
      <div className={styles.main}>
        <TopBar userName={userName} roleLabel={ROLE_LABEL[role]} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
