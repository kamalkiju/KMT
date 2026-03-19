import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import { useRsauiQueue } from '../../context/RsauiQueueContext'
import type { PocDocument } from '../../types/pocDocument'
import type { RsauiApprovalItem } from '../../types/rsaui'
import styles from '../shared/rolePages.module.css'
import pageStyles from './BufmMonitoringPage.module.css'

type Tab = 'pending' | 'approved' | 'rejected'

function knowledgeMatches(tab: Tab, d: PocDocument): boolean {
  if (tab === 'pending') return d.status === 'in_review'
  if (tab === 'approved')
    return d.status === 'awaiting_kmt' || d.status === 'published' || d.status === 'archived'
  return d.status === 'rejected'
}

function rsauiMatches(tab: Tab, r: RsauiApprovalItem): boolean {
  if (tab === 'pending') return r.status === 'pending'
  if (tab === 'approved') return r.status === 'approved'
  return r.status === 'rejected'
}

export function BufmMonitoringPage() {
  const { documents } = usePocDocuments()
  const { items: rsaui } = useRsauiQueue()
  const [tab, setTab] = useState<Tab>('pending')

  const knowledgeRows = useMemo(
    () => documents.filter((d) => knowledgeMatches(tab, d)),
    [documents, tab],
  )
  const rsauiRows = useMemo(() => rsaui.filter((r) => rsauiMatches(tab, r)), [rsaui, tab])

  const totalPending =
    documents.filter((d) => d.status === 'in_review').length +
    rsaui.filter((r) => r.status === 'pending').length
  const totalDone =
    documents.filter((d) =>
      ['awaiting_kmt', 'published', 'archived', 'rejected'].includes(d.status),
    ).length + rsaui.filter((r) => r.status !== 'pending').length
  const progressPct =
    totalPending + totalDone === 0 ? 100 : Math.round((totalDone / (totalPending + totalDone)) * 100)

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/bufm/dashboard" label="BUFM dashboard" />
        <h1 className={styles.title}>BUFM monitoring</h1>
        <p className={styles.lead}>
          Filter RSAUI and knowledge approvals. Version shown is the current document / package
          version (full history in production).
        </p>

        <div className={pageStyles.progressWrap}>
          <div className={pageStyles.progressLabel}>Queue progress (demo)</div>
          <div className={pageStyles.progressBar}>
            <div className={pageStyles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <div className={pageStyles.progressMeta}>{progressPct}% processed (lifetime snapshot)</div>
        </div>

        <div className={pageStyles.tabs}>
          {(['pending', 'approved', 'rejected'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`${pageStyles.tab} ${tab === t ? pageStyles.tabOn : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'pending' ? 'Pending' : t === 'approved' ? 'Approved' : 'Rejected'}
            </button>
          ))}
        </div>

        <h2 className={styles.h2}>Knowledge documents</h2>
        {knowledgeRows.length === 0 ? (
          <p className={styles.meta}>No rows in this filter.</p>
        ) : (
          <div className={pageStyles.tableWrap}>
            <table className={pageStyles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>POC</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Version history</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {knowledgeRows.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.ownerName ?? '—'}</td>
                    <td>{d.status}</td>
                    <td>{d.version}</td>
                    <td className={pageStyles.historyCell}>Current v{d.version} (demo)</td>
                    <td>{new Date(d.updatedAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/bufm/review/${d.id}`}>
                        <Button variant="ghost" size="sm" type="button">
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

        <h2 className={`${styles.h2} ${pageStyles.h2sp}`}>RSAUI packages</h2>
        {rsauiRows.length === 0 ? (
          <p className={styles.meta}>No rows in this filter.</p>
        ) : (
          <div className={pageStyles.tableWrap}>
            <table className={pageStyles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>POC</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rsauiRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.title}</td>
                    <td>{r.pocName}</td>
                    <td>{r.status}</td>
                    <td>{r.version}</td>
                    <td>{new Date(r.updatedAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/bufm/rsa-ui/${r.id}`}>
                        <Button variant="ghost" size="sm" type="button">
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
