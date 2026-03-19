import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import dashStyles from '../kmt/KmtDashboardPage.module.css'

function daysUntil(iso: string | undefined): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  return Math.ceil((t - Date.now()) / (86400 * 1000))
}

export function KmtDashboardPage() {
  const { documents } = usePocDocuments()

  const awaiting = documents.filter((d) => d.status === 'awaiting_kmt')
  const archived = documents.filter((d) => d.status === 'archived')
  const published = documents.filter((d) => d.status === 'published')
  const expiringSoon = published.filter((d) => {
    const dLeft = daysUntil(d.expiryDate)
    return dLeft !== null && dLeft <= 60 && dLeft >= 0
  })
  const expired = published.filter((d) => {
    const dLeft = daysUntil(d.expiryDate)
    return dLeft !== null && dLeft < 0
  })

  const templateCount = 4

  const awaitingSorted = useMemo(
    () =>
      awaiting
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [awaiting],
  )

  const tableRows = useMemo(() => {
    const rows = documents.filter(
      (d) => d.status === 'awaiting_kmt' || d.status === 'published' || d.pendingArchive,
    )
    return rows.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [documents])

  return (
    <div className={styles.stack}>
      <Card>
        <h1 className={styles.title}>KMT dashboard</h1>
        <p className={styles.lead}>
          High-level widgets. Use the sidebar for <strong>Governance</strong>, <strong>Review Queues</strong>
          , and <strong>Lifecycle</strong>. State syncs live with POC/BUFM sessions.
        </p>

        <div className={styles.row}>
          <Link to="/kmt/knowledge/review">
            <Button variant="primary" type="button">
              Review queue
            </Button>
          </Link>
          <Link to="/kmt/governance/templates">
            <Button variant="secondary" type="button">
              Templates management
            </Button>
          </Link>
        </div>

        <div className={dashStyles.widgetGrid}>
          <div className={styles.panel}>
            <h2 className={styles.h2}>Templates created</h2>
            <p className={styles.metaCount}>{templateCount}</p>
            <p className={styles.meta}>Demo count — manage in Template management</p>
          </div>
          <div className={styles.panel}>
            <h2 className={styles.h2}>Awaiting final approval</h2>
            <p className={styles.metaCount}>{awaiting.length}</p>
            <p className={styles.meta}>BUFM-approved queue</p>
          </div>
          <div className={styles.panel}>
            <h2 className={styles.h2}>Expiring soon</h2>
            <p className={styles.metaCount}>{expiringSoon.length}</p>
            <p className={styles.meta}>Within 60 days (demo rule)</p>
          </div>
          <div className={styles.panel}>
            <h2 className={styles.h2}>Archived</h2>
            <p className={styles.metaCount}>{archived.length}</p>
            <p className={styles.meta}>Expired tab: {expired.length}</p>
          </div>
        </div>

        <h2 className={`${styles.h2} ${dashStyles.queueSection}`}>Sample documents — final review</h2>
        <p className={styles.lead}>
          These items are <strong>awaiting KMT</strong> after BUFM approval. Open any card to review
          sections like the POC viewer, edit your thread comments, and use <strong>Publish</strong>.
        </p>
        {awaitingSorted.length === 0 ? (
          <p className={styles.emptyLead}>Nothing in the KMT queue right now.</p>
        ) : (
          <div className={dashStyles.queueGrid}>
            {awaitingSorted.map((d) => (
              <article key={d.id} className={dashStyles.queueCard}>
                <h3 className={dashStyles.queueCardTitle}>{d.name}</h3>
                <p className={dashStyles.queueCardMeta}>
                  Owner: {d.ownerName ?? '—'} · v{d.version} · Updated{' '}
                  {new Date(d.updatedAt).toLocaleDateString()}
                </p>
                <div className={dashStyles.queueCardActions}>
                  <Link to={`/kmt/review/${d.id}`}>
                    <Button variant="primary" type="button" size="sm">
                      Review &amp; publish
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <h2 className={`${styles.h2} ${dashStyles.tableHeading}`}>Documents</h2>
        {tableRows.length === 0 ? (
          <p className={styles.emptyLead}>No documents in this dashboard slice.</p>
        ) : (
          <div className={dashStyles.tableWrap}>
            <table className={dashStyles.table}>
              <thead>
                <tr>
                  <th>Document name</th>
                  <th>POC owner</th>
                  <th>BUFM status</th>
                  <th>Version</th>
                  <th>Expiry date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.ownerName ?? '—'}</td>
                    <td>
                      {d.pendingArchive
                        ? 'Archive pending'
                        : d.status === 'awaiting_kmt'
                          ? 'Approved (BUFM)'
                          : 'Published'}
                    </td>
                    <td>{d.version}</td>
                    <td>{d.expiryDate ?? '—'}</td>
                    <td>
                      {d.pendingArchive ? (
                        <Link to={`/kmt/archive/${d.id}`}>
                          <Button variant="primary" type="button" size="sm">
                            Review archive
                          </Button>
                        </Link>
                      ) : d.status === 'awaiting_kmt' ? (
                        <Link to={`/kmt/review/${d.id}`}>
                          <Button variant="primary" type="button" size="sm">
                            Review
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/kmt/published/${d.id}`}>
                          <Button variant="secondary" type="button" size="sm">
                            View
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.row}>
          <Link to="/kmt/governance/templates">
            <Button variant="secondary" type="button">
              Templates management
            </Button>
          </Link>
          <Link to="/kmt/knowledge/published">
            <Button variant="secondary" type="button">
              Published library
            </Button>
          </Link>
          <Link to="/kmt/reports">
            <Button variant="secondary" type="button">
              Reports
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
