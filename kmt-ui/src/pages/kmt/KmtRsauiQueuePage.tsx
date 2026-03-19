import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'
import { knowledgeBufmStatusLabel } from './kmtWorkflowLabels'

export function KmtRsauiQueuePage() {
  const { documents } = usePocDocuments()

  const rows = useMemo(() => documents.filter((d) => d.rsauiDependencyPending), [documents])

  return (
    <div className={styles.stack}>
      <Card>
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>RSAUI dependency queue</h1>
            <p className={styles.lead}>
              Documents blocked on product configuration or pricing validation. Open uses a full-page
              dependency workspace (no modal).
            </p>
          </div>
        </header>

        {rows.length === 0 ? (
          <p className={styles.emptyLead}>No RSAUI dependency holds.</p>
        ) : (
          <div className={ent.tableWrap}>
            <table className={ent.table}>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Missing / hold</th>
                  <th>Requested by</th>
                  <th>BUFM status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>
                      {d.status === 'in_review'
                        ? 'Pricing / product validation'
                        : 'Product configuration sync'}
                    </td>
                    <td>{d.ownerName ?? 'POC'}</td>
                    <td>
                      <span className={ent.badge}>{knowledgeBufmStatusLabel(d)}</span>
                    </td>
                    <td>
                      <Link to={`/kmt/review/rsaui/${d.id}`}>
                        <Button variant="primary" type="button" size="sm">
                          Open
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
