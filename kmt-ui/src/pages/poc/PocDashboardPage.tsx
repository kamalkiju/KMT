import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PocDocumentViewModal } from '../../components/poc/PocDocumentViewModal'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import type { BadgeTone } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import type { PocDocument } from '../../types/pocDocument'
import styles from './PocDashboardPage.module.css'

type TabKey = 'tasks' | 'draft' | 'awaiting' | 'all' | 'archived'

const TAB_LABEL: Record<TabKey, string> = {
  tasks: 'My Tasks',
  draft: 'Draft Documents',
  awaiting: 'Awaiting Approval',
  all: 'All Documents',
  archived: 'Archived',
}

function fieldCount(doc: PocDocument): number {
  return doc.tabs.reduce(
    (n, t) => n + t.groups.reduce((m, g) => m + g.fields.length, 0),
    0,
  )
}

function progressPct(doc: PocDocument): number {
  const n = fieldCount(doc)
  return Math.min(100, Math.round((n / 12) * 100))
}

function statusTone(s: PocDocument['status']): BadgeTone {
  if (s === 'draft') return 'draft'
  if (s === 'in_review' || s === 'awaiting_kmt') return 'awaiting'
  if (s === 'rejected') return 'rejected'
  if (s === 'archived') return 'archived'
  return 'published'
}

function statusLabel(s: PocDocument['status']): string {
  if (s === 'in_review') return 'In review'
  if (s === 'awaiting_kmt') return 'Awaiting KMT'
  if (s === 'draft') return 'Draft'
  if (s === 'rejected') return 'Rejected'
  if (s === 'archived') return 'Archived'
  return 'Published'
}

function isAwaitingApproval(doc: PocDocument): boolean {
  return doc.status === 'in_review' || doc.status === 'awaiting_kmt'
}

function flowHint(doc: PocDocument): string {
  if (doc.status === 'draft') return 'Saved as draft — not submitted for BUFM review.'
  if (doc.status === 'in_review') return 'Submitted for approval — awaiting BUFM.'
  if (doc.status === 'awaiting_kmt') return 'BUFM approved — awaiting KMT governance publish.'
  if (doc.status === 'rejected') {
    const k = doc.kmtComment?.trim()
    const b = doc.bufmComment?.trim()
    const line = k || b
    if (line) return line.length > 90 ? `${line.slice(0, 90)}…` : line
    return 'Rejected — see BUFM/KMT feedback in document details.'
  }
  if (doc.status === 'archived') return 'Archived — read-only; clone to create a new draft.'
  return 'Published — visible in your catalog for this demo.'
}

function matchesTab(doc: PocDocument, tab: TabKey): boolean {
  if (tab === 'all') return true
  if (tab === 'tasks') return doc.status === 'rejected'
  if (tab === 'draft') return doc.status === 'draft'
  if (tab === 'awaiting') return doc.status === 'in_review' || doc.status === 'awaiting_kmt'
  if (tab === 'archived') return doc.status === 'archived'
  return false
}

function excerptText(text: string, max = 260): string {
  const x = text.replace(/\s+/g, ' ').trim()
  if (x.length <= max) return x
  return `${x.slice(0, max)}…`
}

/** Pull first Notes body for card previews (sample drafts / queues include long narrative blocks). */
function firstNarrativeExcerpt(doc: PocDocument): string | null {
  for (const t of doc.tabs) {
    for (const g of t.groups) {
      for (const f of g.fields) {
        if (f.kind === 'Notes' && f.description?.trim()) {
          return excerptText(f.description.trim(), 280)
        }
      }
    }
  }
  return null
}

export function PocDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { documents, cloneDocument, deleteDocument } = usePocDocuments()
  const [tab, setTab] = useState<TabKey>('all')
  const [viewDoc, setViewDoc] = useState<PocDocument | null>(null)

  const myDocuments = useMemo(() => {
    const name = user?.name?.trim()
    if (!name) return documents
    return documents.filter((d) => !d.ownerName || d.ownerName === name)
  }, [documents, user?.name])

  const rows = useMemo(
    () => myDocuments.filter((d) => matchesTab(d, tab)),
    [myDocuments, tab],
  )

  const kpis = useMemo(() => {
    const tasks = myDocuments.filter((d) => d.status === 'rejected').length
    const drafts = myDocuments.filter((d) => d.status === 'draft').length
    const awaiting = myDocuments.filter(
      (d) => d.status === 'in_review' || d.status === 'awaiting_kmt',
    ).length
    const published = myDocuments.filter((d) => d.status === 'published').length
    return [
      { label: 'My tasks', value: String(tasks) },
      { label: 'Drafts', value: String(drafts) },
      { label: 'Awaiting approval', value: String(awaiting) },
      { label: 'Published', value: String(published) },
    ]
  }, [myDocuments])

  const empty = rows.length === 0
  const useCardLayout = tab === 'tasks' || tab === 'awaiting' || tab === 'draft'

  const renderRowActions = (r: PocDocument) => {
    const awaiting = isAwaitingApproval(r)
    const canEdit = r.status === 'draft' || r.status === 'rejected'
    const showDelete = !awaiting

    return (
      <div className={styles.rowActions}>
        <Button
          variant={awaiting ? 'primary' : 'secondary'}
          size="sm"
          type="button"
          onClick={() => setViewDoc(r)}
        >
          View details
        </Button>
        {canEdit ? (
          <Link to={`/poc/document/${r.id}`}>
            <Button variant="ghost" size="sm" type="button">
              Edit
            </Button>
          </Link>
        ) : null}
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => {
            const c = cloneDocument(r.id)
            if (c) navigate(`/poc/document/${c.id}`)
          }}
        >
          Clone
        </Button>
        {showDelete ? (
          <Button
            variant="danger"
            size="sm"
            type="button"
            onClick={() => {
              if (window.confirm(`Delete “${r.name}”?`)) deleteDocument(r.id)
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <PocDocumentViewModal doc={viewDoc} onClose={() => setViewDoc(null)} />

      <div className={styles.kpis}>
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpi}>
            <div className={styles.kpiLabel}>{k.label}</div>
            <div className={styles.kpiValue}>{k.value}</div>
          </div>
        ))}
      </div>

      <p className={styles.realtimeHint}>
        <strong>Realtime demo:</strong> Lists reflect the same browser storage as BUFM/KMT. Sample rows
        below (for <strong>John Smith</strong>) load on a fresh database key; your edits, saves, and
        submissions merge in live. Use <strong>View details</strong> for read-only previews —{' '}
        <strong>Edit</strong> opens the builder (drafts &amp; rejected only).
      </p>

      <div className={styles.toolbar}>
        <Link to="/poc/document/new">
          <Button variant="primary">Create Knowledge Document</Button>
        </Link>
      </div>

      <div className={styles.tabs}>
        {(Object.keys(TAB_LABEL) as TabKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
            onClick={() => setTab(key)}
          >
            {TAB_LABEL[key]}
          </button>
        ))}
      </div>

      {empty ? (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>No documents in this view</div>
          <p>Create a document, save as draft, then submit for approval to appear on BUFM.</p>
          <Link to="/poc/document/new">
            <Button variant="primary">Create Knowledge Document</Button>
          </Link>
        </div>
      ) : useCardLayout ? (
        <>
          {tab === 'draft' ? (
            <p className={styles.listHint}>
              <strong>Draft documents</strong> — View details shows the full read-only form preview and
              metadata. Use Edit to change structure and fields in the builder.
            </p>
          ) : null}
          {tab === 'awaiting' ? (
            <p className={styles.listHint}>
              <strong>Awaiting approval</strong> — BUFM or KMT is reviewing. View details only here (no
              editing until the workflow returns a draft or rejection).
            </p>
          ) : null}
          {tab === 'tasks' ? (
            <p className={styles.listHint}>
              <strong>Rejected — My tasks</strong> — Full BUFM/KMT comments and thread below each card.
              Edit to fix and resubmit, or Clone to branch a new draft.
            </p>
          ) : null}
          <ul className={styles.docCardList}>
            {rows.map((doc) => (
              <li key={doc.id} className={styles.docCard}>
                <div className={styles.docCardTop}>
                  <div>
                    <h3 className={styles.docCardTitle}>{doc.name}</h3>
                    <div className={styles.docCardMeta}>
                      <Badge tone={statusTone(doc.status)}>{statusLabel(doc.status)}</Badge>
                      <span className={styles.docCardUpdated}>
                        Updated {new Date(doc.updatedAt).toLocaleString()} · v{doc.version} ·{' '}
                        {fieldCount(doc)} fields
                      </span>
                    </div>
                  </div>
                  <div className={styles.docCardActions}>{renderRowActions(doc)}</div>
                </div>
                <p className={styles.docCardExcerpt}>
                  {firstNarrativeExcerpt(doc) ?? excerptText(flowHint(doc), 240)}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Document name</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Workflow</th>
                <th className={styles.th}>Progress</th>
                <th className={styles.th}>Last updated</th>
                <th className={styles.th}>Version</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className={styles.td}>{r.name}</td>
                  <td className={styles.td}>
                    <Badge tone={statusTone(r.status)}>{statusLabel(r.status)}</Badge>
                  </td>
                  <td className={`${styles.td} ${styles.flowHint}`}>{flowHint(r)}</td>
                  <td className={styles.td}>{progressPct(r)}%</td>
                  <td className={styles.td}>{new Date(r.updatedAt).toLocaleString()}</td>
                  <td className={styles.td}>{r.version}</td>
                  <td className={styles.td}>{renderRowActions(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
