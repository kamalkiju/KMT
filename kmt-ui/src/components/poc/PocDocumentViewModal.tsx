import { useEffect, useState } from 'react'
import type { BuilderTab, PocDocument } from '../../types/pocDocument'
import { useAuth } from '../../context/AuthContext'
import { DOCUMENT_TEMPLATES } from '../../context/pocDocumentDefaults'
import { DocumentReadOnlyTabPanel } from './DocumentReadOnlyTabPanel'
import { PocPulseComments } from './PocPulseComments'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import modalStyles from '../ui/Modal.module.css'
import styles from './PocDocumentViewModal.module.css'

function statusTone(s: PocDocument['status']) {
  if (s === 'draft') return 'draft'
  if (s === 'in_review' || s === 'awaiting_kmt') return 'awaiting'
  if (s === 'rejected') return 'rejected'
  if (s === 'archived') return 'archived'
  return 'published'
}

function statusLabel(s: PocDocument['status']) {
  if (s === 'in_review') return 'In review'
  if (s === 'awaiting_kmt') return 'Awaiting KMT'
  if (s === 'draft') return 'Draft'
  if (s === 'rejected') return 'Rejected'
  if (s === 'archived') return 'Archived'
  return 'Published'
}

function fieldCount(doc: PocDocument): number {
  return doc.tabs.reduce(
    (n, t) => n + t.groups.reduce((m, g) => m + g.fields.length, 0),
    0,
  )
}

function tabFieldCount(tab: BuilderTab): number {
  return tab.groups.reduce((n, g) => n + g.fields.length, 0)
}

interface PocDocumentViewModalProps {
  doc: PocDocument | null
  onClose: () => void
}

export function PocDocumentViewModal({ doc, onClose }: PocDocumentViewModalProps) {
  const [sectionIdx, setSectionIdx] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    setSectionIdx(0)
  }, [doc?.id])

  if (!doc) return null

  const tabs = doc.tabs
  const safeIdx = tabs.length === 0 ? 0 : Math.min(sectionIdx, tabs.length - 1)
  const currentTab = tabs[safeIdx]

  const templateName =
    DOCUMENT_TEMPLATES.find((t) => t.id === doc.documentTemplateId)?.name ?? doc.documentTemplateId
  const updated = new Date(doc.updatedAt).toLocaleString()
  const readOnlyMessage =
    doc.status === 'draft'
      ? 'Read-only preview — use Edit on the Knowledge Documents list to open the builder and change fields.'
      : doc.status === 'in_review' || doc.status === 'awaiting_kmt'
        ? 'In the approval pipeline — view details only here. Editing unlocks if the document is rejected or returned to draft.'
        : doc.status === 'published' || doc.status === 'archived'
          ? 'Published / archived — read-only snapshot.'
          : doc.status === 'rejected'
            ? 'Rejected — read feedback below; use Edit to revise in the builder, or Clone to start a copy.'
            : null

  return (
    <Modal
      open
      title="View document (read-only)"
      onClose={onClose}
      wide
      extraWide
      footer={
        <div className={modalStyles.footer}>
          <Button variant="primary" type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <button type="button" className={styles.modalBack} onClick={onClose}>
        ← Back to Knowledge Documents
      </button>
      {readOnlyMessage ? <p className={styles.readOnlyBanner}>{readOnlyMessage}</p> : null}

      <div className={styles.detailsCard}>
        <div className={styles.detailsCardTitle}>Document details</div>
        <div className={styles.grid}>
        <div>
          <div className={styles.label}>Name</div>
          <div className={styles.value}>{doc.name}</div>
        </div>
        <div>
          <div className={styles.label}>Status</div>
          <Badge tone={statusTone(doc.status)}>{statusLabel(doc.status)}</Badge>
        </div>
        <div>
          <div className={styles.label}>Document template</div>
          <div className={styles.value}>{templateName}</div>
        </div>
        <div>
          <div className={styles.label}>Version</div>
          <div className={styles.value}>{doc.version}</div>
        </div>
        <div>
          <div className={styles.label}>Last updated</div>
          <div className={styles.value}>{updated}</div>
        </div>
        {doc.ownerName ? (
          <div>
            <div className={styles.label}>Owner</div>
            <div className={styles.value}>{doc.ownerName}</div>
          </div>
        ) : null}
        {doc.submittedAt ? (
          <div>
            <div className={styles.label}>Submitted</div>
            <div className={styles.value}>{new Date(doc.submittedAt).toLocaleString()}</div>
          </div>
        ) : null}
        {doc.bufmApprovedAt ? (
          <div>
            <div className={styles.label}>BUFM approved</div>
            <div className={styles.value}>{new Date(doc.bufmApprovedAt).toLocaleString()}</div>
          </div>
        ) : null}
        <div>
          <div className={styles.label}>Fields</div>
          <div className={styles.value}>{fieldCount(doc)} total</div>
        </div>
        <div>
          <div className={styles.label}>RSAUI</div>
          <div className={styles.value}>
            {doc.rsauiDependencyPending ? 'Dependency pending update' : 'No open dependency flag'}
          </div>
        </div>
        {doc.status === 'rejected' && doc.bufmComment ? (
          <div className={styles.bufmBlock}>
            <div className={styles.label}>BUFM feedback</div>
            <div className={`${styles.bufmComment} ${styles.longText}`}>{doc.bufmComment}</div>
            {doc.bufmRejectedAt ? (
              <div className={styles.bufmMeta}>
                {new Date(doc.bufmRejectedAt).toLocaleString()}
              </div>
            ) : null}
          </div>
        ) : null}
        {doc.status === 'rejected' && doc.kmtComment ? (
          <div className={styles.kmtBlock}>
            <div className={styles.label}>KMT feedback</div>
            <div className={`${styles.bufmComment} ${styles.longText}`}>{doc.kmtComment}</div>
            {doc.kmtRejectedAt ? (
              <div className={styles.bufmMeta}>{new Date(doc.kmtRejectedAt).toLocaleString()}</div>
            ) : null}
          </div>
        ) : null}
        </div>
      </div>

      <div className={styles.formExplore}>
      <div className={styles.sectionLabel}>Form sections (read-only)</div>
      <p className={styles.stepperHint}>
        Document details are above. Use the section tabs to review groups and field output for each
        part of the knowledge document — same layout as the builder, without editing.
      </p>
      {tabs.length > 0 ? (
        <>
          <div className={styles.stepper} role="tablist" aria-label="Document sections">
            {tabs.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === safeIdx}
                className={`${styles.step} ${i === safeIdx ? styles.stepActive : ''}`}
                onClick={() => setSectionIdx(i)}
              >
                <span className={styles.stepNum}>{i + 1}</span>
                <span className={styles.stepLabel}>{t.title}</span>
                <span className={styles.stepMeta}>
                  {t.groups.length} groups · {tabFieldCount(t)} fields
                </span>
              </button>
            ))}
          </div>
          {currentTab ? (
            <>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>{currentTab.title}</h3>
                <p className={styles.sectionSub}>
                  {currentTab.groups.length} group{currentTab.groups.length === 1 ? '' : 's'} ·{' '}
                  {tabFieldCount(currentTab)} field{tabFieldCount(currentTab) === 1 ? '' : 's'} in
                  this section. Scroll to review lengthy notes and policy text.
                </p>
              </div>
              <div className={styles.previewWrap}>
                <DocumentReadOnlyTabPanel tab={currentTab} showTabTitle={false} />
              </div>
            </>
          ) : null}
        </>
      ) : (
        <p className={styles.stepperHint}>This document has no sections yet.</p>
      )}

        <div className={styles.pulseSection}>
          <PocPulseComments doc={doc} currentUserName={user?.name} />
        </div>
      </div>
    </Modal>
  )
}
