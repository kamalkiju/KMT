import styles from './Sidebar.module.css'

export type NavIconName =
  | 'doc'
  | 'chart'
  | 'link'
  | 'gear'
  | 'users'
  | 'shield'
  | 'template'

export function NavIcon({ name }: { name: NavIconName }) {
  const common = { width: 20, height: 20, fill: 'none', stroke: 'currentColor' }
  switch (name) {
    case 'doc':
      return (
        <svg {...common} viewBox="0 0 24 24" className={styles.icon}>
          <path
            strokeWidth="1.5"
            d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"
          />
          <path strokeWidth="1.5" d="M14 3v5h5" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...common} viewBox="0 0 24 24" className={styles.icon}>
          <path strokeWidth="1.5" d="M4 19V5M9 19V9M14 19v-6M19 19V12" />
        </svg>
      )
    case 'link':
      return (
        <svg {...common} viewBox="0 0 24 24" className={styles.icon}>
          <path
            strokeWidth="1.5"
            d="M10 13a5 5 0 007.07 0l1.42-1.42a5 5 0 00-7.07-7.07L9 6M14 11a5 5 0 01-7.07 0L5.51 9.58a5 5 0 017.07-7.07L15 4"
          />
        </svg>
      )
    case 'gear':
      return (
        <svg {...common} viewBox="0 0 24 24" className={styles.icon}>
          <path
            strokeWidth="1.5"
            d="M12 15a3 3 0 100-6 3 3 0 000 6zm7.94-2.08l.25 1.62-1.55.73-1.02 1.42.45 1.56-1.52.87-1.35-1.05-1.73.18-.68 1.6-1.79.32-.99-1.35-1.73-.18-1.35 1.05-1.52-.87.45-1.56-1.02-1.42-1.55-.73.25-1.62 1.42-.77.18-1.73-1.35-.99-.32-1.79 1.6-.68.18-1.73 1.05-1.35.87-1.52-1.56.45-1.42-1.02-.73-1.55 1.62-.25.77-1.42 1.73-.18 1.35-.99 1.79-.32.68 1.6 1.73.18 1.35-1.05 1.52.87 1.56-.45 1.42 1.02 1.55.73-.25 1.62-1.42.77-.18 1.73 1.35.99.32 1.79-1.6.68-.18 1.73-1.05 1.35-.87 1.52 1.56-.45 1.42-1.02 1.55-.73z"
          />
        </svg>
      )
    case 'users':
      return (
        <svg {...common} viewBox="0 0 24 24" className={styles.icon}>
          <path
            strokeWidth="1.5"
            d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common} viewBox="0 0 24 24" className={styles.icon}>
          <path
            strokeWidth="1.5"
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          />
        </svg>
      )
    case 'template':
      return (
        <svg {...common} viewBox="0 0 24 24" className={styles.icon}>
          <path strokeWidth="1.5" d="M4 6h16M4 12h10M4 18h16" />
        </svg>
      )
    default:
      return null
  }
}
