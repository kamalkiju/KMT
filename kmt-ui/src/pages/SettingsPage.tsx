import { Card } from '../components/ui/Card'
import styles from './shared/rolePages.module.css'

export function SettingsPage() {
  return (
    <div className={styles.stack}>
      <Card>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.lead}>
          Profile, notifications, and workspace preferences will connect to the API when the
          backend is available.
        </p>
      </Card>
    </div>
  )
}
