import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import { useRsauiQueue } from '../../context/RsauiQueueContext'
import type { PocDocument } from '../../types/pocDocument'
import styles from '../shared/rolePages.module.css'
import dashStyles from './BufmDashboardPage.module.css'

function knowledgeStatusLabel(d: PocDocument): string {
  if (d.status === 'in_review') return 'Pending BUFM'
  if (d.status === 'awaiting_kmt') return 'Awaiting KMT'
  if (d.status === 'rejected') return 'Rejected'
  if (d.status === 'published') return 'Published'
  if (d.status === 'archived') return 'Archived'
  return d.status
}

export function BufmDashboardPage() {
  const { documents } = usePocDocuments()
  const { items: rsauiItems } = useRsauiQueue()

  const pendingKnowledge = documents.filter((d) => d.status === 'in_review')
  const pendingRsaui = rsauiItems.filter((r) => r.status === 'pending')
  const recentPublished = documents
    .filter((d) => d.status === 'published')
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  type Row =
    | { kind: 'knowledge'; doc: PocDocument }
    | { kind: 'rsaui'; id: string; title: string; pocName: string; status: string; version: string; updatedAt: string }

  const tableRows: Row[] = [
    ...pendingKnowledge.map((doc) => ({ kind: 'knowledge' as const, doc })),
    ...pendingRsaui.map((r) => ({
      kind: 'rsaui' as const,
      id: r.id,
      title: r.title,
      pocName: r.pocName,
      status: 'RSAUI pending',
      version: r.version,
      updatedAt: r.updatedAt,
    })),
  ]

  return (
    <div className={styles.stack}>
      <Card>
        <h1 className={styles.title}>BUFM dashboard</h1>
        <p className={styles.lead}>
          Knowledge documents in <strong>Pending BUFM</strong> are every POC submission with status
          in review — the same live list stored in your browser (no bundled sample data). Open a
          second tab as POC, submit a document, and refresh or switch back here to see it. Browse the{' '}
          <Link to="/bufm/users" className={dashStyles.inlineLink}>
            POC user directory
          </Link>{' '}
          for owner roster and previews.
        </p>

        <div className={styles.triGrid}>
          <div className={styles.panel}>
            <h2 className={styles.h2}>Pending RSAUI approvals</h2>
            <p className={styles.metaCount}>{pendingRsaui.length}</p>
            <p className={styles.meta}>Product / pricing / coverage change requests</p>
          </div>
          <div className={styles.panel}>
            <h2 className={styles.h2}>Pending knowledge document reviews</h2>
            <p className={styles.metaCount}>{pendingKnowledge.length}</p>
            <p className={styles.meta}>Submitted by POC for BUFM</p>
          </div>
          <div className={styles.panel}>
            <h2 className={styles.h2}>Recently published</h2>
            <p className={styles.metaCount}>{recentPublished.length}</p>
            <ul className={styles.miniList}>
              {recentPublished.length === 0 ? (
                <li className={styles.meta}>None yet</li>
              ) : (
                recentPublished.map((d) => (
                  <li key={d.id} className={styles.meta}>
                    {d.name} · v{d.version}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <h2 className={`${styles.h2} ${dashStyles.tableHeading}`}>Approval queue</h2>
        {tableRows.length === 0 ? (
          <p className={styles.emptyLead}>No documents pending your approval.</p>
        ) : (
          <div className={dashStyles.tableWrap}>
            <table className={dashStyles.table}>
              <thead>
                <tr>
                  <th>Document name</th>
                  <th>Submitted by</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Last updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) =>
                  row.kind === 'knowledge' ? (
                    <tr key={row.doc.id}>
                      <td>{row.doc.name}</td>
                      <td>{row.doc.ownerName ?? '—'}</td>
                      <td>{knowledgeStatusLabel(row.doc)}</td>
                      <td>{row.doc.version}</td>
                      <td>{new Date(row.doc.updatedAt).toLocaleString()}</td>
                      <td>
                        <Link to={`/bufm/review/${row.doc.id}`}>
                          <Button variant="primary" type="button" size="sm">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.id}>
                      <td>
                        {row.title}{' '}
                        <span className={dashStyles.pill}>RSAUI</span>
                      </td>
                      <td>{row.pocName}</td>
                      <td>{row.status}</td>
                      <td>{row.version}</td>
                      <td>{new Date(row.updatedAt).toLocaleString()}</td>
                      <td>
                        <Link to={`/bufm/rsa-ui/${row.id}`}>
                          <Button variant="primary" type="button" size="sm">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
