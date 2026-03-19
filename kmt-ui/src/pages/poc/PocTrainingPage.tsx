import { Card } from '../../components/ui/Card'
import styles from '../shared/rolePages.module.css'

export function PocTrainingPage() {
  return (
    <div className={styles.stack}>
      <Card>
        <h1 className={styles.title}>Training</h1>
        <p className={styles.lead}>
          Role-based training paths for POC authors: template usage, BUFM handoffs, and governance
          checkpoints. Replace this canvas with your LMS or embedded guides.
        </p>
      </Card>
    </div>
  )
}
