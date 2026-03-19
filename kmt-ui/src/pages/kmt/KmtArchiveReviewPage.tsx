import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import pageStyles from './KmtArchiveReviewPage.module.css'

export function KmtArchiveReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getById, approveArchive, rejectArchiveRequest } = usePocDocuments()

  const doc = useMemo(() => (id ? getById(id) : undefined), [getById, id])

  if (!id || !doc) {
    return (
      <div className={styles.stack}>
        <Card>
          <p className={styles.lead}>Document not found.</p>
          <Link to="/kmt/knowledge/archived">
            <Button variant="secondary" type="button">
              Archived documents
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!doc.pendingArchive) {
    return (
      <div className={styles.stack}>
        <Card>
          <h1 className={styles.title}>{doc.name}</h1>
          <p className={styles.lead}>No pending archive request on this document.</p>
          <Link to="/kmt/knowledge/archived">
            <Button variant="secondary" type="button">
              Archived documents
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/kmt/knowledge/archived" label="Archived library" />
        <h1 className={styles.title}>Archive approval</h1>
        <p className={styles.lead}>Confirm archival — document becomes read-only and cloneable.</p>

        <div className={pageStyles.versionBlock}>
          <h2 className={pageStyles.versionTitle}>Version history (demo)</h2>
          <ul className={pageStyles.versionList}>
            <li>
              <strong>v{doc.version}</strong> — current published revision (pre-archive)
            </li>
            <li>Prior revisions would list here from audit API.</li>
          </ul>
        </div>

        <div className={pageStyles.summary}>
          <div className={pageStyles.row}>
            <span className={pageStyles.k}>Document</span>
            <span>{doc.name}</span>
          </div>
          <div className={pageStyles.row}>
            <span className={pageStyles.k}>POC owner</span>
            <span>{doc.ownerName ?? '—'}</span>
          </div>
          <div className={pageStyles.row}>
            <span className={pageStyles.k}>Version</span>
            <span>{doc.version}</span>
          </div>
          <div className={pageStyles.row}>
            <span className={pageStyles.k}>Archive reason</span>
            <span className={pageStyles.reason}>{doc.pendingArchive.reason}</span>
          </div>
          <div className={pageStyles.row}>
            <span className={pageStyles.k}>Requested</span>
            <span>{new Date(doc.pendingArchive.at).toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.row}>
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              approveArchive(doc.id)
              navigate('/kmt/knowledge/archived')
            }}
          >
            Approve archive
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              rejectArchiveRequest(doc.id)
              navigate('/kmt/knowledge/archived')
            }}
          >
            Reject archive
          </Button>
        </div>

      </Card>
    </div>
  )
}
