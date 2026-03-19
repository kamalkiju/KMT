import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'
import { knowledgeBufmStatusLabel, templateDisplayName } from './kmtWorkflowLabels'

export function KmtKnowledgeReviewQueuePage() {
  const navigate = useNavigate()
  const { documents, approveByKmt, rejectByKmt } = usePocDocuments()

  const rows = useMemo(() => {
    return documents
      .filter((d) => d.status === 'in_review' || d.status === 'awaiting_kmt' || d.status === 'rejected')
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [documents])

  return (
    <div className={styles.stack}>
      <Card>
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>Review queue</h1>
            <p className={styles.lead}>
              Knowledge documents in flight. Use <strong>View details</strong> for the tabbed preview;
              approve or send back from here or from the detail screen. Edit template when you need
              catalog structure changes.
            </p>
          </div>
        </header>

        {rows.length === 0 ? (
          <p className={styles.emptyLead}>No items in the review queue.</p>
        ) : (
          <div className={ent.tableWrap}>
            <table className={ent.table}>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Template</th>
                  <th>POC owner</th>
                  <th>BUFM status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{templateDisplayName(d.documentTemplateId)}</td>
                    <td>{d.ownerName ?? '—'}</td>
                    <td>
                      <span className={ent.badge}>{knowledgeBufmStatusLabel(d)}</span>
                    </td>
                    <td>
                      <div className={ent.actionRow}>
                        <Link to={`/kmt/knowledge/document/${d.id}`}>
                          <Button variant="primary" type="button" size="sm">
                            View details
                          </Button>
                        </Link>
                        <Button
                          variant="success"
                          type="button"
                          size="sm"
                          disabled={d.status !== 'awaiting_kmt'}
                          title={d.status !== 'awaiting_kmt' ? 'Only when in KMT queue' : undefined}
                          onClick={() => {
                            if (
                              d.status === 'awaiting_kmt' &&
                              globalThis.confirm(`Approve and publish “${d.name}”?`)
                            ) {
                              approveByKmt(d.id)
                              navigate('/kmt/knowledge/published')
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          type="button"
                          size="sm"
                          disabled={d.status !== 'awaiting_kmt'}
                          onClick={() => {
                            if (d.status !== 'awaiting_kmt') return
                            const note = globalThis.prompt(
                              'Return message',
                              'Returned from KMT review queue (demo).',
                            )
                            if (note === null) return
                            rejectByKmt(d.id, note.trim() || 'Returned from KMT review queue (demo).')
                          }}
                        >
                          Send back
                        </Button>
                        <Link to={`/kmt/governance/templates/${d.documentTemplateId}`}>
                          <Button variant="secondary" type="button" size="sm">
                            Edit template
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
