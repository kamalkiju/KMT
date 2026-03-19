import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { DocumentReadOnlyView } from '../../components/poc/DocumentReadOnlyView'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import pageStyles from './KmtGovernancePeekPage.module.css'

export function KmtGovernancePeekPage() {
  const { id } = useParams<{ id: string }>()
  const { getById } = usePocDocuments()
  const doc = useMemo(() => (id ? getById(id) : undefined), [getById, id])

  if (!id || !doc) {
    return (
      <div className={styles.stack}>
        <Card>
          <p className={styles.lead}>Document not found.</p>
          <Link to="/kmt/knowledge/review">
            <Button variant="secondary" type="button">
              Review queue
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/kmt/knowledge/review" label="Review queue" />
        <div className={pageStyles.head}>
          <h1 className={styles.title}>
            {doc.status === 'archived' ? 'Archived document' : 'Returned document'} (read-only)
          </h1>
          <Badge tone={doc.status === 'archived' ? 'archived' : 'rejected'}>
            {doc.status === 'archived' ? 'Archived' : 'Returned'}
          </Badge>
        </div>
        <p className={styles.lead}>{doc.name}</p>
        <p className={styles.meta}>
          POC revision path — full edit happens in the POC session. This peek is for KMT traceability.
        </p>
        <div className={pageStyles.preview}>
          <DocumentReadOnlyView doc={doc} />
        </div>
      </Card>
    </div>
  )
}
