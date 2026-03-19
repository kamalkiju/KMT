import { NavLink } from 'react-router-dom'
import type { UserRole } from '../../types/user'
import { KmtEnterpriseNav } from './KmtEnterpriseNav'
import { NavIcon, type NavIconName } from './NavIcons'
import { PocSidebarLinks } from './PocSidebarLinks'
import styles from './Sidebar.module.css'

interface NavItem {
  to: string
  label: string
  icon: NavIconName
  end?: boolean
  /** Primary module (e.g. Governance Queue). */
  primary?: boolean
}

const POC_ITEMS: NavItem[] = [
  { to: '/poc/dashboard', label: 'Knowledge Documents', icon: 'doc', end: true },
  { to: '/poc/rsa-ui', label: 'RSAUI Tool', icon: 'link' },
  { to: '/poc/reports', label: 'Reports', icon: 'chart' },
  { to: '/poc/training', label: 'Training', icon: 'template' },
]

const BUFM_ITEMS: NavItem[] = [
  { to: '/bufm/dashboard', label: 'BUFM Dashboard', icon: 'users', end: true },
  { to: '/bufm/users', label: 'POC users', icon: 'users' },
  { to: '/bufm/monitoring', label: 'Monitoring', icon: 'chart' },
]

function navClass({ isActive }: { isActive: boolean }) {
  return `${styles.link} ${isActive ? styles.linkActive : ''}`
}

function navItemsForRole(role: UserRole): NavItem[] {
  if (role === 'POC') return POC_ITEMS
  if (role === 'BUFM') return BUFM_ITEMS
  return []
}

function reportsHrefForRole(role: UserRole): string {
  if (role === 'POC') return '/poc/dashboard'
  if (role === 'BUFM') return '/bufm/dashboard'
  return '/kmt/reports'
}

export function Sidebar({ role }: { role: UserRole }) {
  const items = navItemsForRole(role)
  const reportsHref = reportsHrefForRole(role)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>CEUI</div>
      <ul className={styles.menu}>
        {role === 'KMT' ? (
          <KmtEnterpriseNav />
        ) : (
          items.map((item) => (
            <li key={item.to} className={styles.item}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.linkActive : ''} ${item.primary ? styles.linkPrimary : ''}`.trim()
                }
              >
                <NavIcon name={item.icon} />
                {item.primary ? (
                  <span className={styles.primaryLabel}>
                    {item.label}
                    <span className={styles.primaryStar} aria-hidden>
                      ★
                    </span>
                  </span>
                ) : (
                  item.label
                )}
              </NavLink>
            </li>
          ))
        )}
        {role !== 'POC' && role !== 'KMT' ? (
          <li className={styles.item}>
            <div className={styles.link}>
              <NavIcon name="chart" />
              Reports
              <span className={styles.chevron}>▾</span>
            </div>
            <ul className={styles.subList}>
              <li>
                <NavLink to={reportsHref} className={styles.subLink}>
                  Review Dates
                </NavLink>
              </li>
            </ul>
          </li>
        ) : null}
        <li className={styles.item}>
          <div className={styles.link}>
            <NavIcon name="link" />
            Links
            <span className={styles.chevron}>▾</span>
          </div>
          {role === 'POC' ? (
            <PocSidebarLinks />
          ) : role === 'KMT' ? (
            <ul className={styles.subList}>
              <li>
                <a
                  href="https://example.com/rsa-ui"
                  className={styles.subLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  RSAUI Tool
                </a>
              </li>
            </ul>
          ) : (
            <ul className={styles.subList}>
              <li>
                <a
                  href="https://example.com/rsa-ui"
                  className={styles.subLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  RSAUI Tool
                </a>
              </li>
              <li>
                <a
                  href="https://example.com/support"
                  className={styles.subLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Request Support
                </a>
              </li>
            </ul>
          )}
        </li>
      </ul>
      <ul className={styles.menuBottom}>
        <li className={styles.item}>
          <NavLink to={`/${role.toLowerCase()}/settings`} className={navClass}>
            <NavIcon name="gear" />
            Settings
          </NavLink>
        </li>
      </ul>
    </aside>
  )
}
