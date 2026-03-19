import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { KmtGovernanceReviewCenter } from '../../components/kmt/KmtGovernanceReviewCenter'
import { PageBackBar } from '../../components/layout/PageBackBar'
import floatStyles from '../../components/poc/ReviewerFloatAside.module.css'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import pageStyles from './KmtFinalReviewPage.module.css'

export function KmtFinalReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getById, approveByKmt, rejectByKmt, addDocumentReviewComment, updateDocumentReviewComment } =
    usePocDocuments()
  const [comment, setComment] = useState('')
  const [rejectErr, setRejectErr] = useState(false)
  const [commentPostVersion, setCommentPostVersion] = useState(0)
  const [showPosted, setShowPosted] = useState(false)
  const [editConfirmOpen, setEditConfirmOpen] = useState(false)
  const [negConcurrent, setNegConcurrent] = useState(false)
  const [negBufm, setNegBufm] = useState(false)
  const [negDep, setNegDep] = useState(false)

  const doc = useMemo(() => (id ? getById(id) : undefined), [getById, id])

  useEffect(() => {
    if (commentPostVersion === 0) return
    setShowPosted(true)
    const t = globalThis.setTimeout(() => setShowPosted(false), 6000)
    return () => globalThis.clearTimeout(t)
  }, [commentPostVersion])

  const onPublish = useCallback(() => {
    if (!doc) return
    approveByKmt(doc.id)
    navigate(`/kmt/published/${doc.id}`)
  }, [approveByKmt, doc, navigate])

  const onReject = useCallback(() => {
    if (!doc) return
    const t = comment.trim()
    if (!t) {
      setRejectErr(true)
      return
    }
    setRejectErr(false)
    rejectByKmt(doc.id, t)
    navigate('/kmt/knowledge/review')
  }, [comment, doc, navigate, rejectByKmt])

  const onSubmitCommentToPoc = useCallback(() => {
    if (!doc) return
    const t = comment.trim()
    if (!t) return
    addDocumentReviewComment(doc.id, 'KMT', t, user?.name)
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

  if (doc.status !== 'awaiting_kmt') {
    return (
      <div className={styles.stack}>
        <Card>
          <PageBackBar to="/kmt/knowledge/review" label="Review queue" />
          <h1 className={styles.title}>{doc.name}</h1>
          <p className={styles.lead}>
            KMT review workspace only when status is <strong>awaiting_kmt</strong> (current:{' '}
            <strong>{doc.status}</strong>).
          </p>
          <Link to="/kmt/knowledge/review">
            <Button variant="secondary" type="button">
              Review queue
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const statusTone =
    doc.status === 'awaiting_kmt' ? 'awaiting' : doc.status === 'published' ? 'published' : 'draft'

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/kmt/knowledge/review" label="Review queue" />
        <h1 className={styles.title}>KMT review workspace</h1>
        <p className={styles.lead}>{doc.name}</p>

        <div className={pageStyles.statusStrip}>
          <Badge tone={statusTone}>Awaiting KMT</Badge>
          <span className={pageStyles.verBadge}>v{doc.version}</span>
          <span className={pageStyles.expiryPill}>
            Expiry: {doc.expiryDate ?? 'Assigned at publish'}
          </span>
        </div>

        <div className={pageStyles.negPanel}>
          <p className={pageStyles.negTitle}>Negative states (demo toggles)</p>
          <div className={pageStyles.negGrid}>
            <button
              type="button"
              className={`${pageStyles.negChip} ${negConcurrent ? pageStyles.negChipOn : ''}`}
              onClick={() => setNegConcurrent((v) => !v)}
            >
              Concurrent edit lock
            </button>
            <button
              type="button"
              className={`${pageStyles.negChip} ${negBufm ? pageStyles.negChipOn : ''}`}
              onClick={() => setNegBufm((v) => !v)}
            >
              Missing BUFM approval
            </button>
            <button
              type="button"
              className={`${pageStyles.negChip} ${negDep ? pageStyles.negChipOn : ''}`}
              onClick={() => setNegDep((v) => !v)}
            >
              Dependency mismatch
            </button>
          </div>
          <p className={pageStyles.negHint}>
            Production would block actions when real locks or validation failures apply. Toggle chips to
            preview banner copy.
          </p>
        </div>

        {(negConcurrent || negBufm || negDep) && (
          <div className={pageStyles.warnBanner}>
            {negConcurrent ? (
              <p>
                <strong>Concurrent edit:</strong> another governance session holds a lock (simulated).
              </p>
            ) : null}
            {negBufm ? (
              <p>
                <strong>Missing BUFM approval:</strong> document should not publish until BUFM sign-off
                is reconciled.
              </p>
            ) : null}
            {negDep ? (
              <p>
                <strong>Dependency mismatch:</strong> RSAUI / field crosswalk does not match catalog
                rules.
              </p>
            ) : null}
          </div>
        )}

        <p className={pageStyles.intro}>
          <strong>Left:</strong> section navigation · <strong>Center:</strong> builder-style preview +
          Pulse · <strong>Right:</strong> comments and decisions. <strong>Edit</strong> opens template
          builder mode with a new minor version on save.
        </p>

        <div className={pageStyles.reviewSplit}>
          <div className={pageStyles.mainFlow}>
            <KmtGovernanceReviewCenter
              doc={doc}
              currentUserName={user?.name}
              threadEditRole="KMT"
              onUpdateThreadComment={onUpdateThreadComment}
            />
          </div>

          <aside className={floatStyles.floatAside} aria-label="KMT workflow and comment to POC">
            <h3 className={floatStyles.sideTitle}>Governance</h3>
            <p className={floatStyles.sideMuted}>
              Approve &amp; publish, reject, or comment. Edit structure in builder mode when needed.
            </p>

            <div className={floatStyles.composerBlock}>
              <h3 className={floatStyles.composerTitle}>Comment to POC</h3>
              <p className={floatStyles.composerHint}>
                Posts as <strong>KMT</strong>. <strong>Reject</strong> uses this text.
              </p>
              {showPosted ? (
                <div className={floatStyles.postedBanner} role="status">
                  <strong>Sent.</strong> POC sees this under Pulse.
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
                placeholder="Add a note for the POC (logged as KMT)…"
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
                <p className={floatStyles.pocNote}>Shared thread — instant in this demo.</p>
              </div>
            </div>

            <div className={floatStyles.actionsDivider}>
              <div className={floatStyles.actionsTitle}>Structure</div>
              <Button variant="secondary" type="button" onClick={() => setEditConfirmOpen(true)}>
                Edit document (builder)
              </Button>
            </div>

            <div className={floatStyles.actionsDivider}>
              <div className={floatStyles.actionsTitle}>Decision</div>
              {rejectErr ? <p className={floatStyles.err}>Comment required to reject.</p> : null}
              <div className={floatStyles.actions}>
                <Button
                  variant="primary"
                  type="button"
                  onClick={onPublish}
                  disabled={negConcurrent || negBufm || negDep}
                  title={
                    negConcurrent || negBufm || negDep
                      ? 'Resolve simulated negative checks to publish (demo).'
                      : undefined
                  }
                >
                  Approve &amp; publish
                </Button>
                <Button variant="danger" type="button" onClick={onReject}>
                  Reject to POC
                </Button>
                <Link to="/kmt/governance/templates/builder">
                  <Button variant="secondary" type="button">
                    Template builder
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Card>

      <Modal
        open={editConfirmOpen}
        title="Open template builder mode?"
        onClose={() => setEditConfirmOpen(false)}
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setEditConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                setEditConfirmOpen(false)
                navigate(`/kmt/document/${doc.id}`)
              }}
            >
              Continue
            </Button>
          </>
        }
      >
        <p className={styles.lead}>
          Editing will create a <strong>new minor version</strong> when you save from governance builder
          mode. Tabs, groups, fields, dependencies, and validation can be changed.
        </p>
      </Modal>
    </div>
  )
}
