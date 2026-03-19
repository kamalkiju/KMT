import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'

type DemoRow = {
  id: string
  name: string
  role: string
  templateTags: string[]
  status: 'active' | 'away'
  pendingApprovals: string[]
}

const DEMO_ROWS: DemoRow[] = [
  {
    id: 'u1',
    name: 'John Smith',
    role: 'POC',
    templateTags: ['Residential', 'Recycling'],
    status: 'active',
    pendingApprovals: ['K-5015 awaiting BUFM'],
  },
  {
    id: 'u2',
    name: 'Alex Rivera',
    role: 'BUFM',
    templateTags: ['Residential', 'Commercial'],
    status: 'active',
    pendingApprovals: ['3 knowledge reviews'],
  },
  {
    id: 'u3',
    name: 'Jamie Chen',
    role: 'POC',
    templateTags: ['Commercial'],
    status: 'away',
    pendingApprovals: [],
  },
]

export function KmtTemplateAssignmentsPage() {
  const { documents } = usePocDocuments()
  const [drawerId, setDrawerId] = useState<string | null>(null)

  const row = drawerId ? DEMO_ROWS.find((r) => r.id === drawerId) : null

  const userDocs = useMemo(() => {
    if (!row) return []
    return documents
      .filter((d) => d.ownerName === row.name)
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [documents, row])

  return (
    <div className={styles.stack}>
      <Card>
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>Template assignments</h1>
            <p className={styles.lead}>
              Assign templates to POC and BUFM actors. Click a row to open the detail drawer — full
              pages only, no assignment modal.
            </p>
          </div>
          <Link to="/kmt/governance/templates">
            <Button variant="secondary" type="button">
              Templates
            </Button>
          </Link>
        </header>

        <div className={ent.tableWrap}>
          <table className={ent.table}>
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Role</th>
                <th scope="col">Assigned templates</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ROWS.map((r) => (
                <tr
                  key={r.id}
                  className={ent.clickRow}
                  onClick={() => setDrawerId(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setDrawerId(r.id)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open drawer for ${r.name}`}
                >
                  <td>{r.name}</td>
                  <td>{r.role}</td>
                  <td>
                    <div className={ent.tagRow}>
                      {r.templateTags.map((t) => (
                        <span key={t} className={ent.tag}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={r.status === 'away' ? ent.pillAway : ent.pillOk}>
                      {r.status === 'away' ? 'Away' : 'Active'}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className={ent.actionRow}>
                      <Button variant="secondary" type="button" size="sm" disabled title="Demo">
                        Assign template
                      </Button>
                      <Button variant="ghost" type="button" size="sm" disabled title="Demo">
                        Change role
                      </Button>
                      <Button variant="danger" type="button" size="sm" disabled title="Demo">
                        Deactivate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {row ? (
        <>
          <div
            role="presentation"
            className={ent.drawerBackdrop}
            onClick={() => setDrawerId(null)}
            onKeyDown={(e) => e.key === 'Escape' && setDrawerId(null)}
          />
          <aside className={ent.drawerPanel} aria-label="User assignment detail">
            <div className={ent.pageHeader} style={{ border: 'none', padding: 0, marginBottom: 8 }}>
              <h2 className={ent.drawerTitle}>{row.name}</h2>
              <Button variant="secondary" type="button" size="sm" onClick={() => setDrawerId(null)}>
                Close
              </Button>
            </div>
            <p className={styles.meta}>
              {row.role} ·{' '}
              <Link to={`/kmt/governance/template-assignments/${row.id}`}>Open full profile →</Link>
            </p>

            <section className={ent.drawerSection}>
              <h3 className={ent.sectionTitle}>Templates assigned</h3>
              <div className={ent.tagRow}>
                {row.templateTags.map((t) => (
                  <span key={t} className={ent.tag}>
                    {t}
                  </span>
                ))}
              </div>
            </section>

            <section className={ent.drawerSection}>
              <h3 className={ent.sectionTitle}>Documents created</h3>
              {userDocs.length === 0 ? (
                <p className={styles.meta}>No catalog documents for this owner.</p>
              ) : (
                <ul className={ent.checkList}>
                  {userDocs.slice(0, 8).map((d) => (
                    <li key={d.id}>
                      <span>
                        {d.name} · {d.status.replace(/_/g, ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={ent.drawerSection}>
              <h3 className={ent.sectionTitle}>Pending approvals</h3>
              {row.pendingApprovals.length === 0 ? (
                <p className={styles.meta}>None.</p>
              ) : (
                <ul className={ent.checkList}>
                  {row.pendingApprovals.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </>
      ) : null}
    </div>
  )
}
