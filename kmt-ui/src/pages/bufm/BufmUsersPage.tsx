import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { Badge, type BadgeTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { BUFM_SAMPLE_POC_USERS } from '../../context/bufmSampleUsers'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import type { BufmPocUser, BufmPocUserStatus } from '../../types/bufmTeam'
import type { PocDocument } from '../../types/pocDocument'
import styles from '../shared/rolePages.module.css'
import dashStyles from './BufmDashboardPage.module.css'
import pageStyles from './BufmUsersPage.module.css'
import { BufmPocDocumentPreviewModal } from './BufmPocDocumentPreviewModal'

function knowledgeStatusTone(d: PocDocument): BadgeTone {
  switch (d.status) {
    case 'draft':
      return 'draft'
    case 'in_review':
      return 'new'
    case 'rejected':
      return 'rejected'
    case 'awaiting_kmt':
      return 'awaiting'
    case 'published':
      return 'published'
    case 'archived':
      return 'archived'
    default:
      return 'new'
  }
}

function knowledgeStatusLabel(d: PocDocument): string {
  if (d.status === 'in_review') return 'Pending BUFM'
  if (d.status === 'awaiting_kmt') return 'Awaiting KMT'
  if (d.status === 'rejected') return 'Rejected'
  if (d.status === 'published') return 'Published'
  if (d.status === 'archived') return 'Archived'
  if (d.status === 'draft') return 'Draft'
  return d.status
}

function userPresenceTone(s: BufmPocUserStatus): BadgeTone {
  if (s === 'active') return 'published'
  if (s === 'away') return 'warn'
  return 'archived'
}

function userPresenceLabel(s: BufmPocUserStatus): string {
  if (s === 'active') return 'Active'
  if (s === 'away') return 'Away'
  return 'Offline'
}

export function BufmUsersPage() {
  const { documents } = usePocDocuments()
  const [selectedId, setSelectedId] = useState<string>(BUFM_SAMPLE_POC_USERS[0]?.id ?? '')
  const [previewDocId, setPreviewDocId] = useState<string | null>(null)

  const byOwner = useMemo(() => {
    const m = new Map<string, PocDocument[]>()
    for (const u of BUFM_SAMPLE_POC_USERS) {
      m.set(
        u.name,
        documents.filter((d) => (d.ownerName ?? '').trim() === u.name),
      )
    }
    return m
  }, [documents])

  const selected = useMemo(
    () => BUFM_SAMPLE_POC_USERS.find((u) => u.id === selectedId),
    [selectedId],
  )

  const selectedDocs = selected ? byOwner.get(selected.name) ?? [] : []

  const onSelectUser = useCallback((u: BufmPocUser) => {
    setSelectedId(u.id)
  }, [])

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/bufm/dashboard" label="BUFM dashboard" />
        <h1 className={styles.title}>POC user directory</h1>
        <p className={styles.lead}>
          Sample roster with live document assignments. Counts, statuses, and comments stay in sync
          across BUFM, POC, and KMT via shared document storage (including new submissions from POC).
        </p>

        <div className={pageStyles.grid}>
          <div className={pageStyles.roster}>
            <h2 className={styles.h2}>Users</h2>
            <div className={dashStyles.tableWrap}>
              <table className={dashStyles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Region</th>
                    <th>Presence</th>
                    <th>Documents</th>
                    <th aria-label="Select user" />
                  </tr>
                </thead>
                <tbody>
                  {BUFM_SAMPLE_POC_USERS.map((u) => {
                    const n = byOwner.get(u.name)?.length ?? 0
                    const isOn = u.id === selectedId
                    return (
                      <tr key={u.id} className={isOn ? pageStyles.rowSelected : undefined}>
                        <td>
                          <span className={pageStyles.nameCell}>{u.name}</span>
                          <span className={pageStyles.subMuted}>{u.title}</span>
                        </td>
                        <td>{u.region}</td>
                        <td>
                          <Badge tone={userPresenceTone(u.status)}>{userPresenceLabel(u.status)}</Badge>
                        </td>
                        <td>
                          <strong>{n}</strong>
                        </td>
                        <td>
                          <Button
                            variant={isOn ? 'primary' : 'secondary'}
                            type="button"
                            size="sm"
                            onClick={() => onSelectUser(u)}
                            aria-pressed={isOn}
                          >
                            {isOn ? 'Selected' : 'Select'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={pageStyles.detail}>
            {selected ? (
              <>
                <h2 className={styles.h2}>Profile</h2>
                <div className={pageStyles.profileCard}>
                  <div className={pageStyles.profileHead}>
                    <span className={pageStyles.profileName}>{selected.name}</span>
                    <Badge tone={userPresenceTone(selected.status)}>
                      {userPresenceLabel(selected.status)}
                    </Badge>
                  </div>
                  <dl className={pageStyles.dl}>
                    <div>
                      <dt>Email</dt>
                      <dd>{selected.email}</dd>
                    </div>
                    <div>
                      <dt>Region</dt>
                      <dd>{selected.region}</dd>
                    </div>
                    <div>
                      <dt>Role</dt>
                      <dd>{selected.title}</dd>
                    </div>
                  </dl>
                </div>

                <h2 className={`${styles.h2} ${pageStyles.docsHeading}`}>Assigned documents</h2>
                {selectedDocs.length === 0 ? (
                  <p className={styles.meta}>No documents for this owner in the shared store yet.</p>
                ) : (
                  <ul className={pageStyles.docList}>
                    {selectedDocs.map((d) => (
                      <li key={d.id} className={pageStyles.docCard}>
                        <div className={pageStyles.docCardTop}>
                          <span className={pageStyles.docTitle}>{d.name}</span>
                          <Badge tone={knowledgeStatusTone(d)}>{knowledgeStatusLabel(d)}</Badge>
                        </div>
                        <div className={pageStyles.docMeta}>
                          v{d.version} · updated {new Date(d.updatedAt).toLocaleString()}
                        </div>
                        <div className={pageStyles.docActions}>
                          <Button
                            variant="secondary"
                            type="button"
                            size="sm"
                            onClick={() => setPreviewDocId(d.id)}
                          >
                            Preview
                          </Button>
                          {d.status === 'in_review' ? (
                            <Link to={`/bufm/review/${d.id}`}>
                              <Button variant="primary" type="button" size="sm">
                                Review
                              </Button>
                            </Link>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className={styles.meta}>Select a user from the list.</p>
            )}

          </div>
        </div>
      </Card>

      <BufmPocDocumentPreviewModal
        docId={previewDocId}
        open={Boolean(previewDocId)}
        onClose={() => setPreviewDocId(null)}
      />
    </div>
  )
}
