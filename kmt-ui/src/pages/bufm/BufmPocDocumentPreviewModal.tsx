import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentReadOnlyView } from '../../components/poc/DocumentReadOnlyView'
import { PocPulseComments } from '../../components/poc/PocPulseComments'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import formStyles from '../../components/ui/FormField.module.css'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { DOCUMENT_TEMPLATES } from '../../context/pocDocumentDefaults'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import type { PocDocument } from '../../types/pocDocument'
import reviewStyles from './BufmReviewPage.module.css'
import styles from './BufmPocDocumentPreviewModal.module.css'

function docStatusLabel(d: PocDocument): string {
  if (d.status === 'in_review') return 'Pending BUFM'
  if (d.status === 'awaiting_kmt') return 'Awaiting KMT'
  if (d.status === 'rejected') return 'Rejected'
  if (d.status === 'published') return 'Published'
  if (d.status === 'archived') return 'Archived'
  if (d.status === 'draft') return 'Draft'
  return d.status
}

interface BufmPocDocumentPreviewModalProps {
  docId: string | null
  open: boolean
  onClose: () => void
}

export function BufmPocDocumentPreviewModal({ docId, open, onClose }: BufmPocDocumentPreviewModalProps) {
  const { user } = useAuth()
  const { getById, addDocumentReviewComment, updateDocumentReviewComment } = usePocDocuments()
  const [comment, setComment] = useState('')

  const doc = useMemo(() => (docId ? getById(docId) : undefined), [docId, getById])

  useEffect(() => {
    if (!open) setComment('')
  }, [open])

  const templateName = useMemo(() => {
    if (!doc) return ''
    return (
      DOCUMENT_TEMPLATES.find((t) => t.id === doc.documentTemplateId)?.name ?? doc.documentTemplateId
    )
  }, [doc])

  const onSend = useCallback(() => {
    if (!doc) return
    const trimmed = comment.trim()
    if (!trimmed) return
    addDocumentReviewComment(doc.id, 'BUFM', trimmed, user?.name)
    setComment('')
  }, [addDocumentReviewComment, comment, doc, user?.name])

  const onUpdateThreadComment = useCallback(
    (commentId: string, body: string) => {
      if (!doc) return
      updateDocumentReviewComment(doc.id, commentId, body)
    },
    [doc, updateDocumentReviewComment],
  )

  return (
    <Modal
      open={open && Boolean(docId)}
      title={doc?.name ? `${doc.name} · Preview` : 'Document preview'}
      onClose={onClose}
      wide
      footer={
        <div className={styles.footerRow}>
          <div className={styles.footerLeft}>
            {doc?.status === 'in_review' ? (
              <Link to={`/bufm/review/${doc.id}`} onClick={onClose}>
                <Button variant="primary" type="button">
                  Open full review
                </Button>
              </Link>
            ) : null}
          </div>
          <div className={styles.footerRight}>
            <Button variant="secondary" type="button" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      {!doc ? (
        <p className={reviewStyles.muted}>Document not found or was removed.</p>
      ) : (
        <>
          <button type="button" className={styles.modalBack} onClick={onClose}>
            ← Back
          </button>
          <div className={styles.layout}>
            <div className={styles.meta}>
              <span className={reviewStyles.templatePill}>{templateName}</span>
              <span className={reviewStyles.metaSmall}>
                v{doc.version} · {doc.ownerName ?? 'POC'} · {docStatusLabel(doc)}
              </span>
            </div>

            <div className={styles.splitRow}>
              <div className={styles.previewScroll}>
                <DocumentReadOnlyView doc={doc} />
              </div>

              <div className={styles.side}>
                <h3 className={reviewStyles.sideTitle}>BUFM quick comment</h3>
                <p className={reviewStyles.muted}>
                  Full Pulse / activity feed is below the preview. Use Send to append to the shared
                  thread.
                </p>
                <FormField label="BUFM comment">
                  <textarea
                    className={formStyles.textarea}
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a note for the thread. Other BUFM tabs update instantly via shared storage."
                  />
                </FormField>
                <div className={styles.sendRow}>
                  <Button variant="primary" type="button" onClick={onSend} disabled={!comment.trim()}>
                    Send
                  </Button>
                  <span className={styles.hint}>
                    Approve / reject from <strong>Open full review</strong> when status is pending BUFM.
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.pulseBelow}>
              <PocPulseComments
                doc={doc}
                currentUserName={user?.name}
                threadEdit={{ role: 'BUFM', onSave: onUpdateThreadComment }}
              />
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}
