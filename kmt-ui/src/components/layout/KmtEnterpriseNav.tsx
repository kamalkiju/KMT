import { NavLink } from 'react-router-dom'
import { NavIcon } from './NavIcons'
import styles from './Sidebar.module.css'

function sub({ isActive }: { isActive: boolean }) {
  return `${styles.subLink} ${isActive ? styles.subLinkActive : ''}`.trim()
}

export function KmtEnterpriseNav() {
  return (
    <>
      <li className={styles.item}>
        <NavLink
          to="/kmt/dashboard"
          end
          className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
        >
          <NavIcon name="users" />
          Dashboard
        </NavLink>
      </li>

      <li className={styles.item}>
        <div className={styles.link}>
          <NavIcon name="shield" />
          Template Governance
          <span className={styles.chevron} aria-hidden>
            ▾
          </span>
        </div>
        <ul className={styles.subList}>
          <li>
            <NavLink to="/kmt/governance/templates" className={sub}>
              Templates
            </NavLink>
          </li>
          <li>
            <NavLink to="/kmt/governance/template-assignments" className={sub}>
              Template Assignments (Users)
            </NavLink>
          </li>
        </ul>
      </li>

      <li className={styles.item}>
        <div className={styles.link}>
          <NavIcon name="doc" />
          Knowledge Governance
          <span className={styles.chevron} aria-hidden>
            ▾
          </span>
        </div>
        <ul className={styles.subList}>
          <li>
            <NavLink to="/kmt/knowledge/review" className={sub}>
              Review Queue
            </NavLink>
          </li>
          <li>
            <NavLink to="/kmt/knowledge/expiry" className={sub}>
              Expiry Queue
            </NavLink>
          </li>
          <li>
            <NavLink to="/kmt/knowledge/published" className={sub}>
              Published Library
            </NavLink>
          </li>
          <li>
            <NavLink to="/kmt/knowledge/archived" className={sub}>
              Archived Library
            </NavLink>
          </li>
          <li>
            <NavLink to="/kmt/review/rsaui" className={sub}>
              RSAUI dependency queue
            </NavLink>
          </li>
        </ul>
      </li>

      <li className={styles.item}>
        <NavLink
          to="/kmt/users"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
        >
          <NavIcon name="users" />
          Users
        </NavLink>
      </li>

      <li className={styles.item}>
        <NavLink
          to="/kmt/reports"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
        >
          <NavIcon name="chart" />
          Reports
        </NavLink>
      </li>
    </>
  )
}
