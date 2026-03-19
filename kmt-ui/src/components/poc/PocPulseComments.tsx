import { useMemo, useState } from 'react'
import type { PocDocument } from '../../types/pocDocument'
import type { ReviewCommentRole } from '../../types/review'
import { Button } from '../ui/Button'
import styles from './PocPulseComments.module.css'

interface FeedLine {
  id: string
  kind: 'system' | 'comment'
  title: string
  body: string
  at: string
  badge?: string
  italic?: boolean
  commentRole?: ReviewCommentRole
  editedAt?: string
  authorName?: string
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/)
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

function CommentThreadRow({
  line,
  threadEdit,
  compact,
  editingId,
  editDraft,
  onStartEdit,
  onCancelEdit,
  onDraftChange,
  onSaveEdit,
}: {
  line: FeedLine
  threadEdit?: { role: 'BUFM' | 'KMT'; onSave: (commentId: string, body: string) => void }
  compact: boolean
  editingId: string | null
  editDraft: string
  onStartEdit: () => void
  onCancelEdit: () => void
  onDraftChange: (v: string) => void
  onSaveEdit: () => void
}) {
  const avatarLabel = line.authorName?.trim() || line.commentRole || line.title
  const canEdit = Boolean(
    threadEdit && line.commentRole === threadEdit.role && !compact,
  )
  const isEditing = editingId === line.id

  return (
    <div className={styles.sysRow}>
      <div className={styles.userAvatar}>{initials(avatarLabel)}</div>
      <div className={styles.sysBody}>
        <div className={styles.metaRow}>
          <strong>{line.title}</strong>
          <span className={styles.time}>🕐 {new Date(line.at).toLocaleString()}</span>
          {line.editedAt ? (
            <span className={styles.editedPill} title={new Date(line.editedAt).toLocaleString()}>
              Edited
            </span>
          ) : null}
          {canEdit && !isEditing ? (
            <button type="button" className={styles.editLink} onClick={onStartEdit}>
              Edit
            </button>
          ) : null}
        </div>
        {isEditing ? (
          <div className={styles.editBox}>
            <textarea
              className={styles.editTextarea}
              rows={4}
              value={editDraft}
              onChange={(e) => onDraftChange(e.target.value)}
              aria-label="Edit comment"
            />
            <div className={styles.editActions}>
              <Button variant="secondary" type="button" size="sm" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="button"
                size="sm"
                disabled={!editDraft.trim()}
                onClick={onSaveEdit}
              >
                Save update
              </Button>
            </div>
            <p className={styles.editHint}>POC sees the updated text on the shared thread.</p>
          </div>
        ) : (
          <p className={styles.text}>{line.body}</p>
        )}
      </div>
    </div>
  )
}

export function PocPulseComments({
  doc,
  currentUserName,
  compact = false,
  threadEdit,
}: {
  doc: PocDocument
  currentUserName?: string
  /** Tighter layout for task cards (truncated feed, no composer). */
  compact?: boolean
  /** Allow BUFM/KMT to revise their own thread posts (demo). */
  threadEdit?: {
    role: 'BUFM' | 'KMT'
    onSave: (commentId: string, body: string) => void
  }
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const lines = useMemo((): FeedLine[] => {
    const out: FeedLine[] = []
    const owner = doc.ownerName?.trim() || 'POC author'

    out.push({
      id: `${doc.id}-created`,
      kind: 'system',
      title: 'System',
      body: `Document created by ${owner}.`,
      at: doc.submittedAt || doc.updatedAt,
      badge: 'System',
      italic: true,
    })

    if (doc.submittedAt) {
      out.push({
        id: `${doc.id}-sub`,
        kind: 'system',
        title: 'System',
        body: `Submitted for BUFM review by ${owner}.`,
        at: doc.submittedAt,
        badge: 'Workflow',
      })
    }

    if (doc.bufmRejectedAt && doc.bufmComment?.trim()) {
      out.push({
        id: `${doc.id}-bufm`,
        kind: 'system',
        title: 'BUFM',
        body: doc.bufmComment.trim(),
        at: doc.bufmRejectedAt,
        badge: 'Rejected',
      })
    }

    if (doc.kmtRejectedAt && doc.kmtComment?.trim()) {
      out.push({
        id: `${doc.id}-kmt`,
        kind: 'system',
        title: 'KMT',
        body: doc.kmtComment.trim(),
        at: doc.kmtRejectedAt,
        badge: 'Rejected',
      })
    }

    for (const c of doc.reviewThread ?? []) {
      out.push({
        id: c.id,
        kind: 'comment',
        title: c.authorName?.trim() ? `${c.role} · ${c.authorName.trim()}` : c.role,
        body: c.body,
        at: c.at,
        badge: c.role,
        commentRole: c.role,
        editedAt: c.editedAt,
        authorName: c.authorName,
      })
    }

    out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    return out
  }, [doc])

  const count = lines.length
  const displayLines = compact ? lines.slice(0, 6) : lines
  const displayName = currentUserName?.trim() || 'You'
  const Heading = compact ? 'h3' : 'h2'

  return (
    <section
      className={`${styles.card} ${compact ? styles.cardCompact : ''}`}
      aria-label="Pulse and comments"
    >
      <header className={`${styles.head} ${compact ? styles.headCompact : ''}`}>
        <div className={styles.headTitle}>
          <span className={styles.bubbleIcon} aria-hidden>
            💬
          </span>
          <Heading className={styles.title}>
            Pulse / Comments <span className={styles.count}>({count})</span>
          </Heading>
        </div>
        {!compact ? (
          <p className={styles.sub}>Document activity log and reviewer feedback</p>
        ) : (
          <p className={styles.subCompact}>Latest activity &amp; reviewer notes</p>
        )}
      </header>

      <ul className={`${styles.feed} ${compact ? styles.feedCompact : ''}`}>
        {displayLines.map((line) => (
          <li key={line.id} className={styles.feedItem}>
            {line.kind === 'system' ? (
              <div className={styles.sysRow}>
                <div className={styles.sysAvatar} aria-hidden>
                  📄
                </div>
                <div className={styles.sysBody}>
                  <div className={styles.metaRow}>
                    <strong>{line.title}</strong>
                    <span className={styles.time}>🕐 {new Date(line.at).toLocaleString()}</span>
                    {line.badge ? <span className={styles.pill}>{line.badge}</span> : null}
                  </div>
                  <p className={line.italic ? styles.italic : styles.text}>{line.body}</p>
                </div>
              </div>
            ) : (
              <CommentThreadRow
                line={line}
                threadEdit={threadEdit}
                compact={compact}
                editingId={editingId}
                editDraft={editDraft}
                onStartEdit={() => {
                  setEditingId(line.id)
                  setEditDraft(line.body)
                }}
                onCancelEdit={() => {
                  setEditingId(null)
                  setEditDraft('')
                }}
                onDraftChange={setEditDraft}
                onSaveEdit={() => {
                  if (!threadEdit || editingId !== line.id) return
                  threadEdit.onSave(line.id, editDraft)
                  setEditingId(null)
                  setEditDraft('')
                }}
              />
            )}
          </li>
        ))}
      </ul>

      {compact && lines.length > displayLines.length ? (
        <p className={styles.moreHint}>Open View details for the full thread.</p>
      ) : null}

      {!compact ? (
      <footer className={styles.composer}>
        <div className={styles.userAvatar}>{initials(displayName)}</div>
        <div className={styles.composerInner}>
          <textarea
            className={styles.composerInput}
            placeholder="Add a comment…"
            rows={2}
            disabled
            title="Comments from the dashboard are view-only in this demo; edit the document to respond."
          />
          <div className={styles.composerFoot}>
            <span className={styles.composerHint}>
              BUFM and KMT rejections appear above. Edit the document to address feedback and resubmit.
            </span>
            <button type="button" className={styles.postBtn} disabled>
              Post comment
            </button>
          </div>
        </div>
      </footer>
      ) : null}
    </section>
  )
}
