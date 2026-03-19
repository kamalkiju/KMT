import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { KnowledgeReviewerExplorer } from '../../components/poc/KnowledgeReviewerExplorer'
import floatStyles from '../../components/poc/ReviewerFloatAside.module.css'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import pageStyles from './BufmReviewPage.module.css'

export function BufmReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getById, approveByBufm, rejectByBufm, addDocumentReviewComment, updateDocumentReviewComment } =
    usePocDocuments()
  const [comment, setComment] = useState('')
  const [rejectErr, setRejectErr] = useState(false)
  const [commentPostVersion, setCommentPostVersion] = useState(0)
  const [showPosted, setShowPosted] = useState(false)

  const doc = useMemo(() => (id ? getById(id) : undefined), [getById, id])

  useEffect(() => {
    if (commentPostVersion === 0) return
    setShowPosted(true)
    const t = globalThis.setTimeout(() => setShowPosted(false), 6000)
    return () => globalThis.clearTimeout(t)
  }, [commentPostVersion])

  const onApprove = useCallback(() => {
    if (!doc) return
    approveByBufm(doc.id)
    navigate('/bufm/dashboard')
  }, [approveByBufm, doc, navigate])

  const onReject = useCallback(() => {
    if (!doc) return
    const trimmed = comment.trim()
    if (!trimmed) {
      setRejectErr(true)
      return
    }
    setRejectErr(false)
    rejectByBufm(doc.id, trimmed)
    navigate('/bufm/dashboard')
  }, [comment, doc, navigate, rejectByBufm])

  const onSubmitCommentToPoc = useCallback(() => {
    if (!doc) return
    const trimmed = comment.trim()
    if (!trimmed) return
    addDocumentReviewComment(doc.id, 'BUFM', trimmed, user?.name)
    setComment('')
    setCommentPostVersion((v) => v + 1)
  }, [addDocumentReviewComment, comment, doc, user?.name])

  const onUpdateThreadComment = useCallback(
    (commentId: string, body: string) => {
      if (!doc) return
      updateDocumentReviewComment(doc.id, commentId, body)
    },
    [doc, updateDocumentReviewComment],
  )

  if (!id) {
    return (
      <div className={styles.stack}>
        <Card>
          <p className={styles.lead}>Missing document id.</p>
          <Link to="/bufm/dashboard">
            <Button variant="secondary" type="button">
              Back
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className={styles.stack}>
        <Card>
          <p className={styles.lead}>Document not found.</p>
          <Link to="/bufm/dashboard">
            <Button variant="secondary" type="button">
              Back
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (doc.status !== 'in_review') {
    return (
      <div className={styles.stack}>
        <Card>
          <h1 className={styles.title}>{doc.name}</h1>
          <p className={styles.lead}>
            Not in BUFM review queue (status: <strong>{doc.status}</strong>).
          </p>
          <Link to="/bufm/dashboard">
            <Button variant="secondary" type="button">
              Back
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/bufm/dashboard" label="BUFM dashboard" />
        <h1 className={styles.title}>Knowledge document review</h1>
        <p className={styles.lead}>
          Document preview and Pulse stay on the left. Use the <strong>floating panel on the right</strong>{' '}
          to add a POC comment, then <strong>Approve to KMT</strong> or <strong>Reject to POC</strong>{' '}
          (reject requires a comment in that panel).
        </p>

        <div className={pageStyles.reviewSplit}>
          <div className={pageStyles.mainFlow}>
            <KnowledgeReviewerExplorer
              doc={doc}
              currentUserName={user?.name}
              comment={comment}
              onCommentChange={(v) => {
                setComment(v)
                if (rejectErr && v.trim()) setRejectErr(false)
              }}
              onSubmitComment={onSubmitCommentToPoc}
              reviewerRole="BUFM"
              commentPostVersion={commentPostVersion}
              onUpdateThreadComment={onUpdateThreadComment}
              embedComposer={false}
            />
          </div>

          <aside className={floatStyles.floatAside} aria-label="Review actions and comment to POC">
            <div className={floatStyles.workflowBlock}>
              <h3 className={floatStyles.sideTitle}>Workflow</h3>
              <ol className={floatStyles.steps}>
                <li className={floatStyles.stepDone}>POC submitted</li>
                <li className={floatStyles.stepCurrent}>BUFM review</li>
                <li>KMT governance</li>
                <li>Published</li>
              </ol>
            </div>

            <div className={floatStyles.composerBlock}>
              <h3 className={floatStyles.composerTitle}>Comment to POC</h3>
              <p className={floatStyles.composerHint}>
                Posts as <strong>BUFM</strong> on the shared thread. <strong>Reject</strong> uses this
                text as the return reason.
              </p>
              {showPosted ? (
                <div className={floatStyles.postedBanner} role="status">
                  <strong>Sent.</strong> POC sees this under Knowledge Documents → View details → Pulse.
                </div>
              ) : null}
              <textarea
                className={floatStyles.textarea}
                rows={5}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value)
                  if (rejectErr && e.target.value.trim()) setRejectErr(false)
                }}
                placeholder="Add a note for the POC (logged as BUFM)…"
                aria-label="Comment to POC"
              />
              <div className={floatStyles.submitRow}>
                <Button
                  variant="secondary"
                  type="button"
                  disabled={!comment.trim()}
                  onClick={onSubmitCommentToPoc}
                >
                  Submit comment to POC
                </Button>
                <p className={floatStyles.pocNote}>
                  Notifies via the shared thread (demo: same browser storage).
                </p>
              </div>
            </div>

            <div className={floatStyles.actionsDivider}>
              <div className={floatStyles.actionsTitle}>Decision</div>
              {rejectErr ? <p className={floatStyles.err}>Enter a comment before rejecting.</p> : null}
              <div className={floatStyles.actions}>
                <Button variant="primary" type="button" onClick={onApprove}>
                  Approve to KMT
                </Button>
                <Button variant="danger" type="button" onClick={onReject}>
                  Reject to POC
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </Card>
    </div>
  )
}
