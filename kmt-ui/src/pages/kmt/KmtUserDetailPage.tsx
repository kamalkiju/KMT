import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'
import { documentStageLabel } from './kmtWorkflowLabels'

const USER_META: Record<
  string,
  { name: string; role: string; templates: { id: string; label: string; checked: boolean }[] }
> = {
  u1: {
    name: 'John Smith',
    role: 'POC',
    templates: [
      { id: 'residential', label: 'Residential Services', checked: true },
      { id: 'recycling', label: 'Recycling Program', checked: true },
      { id: 'commercial', label: 'Commercial Waste', checked: false },
    ],
  },
  u2: {
    name: 'Alex Rivera',
    role: 'BUFM',
    templates: [
      { id: 'residential', label: 'Residential Services', checked: true },
      { id: 'commercial', label: 'Commercial Waste', checked: true },
      { id: 'recycling', label: 'Recycling Program', checked: false },
    ],
  },
  u3: {
    name: 'Jamie Chen',
    role: 'POC',
    templates: [
      { id: 'commercial', label: 'Commercial Waste', checked: true },
      { id: 'residential', label: 'Residential Services', checked: false },
    ],
  },
}

export function KmtUserDetailPage() {
  const { userId = '' } = useParams<{ userId: string }>()
  const { documents } = usePocDocuments()
  const meta = USER_META[userId]

  const ownedDocs = useMemo(() => {
    if (!meta) return []
    return documents
      .filter((d) => d.ownerName === meta.name)
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [documents, meta])

  if (!meta) {
    return (
      <div className={styles.stack}>
        <Card>
          <PageBackBar to="/kmt/governance/template-assignments" label="Template assignments" />
          <h1 className={styles.title}>User not found</h1>
          <Link to="/kmt/governance/template-assignments">
            <Button variant="primary" type="button">
              Back to list
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/kmt/governance/template-assignments" label="Template assignments" />
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>{meta.name}</h1>
            <p className={styles.lead}>
              Role <strong>{meta.role}</strong> · assigned templates and owned documents (demo data +
              live docs when owner name matches).
            </p>
          </div>
          <div className={ent.actionRow}>
            <Button variant="secondary" type="button" disabled title="Demo">
              Change role
            </Button>
            <Button variant="danger" type="button" disabled title="Demo">
              Remove access
            </Button>
          </div>
        </header>

        <div className={ent.panelCol} style={{ marginBottom: 20 }}>
          <h2>Assigned templates</h2>
          <ul className={ent.checkList}>
            {meta.templates.map((t) => (
              <li key={t.id}>
                <input type="checkbox" checked={t.checked} readOnly aria-readonly />
                <span>{t.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={ent.panelCol}>
          <h2>Documents owned</h2>
          <div className={ent.tableWrap}>
            <table className={ent.table}>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Status</th>
                  <th>Stage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ownedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <span className={styles.meta}>No documents in the catalog for this owner yet.</span>
                    </td>
                  </tr>
                ) : (
                  ownedDocs.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td>{d.status.replace(/_/g, ' ')}</td>
                      <td>{documentStageLabel(d)}</td>
                      <td>
                        <Link to={`/kmt/knowledge/review`}>
                          <Button variant="ghost" type="button" size="sm">
                            Queues
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
