import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'

type ExpirySub = 'soon' | 'expired'

function daysLeft(expiryDate: string | undefined): number | null {
  if (!expiryDate) return null
  const t = new Date(expiryDate).getTime()
  if (Number.isNaN(t)) return null
  return Math.ceil((t - Date.now()) / (86400 * 1000))
}

function daysRemainingLabel(d: { expiryDate?: string }): string {
  const dl = daysLeft(d.expiryDate)
  if (dl === null) return '—'
  if (dl < 0) return `${dl} (past)`
  return `${dl}`
}

export function KmtExpiryQueuePage() {
  const navigate = useNavigate()
  const { documents, requestArchive, cloneDocument } = usePocDocuments()
  const [sub, setSub] = useState<ExpirySub>('soon')

  const published = useMemo(() => documents.filter((d) => d.status === 'published'), [documents])

  const expiringSoon = useMemo(() => {
    return published.filter((d) => {
      const dl = daysLeft(d.expiryDate)
      return dl !== null && dl >= 0 && dl <= 90
    })
  }, [published])

  const expired = useMemo(() => {
    return published.filter((d) => {
      const dl = daysLeft(d.expiryDate)
      return dl !== null && dl < 0
    })
  }, [published])

  const rows = sub === 'soon' ? expiringSoon : expired

  return (
    <div className={styles.stack}>
      <Card>
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>Expiry queue</h1>
            <p className={styles.lead}>
              Published documents nearing or past expiry. Extend and new-version actions are demo
              stubs; archive uses the shared store.
            </p>
          </div>
        </header>

        <div className={ent.subTabs}>
          <button
            type="button"
            className={`${ent.subTab} ${sub === 'soon' ? ent.subTabOn : ''}`}
            onClick={() => setSub('soon')}
          >
            Expiring soon
          </button>
          <button
            type="button"
            className={`${ent.subTab} ${sub === 'expired' ? ent.subTabOn : ''}`}
            onClick={() => setSub('expired')}
          >
            Expired
          </button>
        </div>

        {rows.length === 0 ? (
          <p className={styles.emptyLead}>No documents in this expiry segment.</p>
        ) : (
          <div className={ent.tableWrap}>
            <table className={ent.table}>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Expiry date</th>
                  <th>Days remaining</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.expiryDate ?? '—'}</td>
                    <td>{daysRemainingLabel(d)}</td>
                    <td>{d.ownerName ?? '—'}</td>
                    <td>
                      <div className={ent.actionRow}>
                        <Button variant="success" type="button" size="sm" title="Demo — policy workflow">
                          Extend expiry
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          size="sm"
                          onClick={() => {
                            const c = cloneDocument(d.id)
                            if (c) navigate(`/kmt/document/${c.id}`)
                          }}
                        >
                          Create new version
                        </Button>
                        <Button
                          variant="danger"
                          type="button"
                          size="sm"
                          onClick={() =>
                            requestArchive(d.id, 'Expiry queue — initiate archive (demo).')
                          }
                        >
                          Archive
                        </Button>
                        {d.pendingArchive ? (
                          <Link to={`/kmt/archive/${d.id}`}>
                            <Button variant="primary" type="button" size="sm">
                              Review pending
                            </Button>
                          </Link>
                        ) : (
                          <Link to={`/kmt/published/${d.id}`}>
                            <Button variant="ghost" type="button" size="sm">
                              Catalog view
                            </Button>
                          </Link>
                        )}
                      </div>
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
