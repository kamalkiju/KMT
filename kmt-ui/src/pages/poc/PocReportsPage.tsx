import { Card } from '../../components/ui/Card'
import styles from '../shared/rolePages.module.css'

export function PocReportsPage() {
  return (
    <div className={styles.stack}>
      <Card>
        <h1 className={styles.title}>Reports</h1>
        <p className={styles.lead}>
          Scheduled and ad-hoc reports for knowledge documents, approvals, and RSAUI alignment.
          Wire this area to your analytics service in a full implementation.
        </p>
        <p className={styles.meta}>Review Dates and export schedules would appear here.</p>
      </Card>
    </div>
  )
}
