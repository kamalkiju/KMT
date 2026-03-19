import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { KnowledgeReviewerExplorer } from '../../components/poc/KnowledgeReviewerExplorer'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import pageStyles from './KmtPublishedPage.module.css'

export function KmtPublishedPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getById, cloneDocument, requestArchive } = usePocDocuments()

  const doc = useMemo(() => (id ? getById(id) : undefined), [getById, id])

  if (!id || !doc) {
    return (
      <div className={styles.stack}>
        <Card>
          <p className={styles.lead}>Document not found.</p>
          <Link to="/kmt/knowledge/published">
            <Button variant="secondary" type="button">
              Published documents
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (doc.status !== 'published') {
    return (
      <div className={styles.stack}>
        <Card>
          <p className={styles.lead}>
            This screen is for published documents only (current status: <strong>{doc.status}</strong>
            ).
          </p>
          <Link to="/kmt/knowledge/published">
            <Button variant="secondary" type="button">
              Published documents
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/kmt/knowledge/published" label="Published library" />
        <div className={pageStyles.success}>
          <h1 className={styles.title}>Knowledge document published</h1>
          <p className={styles.lead}>
            <strong>{doc.name}</strong> is live in the demo catalog (version {doc.version}).
          </p>
          <div className={pageStyles.badges}>
            <Badge tone="published">Published</Badge>
            {doc.expiryDate ? (
              <Badge tone="warn">{`Expiry ${doc.expiryDate}`}</Badge>
            ) : (
              <Badge tone="archived">No expiry set</Badge>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <Link to={`/kmt/document/${doc.id}`}>
            <Button variant="primary" type="button">
              Governance edit
            </Button>
          </Link>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              const c = cloneDocument(doc.id)
              if (c) navigate(`/kmt/document/${c.id}`)
            }}
          >
            Clone &amp; edit (draft)
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              const c = cloneDocument(doc.id)
              if (c) navigate(`/kmt/knowledge/published`)
            }}
          >
            Clone only
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              requestArchive(doc.id, 'Scheduled archival from publish success screen (demo).')
              navigate(`/kmt/archive/${doc.id}`)
            }}
          >
            Archive…
          </Button>
        </div>

        <div className={pageStyles.explorerBlock}>
          <h2 className={pageStyles.explorerTitle}>Published document (POC-style view)</h2>
          <p className={pageStyles.explorerLead}>
            Section tabs and read-only fields match what the POC sees under <strong>View details</strong>.
          </p>
          <KnowledgeReviewerExplorer variant="publishedViewer" doc={doc} currentUserName={user?.name} />
        </div>
      </Card>
    </div>
  )
}
