import styles from './Sidebar.module.css'

export function PocSidebarLinks() {
  return (
    <ul className={styles.subList}>
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
  )
}
