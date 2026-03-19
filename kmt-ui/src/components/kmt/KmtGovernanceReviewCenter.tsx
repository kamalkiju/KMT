import { useEffect, useState } from 'react'
import type { BuilderTab, PocDocument } from '../../types/pocDocument'
import { DOCUMENT_TEMPLATES } from '../../context/pocDocumentDefaults'
import { DocumentReadOnlyTabPanel } from '../poc/DocumentReadOnlyTabPanel'
import { PocPulseComments } from '../poc/PocPulseComments'
import type { ReviewerRoleLabel } from '../poc/KnowledgeReviewerExplorer'
import pomStyles from '../poc/PocDocumentViewModal.module.css'
import styles from './KmtGovernanceReviewCenter.module.css'

function tabFieldCount(tab: BuilderTab): number {
  return tab.groups.reduce((n, g) => n + g.fields.length, 0)
}

export function KmtGovernanceReviewCenter({
  doc,
  currentUserName,
  threadEditRole,
  onUpdateThreadComment,
}: {
  doc: PocDocument
  currentUserName?: string
  threadEditRole: ReviewerRoleLabel
  onUpdateThreadComment?: (commentId: string, body: string) => void
}) {
  const [sectionIdx, setSectionIdx] = useState(0)
  const tabs = doc.tabs
  const safeIdx = tabs.length === 0 ? 0 : Math.min(sectionIdx, tabs.length - 1)
  const currentTab = tabs[safeIdx]
  const templateName =
    DOCUMENT_TEMPLATES.find((t) => t.id === doc.documentTemplateId)?.name ?? doc.documentTemplateId

  useEffect(() => {
    setSectionIdx(0)
  }, [doc.id])

  return (
    <div className={styles.root}>
      <div className={styles.metaStrip}>
        <span className={styles.metaPill}>{templateName}</span>
        <span className={styles.metaMuted}>Owner: {doc.ownerName ?? '—'}</span>
      </div>

      <div className={styles.split}>
        <nav className={styles.leftNav} aria-label="Document sections">
          <div className={styles.leftNavTitle}>Sections</div>
          <ul className={styles.leftNavList}>
            {tabs.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`${styles.leftNavBtn} ${i === safeIdx ? styles.leftNavBtnOn : ''}`}
                  onClick={() => setSectionIdx(i)}
                >
                  <span className={styles.leftNavNum}>{i + 1}</span>
                  <span className={styles.leftNavLabel}>{t.title}</span>
                  <span className={styles.leftNavMeta}>
                    {t.groups.length} grp · {tabFieldCount(t)} fld
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.center}>
          {currentTab ? (
            <>
              <div className={pomStyles.sectionHead}>
                <h2 className={pomStyles.sectionTitle}>{currentTab.title}</h2>
                <p className={pomStyles.sectionSub}>
                  Document builder preview (read-only) — {currentTab.groups.length} group
                  {currentTab.groups.length === 1 ? '' : 's'} · {tabFieldCount(currentTab)} fields.
                </p>
              </div>
              <div className={pomStyles.previewWrap}>
                <DocumentReadOnlyTabPanel tab={currentTab} showTabTitle={false} />
              </div>
            </>
          ) : (
            <p className={styles.empty}>No sections in this document.</p>
          )}

          <div className={styles.pulseBelow}>
            <PocPulseComments
              doc={doc}
              currentUserName={currentUserName}
              threadEdit={
                onUpdateThreadComment
                  ? { role: threadEditRole, onSave: onUpdateThreadComment }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
