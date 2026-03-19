import { Link } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import styles from '../shared/rolePages.module.css'
import pageStyles from './KmtReportsPage.module.css'

export function KmtReportsPage() {
  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/kmt/dashboard" label="Dashboard" />
        <h1 className={styles.title}>Reports &amp; lifecycle</h1>
        <p className={styles.lead}>
          Executive view of positive and negative paths across the knowledge program (demo narrative).
        </p>

        <div className={pageStyles.columns}>
          <section className={pageStyles.panel}>
            <h2 className={pageStyles.h2}>Positive flow</h2>
            <ol className={pageStyles.flowList}>
              <li>Template created</li>
              <li>POC creates document</li>
              <li>RSAUI validated</li>
              <li>BUFM approves</li>
              <li>KMT reviews</li>
              <li>KMT edits if needed → minor version</li>
              <li>Publish</li>
              <li>Expiry monitoring</li>
              <li>Archive governance</li>
            </ol>
          </section>
          <section className={pageStyles.panel}>
            <h2 className={pageStyles.h2}>Negative flow</h2>
            <ol className={pageStyles.flowList}>
              <li>Missing dependency → RSAUI queue</li>
              <li>BUFM reject → return to POC</li>
              <li>KMT reject → version loop</li>
              <li>Expiry ignored → forced archive</li>
            </ol>
          </section>
        </div>

        <div className={styles.row}>
          <Link to="/kmt/knowledge/review">
            <Button variant="primary" type="button">
              Review queue
            </Button>
          </Link>
          <Link to="/kmt/knowledge/expiry">
            <Button variant="secondary" type="button">
              Expiry queue
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
