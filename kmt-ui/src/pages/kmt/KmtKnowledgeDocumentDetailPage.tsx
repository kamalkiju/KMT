import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DocumentReadOnlyView } from '../../components/poc/DocumentReadOnlyView'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'
import { knowledgeBufmStatusLabel, templateDisplayName } from './kmtWorkflowLabels'
import type { PocDocument } from '../../types/pocDocument'

type TabId = 'overview' | 'structure' | 'fields' | 'bufm' | 'history'

function flattenFields(doc: PocDocument) {
  return doc.tabs.flatMap((t) =>
    t.groups.flatMap((g) => g.fields.map((f) => ({ tab: t.title, group: g.title, field: f }))),
  )
}

export function KmtKnowledgeDocumentDetailPage() {
  const { docId = '' } = useParams<{ docId: string }>()
  const navigate = useNavigate()
  const { getById, approveByKmt, rejectByKmt } = usePocDocuments()
  const [tab, setTab] = useState<TabId>('overview')

  const doc = useMemo(() => (docId ? getById(docId) : undefined), [docId, getById])
  const flatFields = useMemo(() => (doc ? flattenFields(doc) : []), [doc])

  if (!doc) {
    return (
      <div className={styles.stack}>
        <Card>
          <PageBackBar to="/kmt/knowledge/review" label="Review queue" />
          <p className={styles.lead}>Document not found.</p>
        </Card>
      </div>
    )
  }

  const canKmtAct = doc.status === 'awaiting_kmt'
  const bufmThread = (doc.reviewThread ?? []).filter((c) => c.role === 'BUFM')

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/kmt/knowledge/review" label="Review queue" />
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>{doc.name}</h1>
            <p className={styles.lead}>
              Template <strong>{templateDisplayName(doc.documentTemplateId)}</strong> · POC{' '}
              <strong>{doc.ownerName ?? '—'}</strong> · BUFM{' '}
              <span className={ent.badge}>{knowledgeBufmStatusLabel(doc)}</span>
            </p>
          </div>
          <div className={ent.actionRow}>
            {canKmtAct ? (
              <Link to={`/kmt/document/${doc.id}`}>
                <Button variant="secondary" type="button">
                  Edit
                </Button>
              </Link>
            ) : (
              <Button variant="secondary" type="button" disabled title="Open when in KMT queue">
                Edit
              </Button>
            )}
            <Button
              variant="success"
              type="button"
              disabled={!canKmtAct}
              onClick={() => {
                if (!canKmtAct) return
                if (globalThis.confirm(`Publish “${doc.name}” to the catalog?`)) {
                  approveByKmt(doc.id)
                  navigate('/kmt/knowledge/published')
                }
              }}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              type="button"
              disabled={!canKmtAct}
              onClick={() => {
                if (!canKmtAct) return
                const note = globalThis.prompt('Return message', 'Returned from KMT review (demo).')
                if (note === null) return
                rejectByKmt(doc.id, note.trim() || 'Returned from KMT review (demo).')
                navigate('/kmt/knowledge/review')
              }}
            >
              Send back
            </Button>
            <Link to={`/kmt/governance/templates/${doc.documentTemplateId}`}>
              <Button variant="ghost" type="button">
                Edit template
              </Button>
            </Link>
          </div>
        </header>

        <div className={ent.subTabs} role="tablist" aria-label="Document detail">
          {(
            [
              ['overview', 'Overview'],
              ['structure', 'Template structure'],
              ['fields', 'Fields'],
              ['bufm', 'BUFM comments'],
              ['history', 'Version history'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`${ent.subTab} ${tab === id ? ent.subTabOn : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' ? (
          <div className={ent.panelCol}>
            <ul className={ent.metaList}>
              <li>
                <strong>Status</strong>
                {doc.status.replace(/_/g, ' ')}
              </li>
              <li>
                <strong>Version</strong>
                {doc.version}
              </li>
              <li>
                <strong>Last updated</strong>
                {new Date(doc.updatedAt).toLocaleString()}
              </li>
              <li>
                <strong>Expiry</strong>
                {doc.expiryDate ?? '—'}
              </li>
            </ul>
            <div style={{ marginTop: 16, maxHeight: '55vh', overflow: 'auto' }}>
              <DocumentReadOnlyView doc={doc} />
            </div>
          </div>
        ) : null}

        {tab === 'structure' ? (
          <div className={ent.tableWrap}>
            <table className={ent.table}>
              <thead>
                <tr>
                  <th>Tab</th>
                  <th>Group</th>
                  <th>Columns</th>
                  <th>Fields</th>
                </tr>
              </thead>
              <tbody>
                {doc.tabs.map((t) =>
                  t.groups.map((g) => (
                    <tr key={`${t.id}-${g.id}`}>
                      <td>{t.title}</td>
                      <td>{g.title}</td>
                      <td>{g.columns}</td>
                      <td>{g.fields.length}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === 'fields' ? (
          <div className={ent.tableWrap}>
            <table className={ent.table}>
              <thead>
                <tr>
                  <th>Tab</th>
                  <th>Group</th>
                  <th>Label</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {flatFields.map(({ tab: tt, group, field }) => (
                  <tr key={field.id}>
                    <td>{tt}</td>
                    <td>{group}</td>
                    <td>{field.label}</td>
                    <td>{field.kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === 'bufm' ? (
          <div className={ent.panelCol}>
            {doc.bufmComment ? (
              <p className={styles.lead}>
                <strong>Latest BUFM note:</strong> {doc.bufmComment}
              </p>
            ) : (
              <p className={styles.meta}>No standalone BUFM comment field on this version.</p>
            )}
            <h3 className={ent.sectionTitle}>Thread (BUFM)</h3>
            {bufmThread.length === 0 ? (
              <p className={styles.meta}>No BUFM thread entries.</p>
            ) : (
              <ul className={ent.checkList}>
                {bufmThread.map((c) => (
                  <li key={c.id}>
                    <span>
                      {new Date(c.at).toLocaleString()} — {c.body}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {tab === 'history' ? (
          <div className={ent.tableWrap}>
            <table className={ent.table}>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Updated</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{doc.version}</td>
                  <td>{new Date(doc.updatedAt).toLocaleString()}</td>
                  <td>Current revision (demo stub — full audit in production).</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
