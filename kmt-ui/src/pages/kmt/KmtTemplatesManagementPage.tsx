import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  KmtCreateTemplateModal,
  type CreateTemplatePayload,
} from '../../components/kmt/KmtCreateTemplateModal'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DOCUMENT_TEMPLATES } from '../../context/pocDocumentDefaults'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'

const DEMO_ASSIGNED: Record<string, { poc: number; bufm: number }> = {
  residential: { poc: 5, bufm: 3 },
  commercial: { poc: 2, bufm: 4 },
  recycling: { poc: 2, bufm: 2 },
  blank: { poc: 1, bufm: 1 },
}

export function KmtTemplatesManagementPage() {
  const navigate = useNavigate()
  const { documents } = usePocDocuments()
  const [createOpen, setCreateOpen] = useState(false)

  const rows = DOCUMENT_TEMPLATES.filter((t) => t.id !== 'blank')

  const onCreate = (payload: CreateTemplatePayload) => {
    navigate('/kmt/governance/templates/builder', { state: payload })
  }

  return (
    <div className={styles.stack}>
      <Card>
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>Templates</h1>
            <p className={styles.lead}>
              Catalog templates — counts include demo roster sizing and live document totals.
            </p>
          </div>
          <Button variant="primary" type="button" onClick={() => setCreateOpen(true)}>
            + Create template
          </Button>
        </header>

        <div className={ent.tableWrap}>
          <table className={ent.table}>
            <thead>
              <tr>
                <th scope="col">Template name</th>
                <th scope="col">POC assigned</th>
                <th scope="col">BUFM assigned</th>
                <th scope="col">Active documents</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const demo = DEMO_ASSIGNED[t.id] ?? { poc: 0, bufm: 0 }
                const active = documents.filter(
                  (d) => d.documentTemplateId === t.id && d.status !== 'archived',
                ).length
                return (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{demo.poc}</td>
                    <td>{demo.bufm}</td>
                    <td>{active}</td>
                    <td>
                      <span className={ent.pillOk}>Active</span>
                    </td>
                    <td>
                      <Link to={`/kmt/governance/templates/${t.id}`}>
                        <Button variant="secondary" type="button" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <KmtCreateTemplateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={onCreate}
      />
    </div>
  )
}
