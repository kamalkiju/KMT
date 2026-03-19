import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { DocumentReadOnlyView } from '../../components/poc/DocumentReadOnlyView'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import formStyles from '../../components/ui/FormField.module.css'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'
import { templateDisplayName } from './kmtWorkflowLabels'

export function KmtRsauiDocumentPage() {
  const { docId = '' } = useParams<{ docId: string }>()
  const navigate = useNavigate()
  const { documents, rejectByKmt } = usePocDocuments()
  const [forceNote, setForceNote] = useState(
    'RSAUI dependency unresolved — return to POC for configuration.',
  )
  const doc = documents.find((d) => d.id === docId)

  if (!doc) {
    return (
      <div className={styles.stack}>
        <Card>
          <PageBackBar to="/kmt/review/rsaui" label="RSAUI dependency queue" />
          <h1 className={styles.title}>Document not found</h1>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/kmt/review/rsaui" label="RSAUI dependency queue" />
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>{doc.name}</h1>
            <p className={styles.lead}>
              RSAUI dependency · template <strong>{templateDisplayName(doc.documentTemplateId)}</strong>
            </p>
          </div>
          <div className={ent.actionRow}>
            <Button variant="secondary" type="button" onClick={() => navigate('/kmt/review/rsaui')}>
              Back to queue
            </Button>
            <Button
              variant="danger"
              type="button"
              disabled={doc.status !== 'awaiting_kmt'}
              title={
                doc.status !== 'awaiting_kmt'
                  ? 'Use when document is in KMT queue (demo rule).'
                  : undefined
              }
              onClick={() => {
                rejectByKmt(doc.id, forceNote.trim() || 'Returned: RSAUI dependency.')
                navigate('/kmt/review/rsaui')
              }}
            >
              Force send back to POC
            </Button>
          </div>
        </header>
        <p className={styles.meta}>
          Demo RSAUI snapshot — production would embed live product / pricing validation.
        </p>
        <label className={styles.meta} htmlFor="rsa-full-note">
          Return message
        </label>
        <textarea
          id="rsa-full-note"
          className={formStyles.textarea}
          rows={3}
          value={forceNote}
          onChange={(e) => setForceNote(e.target.value)}
        />
        <div style={{ marginTop: 16, maxHeight: '60vh', overflow: 'auto' }}>
          <DocumentReadOnlyView doc={doc} />
        </div>
        {doc.status === 'awaiting_kmt' ? (
          <p className={styles.meta} style={{ marginTop: 16 }}>
            <Link to={`/kmt/review/${doc.id}`}>Open KMT final review workspace →</Link>
          </p>
        ) : null}
      </Card>
    </div>
  )
}
