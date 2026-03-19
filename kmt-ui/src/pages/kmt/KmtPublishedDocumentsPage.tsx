import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'
import { templateDisplayName } from './kmtWorkflowLabels'

export function KmtPublishedDocumentsPage() {
  const navigate = useNavigate()
  const { documents, cloneDocument } = usePocDocuments()

  const rows = useMemo(() => {
    return documents
      .filter((d) => d.status === 'published')
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [documents])

  return (
    <div className={styles.stack}>
      <Card>
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>Published library</h1>
            <p className={styles.lead}>
              Live catalog — open, clone to draft, or edit in place from KMT.
            </p>
          </div>
        </header>

        {rows.length === 0 ? (
          <p className={styles.emptyLead}>No published documents in the catalog.</p>
        ) : (
          <div className={ent.tableWrap}>
            <table className={ent.table}>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Template</th>
                  <th>Owner</th>
                  <th>Version</th>
                  <th>Updated at</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{templateDisplayName(d.documentTemplateId)}</td>
                    <td>{d.ownerName ?? '—'}</td>
                    <td>{d.version}</td>
                    <td>{new Date(d.updatedAt).toLocaleString()}</td>
                    <td>
                      <div className={ent.actionRow}>
                        <Link to={`/kmt/published/${d.id}`}>
                          <Button variant="secondary" type="button" size="sm">
                            Open
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          type="button"
                          size="sm"
                          onClick={() => {
                            const c = cloneDocument(d.id)
                            if (c) navigate(`/kmt/document/${c.id}`)
                          }}
                        >
                          Clone &amp; edit
                        </Button>
                        <Link to={`/kmt/document/${d.id}`}>
                          <Button variant="primary" type="button" size="sm">
                            Edit
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
