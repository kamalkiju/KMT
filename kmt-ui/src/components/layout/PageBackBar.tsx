import { Link } from 'react-router-dom'
import styles from './PageBackBar.module.css'

interface PageBackBarProps {
  to: string
  label?: string
}

export function PageBackBar({ to, label = 'Back' }: PageBackBarProps) {
  return (
    <div className={styles.bar}>
      <Link to={to} className={styles.link}>
        <span className={styles.chev} aria-hidden>
          ←
        </span>
        {label}
      </Link>
    </div>
  )
}
