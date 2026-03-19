import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import modalStyles from '../../components/ui/Modal.module.css'
import { BuilderFieldPreview } from '../../components/poc/BuilderFieldPreview'
import { FieldSettingsModal } from '../../components/poc/FieldSettingsModal'
import {
  PocButtonPopupModal,
  type PopupStructurePayload,
} from '../../components/poc/PocButtonPopupModal'
import { PocStructureWizardModal } from '../../components/poc/PocStructureWizardModal'
import { buildField, normalizeField, normalizePocDocument } from '../../context/fieldNormalization'
import { useAuth } from '../../context/AuthContext'
import { usePocDocuments } from '../../context/PocDocumentsContext'
import { DOCUMENT_TEMPLATES, genId, tabsForTemplate } from '../../context/pocDocumentDefaults'
import type { BuilderField, BuilderFieldKind, PocDocument } from '../../types/pocDocument'
import styles from './PocDocumentBuilderPage.module.css'

const DND = 'text/plain'

const FIELD_KINDS: BuilderFieldKind[] = [
  'Text Input',
  'Email Input',
  'Number Input',
  'Currency Input',
  'Percentage Input',
  'Telephone Input',
  'URL Input',
  'Date Input',
  'Time Input',
  'File Upload',
  'Radio Button',
  'Checkboxes',
  'Dropdown',
  'Button',
  'Image Input',
  'Toggle Switch',
  'Notes',
  'Yes/No Detail',
]

type DndPayload =
  | { type: 'palette'; kind: BuilderFieldKind }
  | { type: 'field'; ti: number; gi: number; fi: number }
  | { type: 'tab'; ti: number }
  | { type: 'group'; ti: number; gi: number }

function parseDnd(raw: string): DndPayload | null {
  try {
    return JSON.parse(raw) as DndPayload
  } catch {
    return null
  }
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

function docStatusLabel(s: PocDocument['status']): string {
  if (s === 'in_review') return 'In review'
  if (s === 'awaiting_kmt') return 'Awaiting KMT'
  if (s === 'draft') return 'Draft'
  if (s === 'rejected') return 'Rejected'
  if (s === 'archived') return 'Archived'
  return 'Published'
}

export function PocDocumentBuilderPage() {
  const { docId } = useParams<{ docId: string }>()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { documents, getById, createDraft, saveDraft, saveDocument, submitDocument, approveByKmt } =
    usePocDocuments()
  const isKmtDocumentRoute = pathname.startsWith('/kmt/document')

  const getByIdRef = useRef(getById)
  getByIdRef.current = getById

  const seededNew = useRef(false)
  const [working, setWorking] = useState<PocDocument | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [dragFieldOver, setDragFieldOver] = useState<string | null>(null)
  const [groupDropOver, setGroupDropOver] = useState<string | null>(null)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState('')
  const [saveBanner, setSaveBanner] = useState(false)
  const [settingsTarget, setSettingsTarget] = useState<{
    ti: number
    gi: number
    fi: number
  } | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [structureWizardOpen, setStructureWizardOpen] = useState(false)
  const [buttonPopupOpen, setButtonPopupOpen] = useState(false)

  const workingRef = useRef<PocDocument | null>(null)
  workingRef.current = working
  const activeTabRef = useRef(activeTab)
  activeTabRef.current = activeTab

  const onPreviewValueChange = useCallback((fieldId: string, value: string) => {
    setFieldValues((prev) => {
      const next = { ...prev, [fieldId]: value }
      const w = workingRef.current
      const ti = activeTabRef.current
      const t = w?.tabs[ti]
      if (t) {
        const flat = t.groups.flatMap((g) => g.fields)
        for (const f of flat) {
          if (f.dependsOnFieldId === fieldId) {
            delete next[f.id]
            delete next[`${f.id}:yn`]
            delete next[`${f.id}:detail`]
          }
        }
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (docId !== 'new') return
    if (seededNew.current) return
    seededNew.current = true
    const d = createDraft('blank', 'Untitled document', user?.name)
    navigate(`/poc/document/${d.id}`, { replace: true })
  }, [docId, createDraft, navigate, user?.name])

  useEffect(() => {
    if (!docId || docId === 'new') return
    const d = getByIdRef.current(docId)
    if (d) {
      setWorking(JSON.parse(JSON.stringify(d)) as PocDocument)
      setActiveTab(0)
    } else {
      setWorking(null)
    }
  }, [docId])

  useEffect(() => {
    if (!docId || docId === 'new') return
    const d = getById(docId)
    if (!d) return
    setWorking((prev) => {
      if (!prev) return JSON.parse(JSON.stringify(d)) as PocDocument
      if (d.status !== prev.status || d.version !== prev.version || d.bufmComment !== prev.bufmComment) {
        return JSON.parse(JSON.stringify(d)) as PocDocument
      }
      if (d.status === 'in_review' && d.updatedAt !== prev.updatedAt) {
        return JSON.parse(JSON.stringify(d)) as PocDocument
      }
      return prev
    })
  }, [docId, documents, getById])

  useEffect(() => {
    setFieldValues({})
    setEditingGroupId(null)
  }, [docId])

  const readonly =
    working?.status === 'in_review' ||
    (!isKmtDocumentRoute && working?.status === 'awaiting_kmt') ||
    (working?.status === 'published' && !isKmtDocumentRoute) ||
    working?.status === 'archived'
  const canEditStructure = Boolean(working && !readonly)
  const templateName =
    DOCUMENT_TEMPLATES.find((t) => t.id === working?.documentTemplateId)?.name ?? '—'

  const updateWorking = useCallback((fn: (d: PocDocument) => PocDocument) => {
    setWorking((w) => (w ? fn(JSON.parse(JSON.stringify(w)) as PocDocument) : w))
  }, [])

  const applyStructureWizard = useCallback(
    (payload: { groupTitle: string; columns: 1 | 2; kinds: BuilderFieldKind[] }) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        const t = tabs[activeTabRef.current]
        if (!t) return d
        const base = t.groups.reduce((n, g) => n + g.fields.length, 0)
        const fields = payload.kinds.map((kind, i) => buildField(genId(), kind, base + i + 1))
        t.groups.push({
          id: genId(),
          title: payload.groupTitle,
          columns: payload.columns,
          fields,
        })
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const applyButtonPopup = useCallback(
    (payload: PopupStructurePayload) => {
      let switchToTab: number | undefined
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        let ti = activeTabRef.current
        if (payload.targetTab === 'new') {
          const title =
            payload.newTabTitle.trim() || `Tab ${tabs.length + 1}`
          tabs.push({
            id: genId(),
            title,
            groups: [],
          })
          ti = tabs.length - 1
          switchToTab = ti
        }
        const t = tabs[ti]
        if (!t) return d
        let n = t.groups.reduce((acc, g) => acc + g.fields.length, 0)
        for (const row of payload.groups) {
          const fields = row.kinds.map((kind) => {
            n += 1
            return buildField(genId(), kind, n)
          })
          t.groups.push({
            id: genId(),
            title: row.title.trim() || `Group ${t.groups.length + 1}`,
            columns: row.columns,
            fields,
          })
        }
        return { ...d, tabs }
      })
      if (switchToTab !== undefined) setActiveTab(switchToTab)
    },
    [updateWorking],
  )

  const onTemplateChange = useCallback(
    (templateId: string) => {
      updateWorking((d) => ({
        ...d,
        documentTemplateId: templateId,
        tabs: tabsForTemplate(templateId),
      }))
      setActiveTab(0)
    },
    [updateWorking],
  )

  const addTab = useCallback(() => {
    updateWorking((d) => ({
      ...d,
      tabs: [
        ...d.tabs,
        {
          id: genId(),
          title: `Tab ${d.tabs.length + 1}`,
          groups: [
            {
              id: genId(),
              title: 'Group 1',
              columns: 2,
              fields: [],
            },
          ],
        },
      ],
    }))
    setActiveTab((i) => i + 1)
  }, [updateWorking])

  const addGroup = useCallback(() => {
    updateWorking((d) => {
      const tabs = structuredClone(d.tabs)
      const t = tabs[activeTab]
      if (!t) return d
      t.groups.push({
        id: genId(),
        title: `Group ${t.groups.length + 1}`,
        columns: 2,
        fields: [],
      })
      return { ...d, tabs }
    })
  }, [activeTab, updateWorking])

  const duplicateLastGroup = useCallback(() => {
    updateWorking((d) => {
      const tabs = structuredClone(d.tabs)
      const t = tabs[activeTab]
      if (!t || t.groups.length === 0) return d
      const lastIdx = t.groups.length - 1
      const src = t.groups[lastIdx]
      const copyFields = src.fields.map((f) =>
        normalizeField({
          ...JSON.parse(JSON.stringify(f)),
          id: genId(),
          label: `${f.label} (copy)`,
          name: `${f.name}_copy`,
        }),
      )
      t.groups.push({
        id: genId(),
        title: `${src.title} (copy)`,
        columns: src.columns,
        fields: copyFields,
      })
      return { ...d, tabs }
    })
  }, [activeTab, updateWorking])

  const removeField = useCallback(
    (ti: number, gi: number, fi: number) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        tabs[ti].groups[gi].fields.splice(fi, 1)
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const removeGroup = useCallback(
    (ti: number, gi: number) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        tabs[ti].groups.splice(gi, 1)
        if (tabs[ti].groups.length === 0) {
          tabs[ti].groups.push({
            id: genId(),
            title: 'Group 1',
            columns: 2,
            fields: [],
          })
        }
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const duplicateGroup = useCallback(
    (ti: number, gi: number) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        const src = tabs[ti].groups[gi]
        const copyFields = src.fields.map((f) =>
          normalizeField({
            ...JSON.parse(JSON.stringify(f)),
            id: genId(),
            label: `${f.label} (copy)`,
            name: `${f.name}_copy`,
          }),
        )
        tabs[ti].groups.splice(gi + 1, 0, {
          id: genId(),
          title: `${src.title} (copy)`,
          columns: src.columns,
          fields: copyFields,
        })
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const duplicateFieldAt = useCallback(
    (ti: number, gi: number, fi: number) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        const src = tabs[ti].groups[gi].fields[fi]
        const copy = normalizeField({
          ...JSON.parse(JSON.stringify(src)),
          id: genId(),
          label: `${src.label} (copy)`,
          name: `${src.name}_copy`,
        })
        tabs[ti].groups[gi].fields.splice(fi + 1, 0, copy)
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const removeTab = useCallback(
    (ti: number) => {
      updateWorking((d) => {
        if (d.tabs.length <= 1) return d
        return { ...d, tabs: d.tabs.filter((_, i) => i !== ti) }
      })
      setActiveTab((i) => {
        if (ti === i) return Math.max(0, i - 1)
        if (ti < i) return i - 1
        return i
      })
    },
    [updateWorking],
  )

  const moveField = useCallback(
    (
      from: { ti: number; gi: number; fi: number },
      to: { ti: number; gi: number; insertAt: number },
    ) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        const src = tabs[from.ti].groups[from.gi].fields.splice(from.fi, 1)[0]
        if (!src) return d
        let insertAt = to.insertAt
        if (from.ti === to.ti && from.gi === to.gi && from.fi < insertAt) {
          insertAt -= 1
        }
        tabs[to.ti].groups[to.gi].fields.splice(insertAt, 0, src)
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const addPaletteField = useCallback(
    (ti: number, gi: number, kind: BuilderFieldKind, insertAt?: number) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        const g = tabs[ti].groups[gi]
        const n = g.fields.length + 1
        const f = buildField(genId(), kind, n)
        if (insertAt === undefined) {
          g.fields.push(f)
        } else {
          g.fields.splice(insertAt, 0, f)
        }
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const reorderTabs = useCallback(
    (from: number, to: number) => {
      if (from === to) return
      updateWorking((d) => {
        const tabs = [...d.tabs]
        const [t] = tabs.splice(from, 1)
        tabs.splice(to, 0, t)
        return { ...d, tabs }
      })
      setActiveTab((i) => {
        if (i === from) return to
        if (from < to && i > from && i <= to) return i - 1
        if (from > to && i >= to && i < from) return i + 1
        return i
      })
    },
    [updateWorking],
  )

  const reorderGroups = useCallback(
    (ti: number, from: number, to: number) => {
      if (from === to) return
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        const groups = tabs[ti].groups
        const [g] = groups.splice(from, 1)
        groups.splice(to, 0, g)
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const onDropOnField = useCallback(
    (ti: number, gi: number, fi: number, e: DragEvent) => {
      e.preventDefault()
      setDragFieldOver(null)
      const p = parseDnd(e.dataTransfer.getData(DND))
      if (!p || !working) return
      if (p.type === 'palette') {
        addPaletteField(ti, gi, p.kind, fi)
        return
      }
      if (p.type === 'field') {
        moveField(
          { ti: p.ti, gi: p.gi, fi: p.fi },
          { ti, gi, insertAt: fi },
        )
      }
    },
    [addPaletteField, moveField, working],
  )

  const onDropOnGroupZone = useCallback(
    (ti: number, gi: number, e: DragEvent) => {
      e.preventDefault()
      setGroupDropOver(null)
      const p = parseDnd(e.dataTransfer.getData(DND))
      if (!p || !working) return
      if (p.type === 'palette') {
        addPaletteField(ti, gi, p.kind)
        return
      }
      if (p.type === 'field') {
        const len = working.tabs[ti].groups[gi].fields.length
        moveField({ ti: p.ti, gi: p.gi, fi: p.fi }, { ti, gi, insertAt: len })
      }
    },
    [addPaletteField, moveField, working],
  )

  const onDropTabBar = useCallback(
    (targetIndex: number, e: DragEvent) => {
      e.preventDefault()
      const p = parseDnd(e.dataTransfer.getData(DND))
      if (p?.type !== 'tab') return
      reorderTabs(p.ti, targetIndex)
    },
    [reorderTabs],
  )

  const onDropGroupHead = useCallback(
    (ti: number, targetGi: number, e: DragEvent) => {
      e.preventDefault()
      const p = parseDnd(e.dataTransfer.getData(DND))
      if (p?.type !== 'group' || p.ti !== ti) return
      reorderGroups(ti, p.gi, targetGi)
    },
    [reorderGroups],
  )

  const handleSaveDraft = useCallback(() => {
    if (!working) return
    const now = new Date().toISOString()
    const ownerName =
      working.ownerName?.trim() || user?.name?.trim() || undefined
    const payload = { ...working, ownerName, updatedAt: now }
    saveDraft(payload)
    setWorking((w) =>
      w
        ? {
            ...w,
            ownerName,
            status: 'draft',
            updatedAt: now,
          }
        : w,
    )
    setSaveBanner(true)
    globalThis.setTimeout(() => setSaveBanner(false), 2500)
  }, [saveDraft, user?.name, working])

  const handleKmtGovernanceSave = useCallback(() => {
    if (!working || !isKmtDocumentRoute) return
    const now = new Date().toISOString()
    const nextVersion = String((Number.parseFloat(working.version) || 0) + 0.01)
    const payload = normalizePocDocument({
      ...working,
      updatedAt: now,
      version: nextVersion,
    })
    saveDocument(payload)
    setWorking(payload)
    setSaveBanner(true)
    globalThis.setTimeout(() => setSaveBanner(false), 2800)
  }, [isKmtDocumentRoute, saveDocument, working])

  const handleKmtPublish = useCallback(() => {
    if (!working || !isKmtDocumentRoute || !docId || working.status !== 'awaiting_kmt') return
    const now = new Date().toISOString()
    const payload = normalizePocDocument({ ...working, updatedAt: now })
    approveByKmt(docId, payload)
    navigate('/kmt/knowledge/published')
  }, [approveByKmt, docId, isKmtDocumentRoute, navigate, working])

  const handleSubmit = useCallback(() => {
    if (!working) return
    if (fieldCount(working) === 0) return
    const now = new Date().toISOString()
    const ownerName =
      working.ownerName?.trim() || user?.name?.trim() || undefined
    const payload = {
      ...working,
      ownerName,
      updatedAt: now,
      submittedAt: working.submittedAt ?? now,
    }
    submitDocument(payload)
    setSubmitConfirmOpen(false)
    setSubmitOpen(true)
    setWorking((w) =>
      w
        ? {
            ...w,
            ownerName,
            status: 'in_review',
            updatedAt: now,
            submittedAt: w.submittedAt ?? now,
          }
        : w,
    )
  }, [submitDocument, user?.name, working])

  const setGroupTitle = useCallback(
    (ti: number, gi: number, title: string) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        tabs[ti].groups[gi].title = title
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const setGroupColumns = useCallback(
    (ti: number, gi: number, columns: 1 | 2) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        tabs[ti].groups[gi].columns = columns
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const updateFieldAt = useCallback(
    (ti: number, gi: number, fi: number, field: BuilderField) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        tabs[ti].groups[gi].fields[fi] = normalizeField(field)
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const settingsField =
    working && settingsTarget
      ? working.tabs[settingsTarget.ti]?.groups[settingsTarget.gi]?.fields[settingsTarget.fi] ?? null
      : null

  const setTabTitle = useCallback(
    (ti: number, title: string) => {
      updateWorking((d) => {
        const tabs = structuredClone(d.tabs)
        tabs[ti].title = title
        return { ...d, tabs }
      })
    },
    [updateWorking],
  )

  const flatTabFields = useMemo(() => {
    if (!working) return []
    const t = working.tabs[activeTab]
    return t ? t.groups.flatMap((g) => g.fields) : []
  }, [working, activeTab])

  const siblingFields = useMemo(
    () => flatTabFields.map((f) => ({ id: f.id, label: f.label, kind: f.kind })),
    [flatTabFields],
  )

  if (docId === 'new') {
    return <p className={styles.modalBody}>Starting new document…</p>
  }

  if (!working) {
    return (
      <div>
        <p>Document not found.</p>
        <Link to={isKmtDocumentRoute ? '/kmt/knowledge/review' : '/poc/dashboard'}>
          {isKmtDocumentRoute ? 'Back to Knowledge Review Queue' : 'Back to Knowledge Documents'}
        </Link>
      </div>
    )
  }

  const tab = working.tabs[activeTab]
  const pct = progressPct(working)

  const statusTone =
    working.status === 'draft'
      ? 'draft'
      : working.status === 'in_review' || working.status === 'awaiting_kmt'
        ? 'awaiting'
        : working.status === 'rejected'
          ? 'rejected'
          : working.status === 'archived'
            ? 'archived'
            : 'published'

  return (
    <div>
      <PageBackBar
        to={
          isKmtDocumentRoute
            ? working.status === 'awaiting_kmt'
              ? `/kmt/knowledge/document/${docId}`
              : '/kmt/knowledge/review'
            : '/poc/dashboard'
        }
        label={
          isKmtDocumentRoute
            ? working.status === 'awaiting_kmt'
              ? 'Document details'
              : 'Review queue'
            : 'Knowledge Documents'
        }
      />
      <div className={styles.docHeader}>
        <div className={styles.docHeaderLeft}>
          <Badge tone={statusTone}>{docStatusLabel(working.status)}</Badge>
          <span className={styles.docHeaderMeta}>Version {working.version}</span>
          <span className={styles.docHeaderMeta}>
            Expiry:{' '}
            {working.expiryDate
              ? working.expiryDate
              : isKmtDocumentRoute
                ? 'Set at publish'
                : 'Not scheduled (demo)'}
          </span>
        </div>
        <div className={styles.docHeaderRight}>
          {isKmtDocumentRoute ? (
            <>
              <Button variant="secondary" type="button" onClick={handleKmtGovernanceSave}>
                Save changes
              </Button>
              {working.status === 'awaiting_kmt' ? (
                <Button variant="primary" type="button" onClick={handleKmtPublish}>
                  Publish
                </Button>
              ) : null}
            </>
          ) : !readonly ? (
            <>
              <Button variant="secondary" type="button" onClick={handleSaveDraft}>
                Save as draft
              </Button>
              <Button
                variant="primary"
                type="button"
                disabled={fieldCount(working) === 0}
                onClick={() => setSubmitConfirmOpen(true)}
              >
                Submit for approval
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.nameField}>
          <label className={styles.nameLabel} htmlFor="doc-name">
            Document name
          </label>
          <input
            id="doc-name"
            className={styles.nameInput}
            value={working.name}
            disabled={readonly}
            onChange={(e) =>
              setWorking((w) => (w ? { ...w, name: e.target.value } : w))
            }
          />
        </div>
        <div className={styles.templateField}>
          <label className={styles.nameLabel} htmlFor="doc-template">
            Document template
          </label>
          <select
            id="doc-template"
            className={styles.nameInput}
            value={working.documentTemplateId}
            disabled={readonly}
            onChange={(e) => onTemplateChange(e.target.value)}
          >
            {DOCUMENT_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className={styles.nameLabel}>Progress</span>
          <div className={styles.nameLabel}>{pct}%</div>
        </div>
      </div>

      {working.status === 'in_review' ? (
        <div className={styles.readonlyBanner}>
          Submitted for approval — this document is in BUFM review. Editing is locked until the review
          completes or the request is returned.
        </div>
      ) : null}
      {working.status === 'awaiting_kmt' && isKmtDocumentRoute ? (
        <div className={`${styles.readonlyBanner} ${styles.governanceEditBanner}`}>
          <strong>KMT edit mode</strong> — structure and fields can change. <strong>Save changes</strong>{' '}
          bumps the minor version while the document awaits publish. Use <strong>Publish</strong> to
          move it to the Published library.
        </div>
      ) : working.status === 'awaiting_kmt' ? (
        <div className={styles.readonlyBanner}>
          BUFM approved — document is in <strong>KMT review</strong>. Editing is locked until KMT
          publishes or returns it.
        </div>
      ) : null}
      {working.status === 'published' && isKmtDocumentRoute ? (
        <div className={`${styles.readonlyBanner} ${styles.governanceEditBanner}`}>
          <strong>Published</strong> — catalog document. <strong>Save changes</strong> bumps the minor
          version while it stays published. For a new POC lineage, <strong>Clone</strong> from the
          Published library.
        </div>
      ) : working.status === 'published' ? (
        <div className={`${styles.readonlyBanner} ${styles.publishedBanner}`}>
          Published — read-only. Clone from the Knowledge Documents list to create a new editable
          version.
        </div>
      ) : null}
      {working.status === 'archived' ? (
        <div className={`${styles.readonlyBanner} ${styles.archivedBanner}`}>
          Archived — read-only. Clone from the dashboard to start a new version.
        </div>
      ) : null}
      {working.status === 'rejected' ? (
        <div className={`${styles.readonlyBanner} ${styles.rejectedBanner}`}>
          This version was rejected. Update fields below, save as draft, and submit again.
          {working.kmtComment ? (
            <>
              {' '}
              <strong>KMT:</strong> {working.kmtComment}
            </>
          ) : null}
        </div>
      ) : null}
      {saveBanner ? (
        <div className={styles.saveBanner} role="status">
          {isKmtDocumentRoute
            ? working.status === 'published'
              ? 'Changes saved — catalog minor version updated.'
              : 'Changes saved — minor version bumped.'
            : 'Draft saved — visible under Draft and All Documents on the Knowledge Documents screen.'}
        </div>
      ) : null}

      <FieldSettingsModal
        open={settingsTarget !== null}
        field={settingsField}
        readonly={readonly}
        siblingFields={siblingFields}
        onClose={() => setSettingsTarget(null)}
        onSave={(next) => {
          if (!settingsTarget) return
          updateFieldAt(settingsTarget.ti, settingsTarget.gi, settingsTarget.fi, next)
          setSettingsTarget(null)
        }}
      />

      <PocStructureWizardModal
        open={structureWizardOpen}
        onClose={() => setStructureWizardOpen(false)}
        onConfirm={applyStructureWizard}
      />

      <PocButtonPopupModal
        open={buttonPopupOpen}
        onClose={() => setButtonPopupOpen(false)}
        onApply={applyButtonPopup}
      />

      <div className={styles.layout}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>Fields</div>
          <input
            className={styles.search}
            type="search"
            placeholder="Search fields"
            aria-label="Search fields"
            value={paletteQuery}
            onChange={(e) => setPaletteQuery(e.target.value)}
          />
          <ul className={styles.fieldList}>
            {FIELD_KINDS.filter((kind) =>
              kind.toLowerCase().includes(paletteQuery.trim().toLowerCase()),
            ).map((kind) => (
              <li
                key={kind}
                className={`${styles.fieldItem} ${readonly ? styles.fieldItemDisabled : ''}`}
                draggable={!readonly}
                onDragStart={(e) => {
                  e.dataTransfer.setData(DND, JSON.stringify({ type: 'palette', kind }))
                  e.dataTransfer.effectAllowed = 'copyMove'
                }}
              >
                <span aria-hidden>⋮⋮</span>
                {kind}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.panel}>
          <div className={styles.canvasTop}>
            <Button variant="ghost" size="sm" type="button" disabled={readonly} onClick={addTab}>
              + New Tab
            </Button>
            <Button variant="ghost" size="sm" type="button" disabled={readonly} onClick={addGroup}>
              + New Group
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              disabled={readonly || !tab || tab.groups.length === 0}
              onClick={duplicateLastGroup}
              title="Duplicate the last group on this tab (same as Duplicate on the group card)"
            >
              Duplicate last group
            </Button>
          </div>
          <div className={styles.banner}>
            {templateName} · {fieldCount(working)} field(s)
          </div>

          <div
            className={styles.tabs}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
          >
            {working.tabs.map((t, i) => (
              <div
                key={t.id}
                role="tab"
                tabIndex={0}
                aria-selected={i === activeTab}
                className={`${styles.tab} ${styles.tabDrag} ${i === activeTab ? styles.tabActive : ''}`}
                draggable={canEditStructure}
                onDragStart={(e) => {
                  e.dataTransfer.setData(DND, JSON.stringify({ type: 'tab', ti: i }))
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                }}
                onDrop={(e) => onDropTabBar(i, e)}
                onClick={() => setActiveTab(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveTab(i)
                  }
                }}
              >
                <div className={styles.tabInner}>
                  <input
                    className={styles.tabTitleInput}
                    value={t.title}
                    disabled={readonly}
                    onClick={(ev) => ev.stopPropagation()}
                    onChange={(e) => setTabTitle(i, e.target.value)}
                    aria-label="Tab title"
                  />
                  {working.tabs.length > 1 && !readonly ? (
                    <button
                      type="button"
                      className={styles.tabClose}
                      aria-label="Remove tab"
                      onClick={(ev) => {
                        ev.stopPropagation()
                        removeTab(i)
                      }}
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.canvasBody}>
          {tab
            ? (() => {
                const tabBarItems = tab.groups.flatMap((g, gi) =>
                  g.fields.map((f, fi) => ({ f, gi, fi })),
                ).filter(({ f }) => f.kind === 'Button' && f.buttonPlacement === 'tab_bar')
                if (tabBarItems.length === 0) return null
                const tabBarLeft = tabBarItems.filter(({ f }) => f.tabBarButtonAlign !== 'end')
                const tabBarRight = tabBarItems.filter(({ f }) => f.tabBarButtonAlign === 'end')
                const renderTabBarEntry = ({ f, gi, fi }: { f: BuilderField; gi: number; fi: number }) => (
                  <div key={f.id} className={styles.tabBarEntry}>
                    <BuilderFieldPreview
                      field={f}
                      disabled={readonly}
                      viewAsDocument={readonly}
                      compact
                      values={fieldValues}
                      onValueChange={readonly ? undefined : onPreviewValueChange}
                      onStructureButtonClick={
                        readonly ? undefined : () => setStructureWizardOpen(true)
                      }
                      onPopupButtonClick={readonly ? undefined : () => setButtonPopupOpen(true)}
                    />
                    {!readonly ? (
                      <button
                        type="button"
                        className={styles.iconBtn}
                        aria-label="Field settings"
                        onClick={() => setSettingsTarget({ ti: activeTab, gi, fi })}
                      >
                        ⚙
                      </button>
                    ) : null}
                  </div>
                )
                return (
                  <div className={styles.tabActionBar}>
                    <div className={styles.tabBarCluster}>
                      <span className={styles.fieldMeta}>Tab actions</span>
                      <div className={styles.tabBarLeft}>{tabBarLeft.map(renderTabBarEntry)}</div>
                    </div>
                    <div className={styles.tabBarRight}>{tabBarRight.map(renderTabBarEntry)}</div>
                  </div>
                )
              })()
            : null}

          {tab
            ? tab.groups.map((g, gi) => (
                <div key={g.id} className={styles.group}>
                  <div
                    className={styles.groupHead}
                    draggable={canEditStructure}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        DND,
                        JSON.stringify({ type: 'group', ti: activeTab, gi }),
                      )
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                    }}
                    onDrop={(e) => onDropGroupHead(activeTab, gi, e)}
                  >
                    <div className={styles.groupDrag}>
                      <span aria-hidden>⋮⋮</span>
                      {readonly ? (
                        <span className={styles.groupTitleText}>{g.title}</span>
                      ) : editingGroupId === g.id ? (
                        <input
                          className={styles.groupTitleInput}
                          value={g.title}
                          onChange={(e) => setGroupTitle(activeTab, gi, e.target.value)}
                          aria-label="Group title"
                        />
                      ) : (
                        <span className={styles.groupTitleText}>{g.title}</span>
                      )}
                    </div>
                    <div className={styles.groupActions}>
                      {!readonly && editingGroupId !== g.id ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          onClick={() => setEditingGroupId(g.id)}
                        >
                          Edit
                        </Button>
                      ) : null}
                      {!readonly && editingGroupId === g.id ? (
                        <Button
                          variant="primary"
                          size="sm"
                          type="button"
                          onClick={() => setEditingGroupId(null)}
                        >
                          Done
                        </Button>
                      ) : null}
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        disabled={readonly}
                        onClick={() => duplicateGroup(activeTab, gi)}
                      >
                        Duplicate
                      </Button>
                      <select
                        className={styles.layoutSelect}
                        value={g.columns}
                        disabled={readonly}
                        onChange={(e) =>
                          setGroupColumns(activeTab, gi, Number(e.target.value) as 1 | 2)
                        }
                        aria-label="Columns"
                      >
                        <option value={2}>2 Column</option>
                        <option value={1}>1 Column</option>
                      </select>
                      <Button
                        variant="danger"
                        size="sm"
                        type="button"
                        disabled={readonly}
                        onClick={() => removeGroup(activeTab, gi)}
                      >
                        Delete group
                      </Button>
                    </div>
                  </div>
                  {g.fields.every((f) => f.kind === 'Button' && f.buttonPlacement === 'tab_bar') ? (
                    <div className={styles.groupEmpty}>
                      <p className={styles.groupEmptyTitle}>No fields in this section yet</p>
                      <p className={styles.groupEmptyHint}>
                        Drag a field type from the left palette, or drop it in the zone below.
                      </p>
                    </div>
                  ) : null}
                  <div
                    className={`${styles.fieldGrid} ${g.columns === 2 ? styles.cols2 : styles.cols1}`}
                  >
                    {g.fields.map((f, fi) => {
                      if (f.kind === 'Button' && f.buttonPlacement === 'tab_bar') {
                        return null
                      }
                      const full =
                        (f.kind === 'Button' && f.buttonPlacement === 'full_width') ||
                        f.kind === 'Notes'
                      return (
                        <div
                          key={f.id}
                          className={`${styles.fieldCard} ${full ? styles.fieldCardFull : ''} ${dragFieldOver === f.id ? styles.fieldCardDrop : ''}`}
                          draggable={canEditStructure}
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              DND,
                              JSON.stringify({ type: 'field', ti: activeTab, gi, fi }),
                            )
                            e.dataTransfer.effectAllowed = 'move'
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'move'
                            setDragFieldOver(f.id)
                          }}
                          onDragLeave={() => setDragFieldOver(null)}
                          onDrop={(e) => onDropOnField(activeTab, gi, fi, e)}
                        >
                          <div className={styles.fieldCardMainCol}>
                            <div className={styles.fieldCardTopBar}>
                              <span className={styles.fieldMeta}>{f.kind}</span>
                              {!readonly ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  type="button"
                                  onClick={() =>
                                    setSettingsTarget({ ti: activeTab, gi, fi })
                                  }
                                >
                                  Edit
                                </Button>
                              ) : null}
                            </div>
                            <div className={styles.fieldCardBody}>
                              <BuilderFieldPreview
                                field={f}
                                disabled={readonly}
                                viewAsDocument={readonly}
                                values={fieldValues}
                                onValueChange={readonly ? undefined : onPreviewValueChange}
                                onStructureButtonClick={
                                  readonly ? undefined : () => setStructureWizardOpen(true)
                                }
                                onPopupButtonClick={
                                  readonly ? undefined : () => setButtonPopupOpen(true)
                                }
                              />
                            </div>
                          </div>
                          <div className={styles.icons}>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              disabled={readonly}
                              aria-label="Field settings"
                              onClick={() =>
                                setSettingsTarget({ ti: activeTab, gi, fi })
                              }
                            >
                              ⚙
                            </button>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              disabled={readonly}
                              aria-label="Duplicate field"
                              onClick={() => duplicateFieldAt(activeTab, gi, fi)}
                              title="Duplicate field"
                            >
                              ⧉
                            </button>
                            <button
                              type="button"
                              className={styles.iconBtn}
                              disabled={readonly}
                              aria-label="Remove field"
                              onClick={() => removeField(activeTab, gi, fi)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div
                    className={`${styles.groupDropZone} ${groupDropOver === g.id ? styles.groupDropActive : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'copy'
                      setGroupDropOver(g.id)
                    }}
                    onDragLeave={() => setGroupDropOver(null)}
                    onDrop={(e) => onDropOnGroupZone(activeTab, gi, e)}
                  >
                    Drop fields here to add to this group
                  </div>
                </div>
              ))
            : null}
          </div>

        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>Context</div>
          <div className={styles.panelContextBody}>
          <div className={styles.panelSection}>
            <h3>Workflow status (three actors)</h3>
            <ol className={styles.panelSteps}>
              <li>
                <strong>POC</strong> —{' '}
                {working.status === 'draft' || working.status === 'rejected'
                  ? 'Draft / editing (current)'
                  : 'Submitted; builder locked or read-only'}
              </li>
              <li>
                <strong>BUFM</strong> —{' '}
                {working.status === 'in_review'
                  ? 'Finance review (current)'
                  : ['awaiting_kmt', 'published', 'archived'].includes(working.status)
                    ? 'Approved'
                    : 'Awaiting submission'}
              </li>
              <li>
                <strong>KMT</strong> —{' '}
                {working.status === 'awaiting_kmt'
                  ? 'Governance review / publish (current)'
                  : working.status === 'published'
                    ? 'Published (catalog)'
                    : working.status === 'archived'
                      ? 'Archived'
                      : 'Not yet in KMT queue'}
              </li>
            </ol>
          </div>
          <div className={styles.panelSection}>
            <h3>Dependency status</h3>
            <p className={styles.panelMuted}>
              {working.rsauiDependencyPending
                ? 'RSAUI / GIS coverage check: pending — resolve in RSAUI Tool before final submit in production.'
                : 'No open dependency flags.'}
            </p>
          </div>
          <div className={styles.panelSection}>
            <h3>Version timeline</h3>
            <p className={styles.panelMuted}>
              Current v{working.version}
              {working.submittedAt
                ? ` · Submitted ${new Date(working.submittedAt).toLocaleString()}`
                : ''}
            </p>
          </div>
          <div className={styles.panelSection}>
            <h3>Comments (POC · BUFM · KMT)</h3>
            <div className={styles.commentThread}>
              <div className={styles.commentBubble}>
                <div className={styles.commentMeta}>POC · visibility</div>
                You see the same thread BUFM and KMT use; rejections and governance notes appear here
                when present.
              </div>
              {working.bufmComment ? (
                <div className={styles.commentBubble}>
                  <div className={styles.commentMeta}>BUFM · latest</div>
                  {working.bufmComment}
                </div>
              ) : (
                <div className={styles.commentBubble}>
                  <div className={styles.commentMeta}>BUFM</div>
                  No finance review comment on this version yet.
                </div>
              )}
              {working.kmtComment ? (
                <div className={styles.commentBubble}>
                  <div className={styles.commentMeta}>KMT · latest</div>
                  {working.kmtComment}
                </div>
              ) : (
                <div className={styles.commentBubble}>
                  <div className={styles.commentMeta}>KMT</div>
                  No governance comment on this version yet.
                </div>
              )}
            </div>
          </div>
          <div className={styles.panelSection}>
            <h3>Builder tips</h3>
            <ul className={`${styles.workflowList} ${styles.panelTipsList}`}>
              <li>Date and time pickers are interactive while editing.</li>
              <li>Tab bar buttons: set Left/Right alignment in field settings.</li>
              <li>Notes, description, and custom icons are configured in the field gear menu.</li>
            </ul>
          </div>
          </div>
        </div>
      </div>

      <Modal
        open={submitConfirmOpen}
        title="Submit for approval?"
        onClose={() => setSubmitConfirmOpen(false)}
        footer={
          <div className={modalStyles.footer}>
            <Button variant="secondary" type="button" onClick={() => setSubmitConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        }
      >
        <p className={styles.modalBody}>
          The document will move to <strong>In review</strong> and editing will be locked until the
          review finishes.
        </p>
      </Modal>

      <Modal
        open={submitOpen}
        title="Submitted"
        onClose={() => setSubmitOpen(false)}
        footer={
          <div className={modalStyles.footer}>
            <Button variant="primary" type="button" onClick={() => setSubmitOpen(false)}>
              OK
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setSubmitOpen(false)
                navigate('/poc/dashboard')
              }}
            >
              View in Knowledge Documents
            </Button>
          </div>
        }
      >
        <p className={styles.modalBody}>
          Your document was submitted successfully. It now appears under <strong>Awaiting Approval</strong>{' '}
          with status <strong>In review</strong>.
        </p>
      </Modal>
    </div>
  )
}
