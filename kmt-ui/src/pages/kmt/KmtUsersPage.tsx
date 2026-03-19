import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { BUFM_SAMPLE_POC_USERS, DEMO_BUFM_APPROVERS } from '../../context/bufmSampleUsers'
import styles from '../shared/rolePages.module.css'
import ent from './KmtEnterprise.module.css'

export function KmtUsersPage() {
  const pocRows = BUFM_SAMPLE_POC_USERS.slice(0, 8)
  const bufmRows = DEMO_BUFM_APPROVERS

  return (
    <div className={styles.stack}>
      <Card>
        <header className={ent.pageHeader}>
          <div>
            <h1 className={styles.title}>Users</h1>
            <p className={styles.lead}>
              Enterprise directory (demo roster). Template-specific access is managed under{' '}
              <strong>Template Assignments</strong>.
            </p>
          </div>
          <Link to="/kmt/governance/template-assignments">
            <Button variant="primary" type="button">
              Template assignments
            </Button>
          </Link>
        </header>

        <h2 className={styles.h2}>POC content owners</h2>
        <div className={ent.tableWrap}>
          <table className={ent.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Region</th>
                <th>Title</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pocRows.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.region}</td>
                  <td>{u.title}</td>
                  <td>
                    <span className={u.status === 'away' ? ent.pillAway : ent.pillOk}>
                      {u.status === 'away' ? 'Away' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className={styles.h2} style={{ marginTop: 28 }}>
          BUFM approvers
        </h2>
        <div className={ent.tableWrap}>
          <table className={ent.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {bufmRows.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.title}</td>
                  <td>{m.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
