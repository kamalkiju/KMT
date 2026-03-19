import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import pageStyles from './KmtArchivedPage.module.css'
import ent from './KmtEnterprise.module.css'

export function KmtArchivedPage() {
  const navigate = useNavigate()
  const { documents, cloneDocument, restoreFromArchive } = usePocDocuments()
  const archived = useMemo(
    () =>
      documents
        .filter((d) => d.status === 'archived')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [documents],
  )

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/kmt/knowledge/published" label="Published library" />
        <h1 className={styles.title}>Archived library</h1>
        <p className={styles.lead}>
          Archived catalog documents. Restore returns to published (demo). Clone creates a new draft
          lineage.
        </p>
        {archived.length === 0 ? (
          <p className={styles.emptyLead}>No archived documents in the demo catalog.</p>
        ) : (
          <div className={pageStyles.tableWrap}>
            <table className={pageStyles.table}>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Archived reason</th>
                  <th>Version</th>
                  <th>Archived date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archived.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.archiveReason ?? '—'}</td>
                    <td>{d.version}</td>
                    <td>{d.archivedAt ? new Date(d.archivedAt).toLocaleString() : '—'}</td>
                    <td>
                      <div className={ent.actionRow}>
                        <Button
                          variant="success"
                          type="button"
                          size="sm"
                          onClick={() => {
                            restoreFromArchive(d.id)
                            navigate('/kmt/knowledge/published')
                          }}
                        >
                          Restore
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          size="sm"
                          onClick={() => {
                            const c = cloneDocument(d.id)
                            if (c) navigate(`/poc/document/${c.id}`)
                          }}
                        >
                          Clone
                        </Button>
                        <Link to={`/kmt/governance/peek/${d.id}`}>
                          <Button variant="ghost" type="button" size="sm">
                            View summary
                          </Button>
                        </Link>
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
