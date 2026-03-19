import { useEffect, useState } from 'react'
import type { BuilderTab, PocDocument } from '../../types/pocDocument'
import { DOCUMENT_TEMPLATES } from '../../context/pocDocumentDefaults'
import { DocumentReadOnlyTabPanel } from './DocumentReadOnlyTabPanel'
import { PocPulseComments } from './PocPulseComments'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import pomStyles from './PocDocumentViewModal.module.css'
import styles from './KnowledgeReviewerExplorer.module.css'

function statusTone(s: PocDocument['status']) {
  if (s === 'draft') return 'draft'
  if (s === 'in_review' || s === 'awaiting_kmt') return 'awaiting'
  if (s === 'rejected') return 'rejected'
  if (s === 'archived') return 'archived'
  return 'published'
}

function statusLabel(s: PocDocument['status']) {
  if (s === 'in_review') return 'In review'
  if (s === 'awaiting_kmt') return 'Awaiting KMT'
  if (s === 'draft') return 'Draft'
  if (s === 'rejected') return 'Rejected'
  if (s === 'archived') return 'Archived'
  return 'Published'
}

function fieldCount(doc: PocDocument): number {
  return doc.tabs.reduce(
    (n, t) => n + t.groups.reduce((m, g) => m + g.fields.length, 0),
    0,
  )
}

function tabFieldCount(tab: BuilderTab): number {
  return tab.groups.reduce((n, g) => n + g.fields.length, 0)
}

export type ReviewerRoleLabel = 'BUFM' | 'KMT'

export type KnowledgeExplorerVariant = 'reviewer' | 'publishedViewer'

type KnowledgeReviewerExplorerProps =
  | {
      variant?: 'reviewer'
      doc: PocDocument
      currentUserName?: string
      comment: string
      onCommentChange: (value: string) => void
      onSubmitComment: () => void
      reviewerRole: ReviewerRoleLabel
      /** Increment after a successful `onSubmitComment` to flash POC notification. */
      commentPostVersion: number
      /** KMT/BUFM may revise their thread entries; POC sees updates live. */
      onUpdateThreadComment?: (commentId: string, body: string) => void
      /**
       * When false, the comment composer is not shown here (use the floating right panel on BUFM/KMT review pages).
       */
      embedComposer?: boolean
    }
  | {
      variant: 'publishedViewer'
      doc: PocDocument
      currentUserName?: string
    }

export function KnowledgeReviewerExplorer(props: KnowledgeReviewerExplorerProps) {
  const doc = props.doc
  const currentUserName = props.currentUserName
  const isViewer = props.variant === 'publishedViewer'
  const rp = props as Extract<KnowledgeReviewerExplorerProps, { variant?: 'reviewer' }>
  const comment = isViewer ? '' : rp.comment
  const onCommentChange = isViewer ? () => {} : rp.onCommentChange
  const onSubmitComment = isViewer ? () => {} : rp.onSubmitComment
  const reviewerRole = isViewer ? 'KMT' : rp.reviewerRole
  const commentPostVersion = isViewer ? 0 : rp.commentPostVersion
  const onUpdateThreadComment = isViewer ? undefined : rp.onUpdateThreadComment
  const embedComposer = !isViewer && rp.embedComposer !== false
  const [sectionIdx, setSectionIdx] = useState(0)
  const [showPosted, setShowPosted] = useState(false)

  useEffect(() => {
    setSectionIdx(0)
  }, [doc.id])

  useEffect(() => {
    if (!embedComposer || commentPostVersion === 0) return
    setShowPosted(true)
    const t = window.setTimeout(() => setShowPosted(false), 6000)
    return () => window.clearTimeout(t)
  }, [commentPostVersion, embedComposer])

  const templateName =
    DOCUMENT_TEMPLATES.find((t) => t.id === doc.documentTemplateId)?.name ?? doc.documentTemplateId
  const updated = new Date(doc.updatedAt).toLocaleString()
  const tabs = doc.tabs
  const safeIdx = tabs.length === 0 ? 0 : Math.min(sectionIdx, tabs.length - 1)
  const currentTab = tabs[safeIdx]

  return (
    <div className={styles.stack}>
      <div className={pomStyles.detailsCard}>
        <div className={pomStyles.detailsCardTitle}>Document details</div>
        <div className={pomStyles.grid}>
          <div>
            <div className={pomStyles.label}>Name</div>
            <div className={pomStyles.value}>{doc.name}</div>
          </div>
          <div>
            <div className={pomStyles.label}>Status</div>
            <Badge tone={statusTone(doc.status)}>{statusLabel(doc.status)}</Badge>
          </div>
          <div>
            <div className={pomStyles.label}>Document template</div>
            <div className={pomStyles.value}>{templateName}</div>
          </div>
          <div>
            <div className={pomStyles.label}>Version</div>
            <div className={pomStyles.value}>{doc.version}</div>
          </div>
          <div>
            <div className={pomStyles.label}>Last updated</div>
            <div className={pomStyles.value}>{updated}</div>
          </div>
          {doc.ownerName ? (
            <div>
              <div className={pomStyles.label}>Owner (POC)</div>
              <div className={pomStyles.value}>{doc.ownerName}</div>
            </div>
          ) : null}
          {doc.submittedAt ? (
            <div>
              <div className={pomStyles.label}>Submitted</div>
              <div className={pomStyles.value}>{new Date(doc.submittedAt).toLocaleString()}</div>
            </div>
          ) : null}
          {doc.bufmApprovedAt ? (
            <div>
              <div className={pomStyles.label}>BUFM approved</div>
              <div className={pomStyles.value}>{new Date(doc.bufmApprovedAt).toLocaleString()}</div>
            </div>
          ) : null}
          <div>
            <div className={pomStyles.label}>Fields</div>
            <div className={pomStyles.value}>{fieldCount(doc)} total</div>
          </div>
          <div>
            <div className={pomStyles.label}>RSAUI</div>
            <div className={pomStyles.value}>
              {doc.rsauiDependencyPending ? 'Dependency pending update' : 'No open dependency flag'}
            </div>
          </div>
        </div>
      </div>

      <div className={pomStyles.formExplore}>
        <div className={pomStyles.sectionLabel}>Form sections (read-only)</div>
        <p className={pomStyles.stepperHint}>
          Same layout as POC <strong>View details</strong>: pick a section, then scroll groups and
          values below.
        </p>
        {tabs.length > 0 ? (
          <>
            <div className={pomStyles.stepper} role="tablist" aria-label="Document sections">
              {tabs.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIdx}
                  className={`${pomStyles.step} ${i === safeIdx ? pomStyles.stepActive : ''}`}
                  onClick={() => setSectionIdx(i)}
                >
                  <span className={pomStyles.stepNum}>{i + 1}</span>
                  <span className={pomStyles.stepLabel}>{t.title}</span>
                  <span className={pomStyles.stepMeta}>
                    {t.groups.length} groups · {tabFieldCount(t)} fields
                  </span>
                </button>
              ))}
            </div>
            {currentTab ? (
              <>
                <div className={pomStyles.sectionHead}>
                  <h3 className={pomStyles.sectionTitle}>{currentTab.title}</h3>
                  <p className={pomStyles.sectionSub}>
                    {currentTab.groups.length} group{currentTab.groups.length === 1 ? '' : 's'} ·{' '}
                    {tabFieldCount(currentTab)} field{tabFieldCount(currentTab) === 1 ? '' : 's'} in
                    this section.
                  </p>
                </div>
                <div className={pomStyles.previewWrap}>
                  <DocumentReadOnlyTabPanel tab={currentTab} showTabTitle={false} />
                </div>
              </>
            ) : null}
          </>
        ) : (
          <p className={pomStyles.stepperHint}>This document has no sections.</p>
        )}

        {!isViewer && embedComposer ? (
          <div className={styles.composerCard}>
            <h3 className={styles.composerTitle}>Comment to POC</h3>
            {showPosted ? (
              <div className={styles.postedBanner} role="status">
                <strong>Sent.</strong> This message is on the shared document thread — the POC sees it
                under <strong>Knowledge Documents → View details → Pulse / Comments</strong> (same
                browser storage, updates live).
              </div>
            ) : null}
            <p className={styles.composerHint}>
              Posts appear as <strong>{reviewerRole}</strong> in the activity thread. Use{' '}
              <strong>Submit comment to POC</strong> for questions or notes; use workflow actions in
              the side panel to approve, reject, or publish. You can <strong>Edit</strong> your{' '}
              {reviewerRole} posts in Pulse below.
            </p>
            <textarea
              className={styles.textarea}
              rows={4}
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder={`Add a note for the POC (logged as ${reviewerRole})…`}
              aria-label="Comment to POC"
            />
            <div className={styles.composerActions}>
              <Button
                variant="primary"
                type="button"
                disabled={!comment.trim()}
                onClick={onSubmitComment}
              >
                Submit comment to POC
              </Button>
              <p className={styles.pocNote}>
                Notifies the document owner via the shared review thread (demo: instant in this
                browser; open POC in another tab to verify).
              </p>
            </div>
          </div>
        ) : !isViewer ? null : (
          <p className={styles.viewerNote}>
            Published read-only view — same section tabs and field layout as POC <strong>View details</strong>.
            Pulse shows the full approval history.
          </p>
        )}

        <div className={styles.pulseWrap}>
          <PocPulseComments
            doc={doc}
            currentUserName={currentUserName}
            threadEdit={
              onUpdateThreadComment
                ? { role: reviewerRole, onSave: onUpdateThreadComment }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  )
}
