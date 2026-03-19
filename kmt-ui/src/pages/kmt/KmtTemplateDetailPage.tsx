import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DOCUMENT_TEMPLATES } from '../../context/pocDocumentDefaults'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'
import { documentStageLabel, templateDisplayName } from './kmtWorkflowLabels'

const POC_ROWS: Record<
  string,
  { name: string; region: string; docsActive: number }[]
> = {
  residential: [
    { name: 'John Smith', region: 'North', docsActive: 5 },
    { name: 'Jamie Chen', region: 'West', docsActive: 2 },
    { name: 'Taylor Kim', region: 'East', docsActive: 1 },
  ],
  commercial: [
    { name: 'Maria Garcia', region: 'South', docsActive: 4 },
    { name: 'Dev Patel', region: 'Central', docsActive: 2 },
  ],
  recycling: [{ name: 'Jamie Chen', region: 'West', docsActive: 3 }],
  blank: [{ name: 'John Smith', region: 'North', docsActive: 1 }],
}

const BUFM_ROWS: Record<string, { name: string; region: string; pending: number }[]> = {
  residential: [
    { name: 'Alex Rivera', region: 'All regions', pending: 3 },
    { name: 'Sam Okonkwo', region: 'All regions', pending: 2 },
  ],
  commercial: [
    { name: 'Alex Rivera', region: 'All regions', pending: 2 },
    { name: 'Morgan Ellis', region: 'All regions', pending: 2 },
  ],
  recycling: [{ name: 'Sam Okonkwo', region: 'All regions', pending: 1 }],
  blank: [{ name: 'Riley Park', region: 'All regions', pending: 0 }],
}

export function KmtTemplateDetailPage() {
  const { templateId = '' } = useParams<{ templateId: string }>()
  const { documents } = usePocDocuments()

  const template = useMemo(
    () => DOCUMENT_TEMPLATES.find((t) => t.id === templateId),
    [templateId],
  )

  const docsUnder = useMemo(
    () =>
      documents
        .filter((d) => d.documentTemplateId === templateId)
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [documents, templateId],
  )

  const pocRows = POC_ROWS[templateId] ?? []
  const bufmRows = BUFM_ROWS[templateId] ?? []

  if (!template) {
    return (
      <div className={styles.stack}>
        <Card>
          <PageBackBar to="/kmt/governance/templates" label="Templates management" />
          <h1 className={styles.title}>Template not found</h1>
          <p className={styles.lead}>Unknown template id.</p>
          <Link to="/kmt/governance/templates">
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
        <PageBackBar to="/kmt/governance/templates" label="Templates management" />
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>{template.name}</h1>
            <p className={styles.lead}>
              Template detail — metadata, assigned actors, and documents using this template (no
              assignment modals; full-page only).
            </p>
          </div>
          <Link to="/kmt/governance/templates/builder">
            <Button variant="secondary" type="button">
              Open template builder
            </Button>
          </Link>
        </header>

        <div className={ent.detailGrid}>
          <div className={ent.panelCol}>
            <h2>Template info</h2>
            <ul className={ent.metaList}>
              <li>
                <strong>Template name</strong>
                {template.name}
              </li>
              <li>
                <strong>Template id</strong>
                {template.id}
              </li>
              <li>
                <strong>Created by</strong>
                KMT · Maria Garcia (demo)
              </li>
              <li>
                <strong>Last updated</strong>
                {new Date().toLocaleDateString()}
              </li>
              <li>
                <strong>Status</strong>
                <span className={ent.pillOk}>Active</span>
              </li>
            </ul>
          </div>

          <div className={ent.panelCol}>
            <h2>Assigned users</h2>
            <h3 className={ent.sectionTitle}>POC users</h3>
            <div className={ent.tableWrap}>
              <table className={ent.innerTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Region</th>
                    <th>Documents active</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pocRows.map((r) => (
                    <tr key={r.name}>
                      <td>{r.name}</td>
                      <td>{r.region}</td>
                      <td>{r.docsActive}</td>
                      <td>
                        <Button variant="ghost" type="button" size="sm" disabled title="Demo">
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className={ent.sectionTitle}>BUFM users</h3>
            <div className={ent.tableWrap}>
              <table className={ent.innerTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Region</th>
                    <th>Pending reviews</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bufmRows.map((r) => (
                    <tr key={r.name}>
                      <td>{r.name}</td>
                      <td>{r.region}</td>
                      <td>{r.pending}</td>
                      <td>
                        <Button variant="ghost" type="button" size="sm" disabled title="Demo">
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="primary" type="button" disabled title="Demo — use User Access to add">
              Add user
            </Button>
          </div>

          <div className={ent.panelCol}>
            <h2>Documents under template</h2>
            <div className={ent.tableWrap}>
              <table className={ent.innerTable}>
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {docsUnder.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <span className={styles.meta}>No documents use this template yet.</span>
                      </td>
                    </tr>
                  ) : (
                    docsUnder.map((d) => (
                      <tr key={d.id}>
                        <td>{d.name}</td>
                        <td>{d.status.replace(/_/g, ' ')}</td>
                        <td>{d.ownerName ?? '—'}</td>
                        <td>{documentStageLabel(d)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className={styles.meta} style={{ marginTop: 12 }}>
              Template label in catalog: <strong>{templateDisplayName(templateId)}</strong>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
