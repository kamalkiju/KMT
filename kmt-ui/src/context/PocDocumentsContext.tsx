import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { normalizePocDocument } from './fieldNormalization'
import type { BuilderTab, PocDocument } from '../types/pocDocument'
import type { ReviewComment } from '../types/review'
import {
  genId,
  loadDocuments,
  persistDocuments,
  POC_DOCUMENTS_STORAGE_KEY,
  POC_DOCUMENTS_SYNC,
  tabsForTemplate,
} from './pocDocumentDefaults'

interface PocDocumentsContextValue {
  documents: PocDocument[]
  getById: (id: string) => PocDocument | undefined
  hasRsauiDependency: boolean
  createDraft: (documentTemplateId: string, name?: string, ownerName?: string) => PocDocument
  saveDocument: (doc: PocDocument) => void
  saveDraft: (doc: PocDocument) => void
  submitDocument: (doc: PocDocument) => void
  /** BUFM approves knowledge doc → awaiting KMT */
  approveByBufm: (id: string) => void
  rejectByBufm: (id: string, comment: string) => void
  addDocumentReviewComment: (
    id: string,
    role: ReviewComment['role'],
    body: string,
    authorName?: string,
  ) => void
  updateDocumentReviewComment: (docId: string, commentId: string, body: string) => void
  /** KMT publishes (optional snapshot merges working copy from builder) */
  approveByKmt: (id: string, snapshot?: PocDocument) => void
  /** KMT returns to POC */
  rejectByKmt: (id: string, comment: string) => void
  markRejected: (id: string) => void
  requestArchive: (id: string, reason: string) => void
  approveArchive: (id: string) => void
  rejectArchiveRequest: (id: string) => void
  /** Restore archived document to published catalog (demo) */
  restoreFromArchive: (id: string) => void
  cloneDocument: (id: string) => PocDocument | undefined
  deleteDocument: (id: string) => void
}

const PocDocumentsContext = createContext<PocDocumentsContextValue | null>(null)

function withReviewComment(
  d: PocDocument,
  role: ReviewComment['role'],
  body: string,
  authorName?: string,
): PocDocument {
  const entry: ReviewComment = {
    id: genId(),
    role,
    body,
    at: new Date().toISOString(),
    ...(authorName?.trim() ? { authorName: authorName.trim() } : {}),
  }
  return {
    ...d,
    reviewThread: [...(d.reviewThread ?? []), entry],
  }
}

function cloneTabsDeep(tabs: BuilderTab[]): BuilderTab[] {
  return tabs.map((tab) => ({
    ...tab,
    id: genId(),
    groups: tab.groups.map((g) => ({
      ...g,
      id: genId(),
      fields: g.fields.map((f) => ({
        ...f,
        id: genId(),
      })),
    })),
  }))
}

export function PocDocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<PocDocument[]>(() => loadDocuments())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== POC_DOCUMENTS_STORAGE_KEY || e.storageArea !== localStorage) return
      if (e.newValue == null) return
      try {
        const parsed = JSON.parse(e.newValue) as unknown
        if (!Array.isArray(parsed)) return
        setDocuments(parsed.map((d) => normalizePocDocument(d as PocDocument)))
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    const sync = () => setDocuments(loadDocuments())
    window.addEventListener(POC_DOCUMENTS_SYNC, sync)
    return () => window.removeEventListener(POC_DOCUMENTS_SYNC, sync)
  }, [])

  const getById = useCallback(
    (id: string) => documents.find((d) => d.id === id),
    [documents],
  )

  const hasRsauiDependency = useMemo(
    () => documents.some((d) => d.rsauiDependencyPending),
    [documents],
  )

  const createDraft = useCallback(
    (documentTemplateId: string, name = 'Untitled document', ownerName?: string) => {
      const now = new Date().toISOString()
      const doc = normalizePocDocument({
        id: genId(),
        name,
        documentTemplateId,
        status: 'draft',
        tabs: tabsForTemplate(documentTemplateId),
        updatedAt: now,
        version: '0.1',
        rsauiDependencyPending: true,
        ownerName: ownerName?.trim() || undefined,
        reviewThread: [],
      })
      setDocuments((prev) => {
        const next = [doc, ...prev]
        persistDocuments(next)
        return next
      })
      return doc
    },
    [],
  )

  const saveDocument = useCallback((doc: PocDocument) => {
    const payload = normalizePocDocument(doc)
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === payload.id)
      const next = exists ? prev.map((d) => (d.id === payload.id ? payload : d)) : [payload, ...prev]
      persistDocuments(next)
      return next
    })
  }, [])

  const saveDraft = useCallback(
    (doc: PocDocument) => {
      const payload = normalizePocDocument({
        ...doc,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      })
      saveDocument(payload)
    },
    [saveDocument],
  )

  const submitDocument = useCallback((doc: PocDocument) => {
    const now = new Date().toISOString()
    const payload = normalizePocDocument({
      ...doc,
      status: 'in_review',
      updatedAt: now,
      submittedAt: doc.submittedAt ?? now,
      bufmComment: undefined,
      bufmRejectedAt: undefined,
      bufmApprovedAt: undefined,
      kmtComment: undefined,
      kmtRejectedAt: undefined,
    })
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === payload.id)
      const next = exists ? prev.map((d) => (d.id === payload.id ? payload : d)) : [payload, ...prev]
      persistDocuments(next)
      return next
    })
  }, [])

  const approveByBufm = useCallback((id: string) => {
    const now = new Date().toISOString()
    setDocuments((prev) => {
      const next = prev.map((d) => {
        if (d.id !== id) return d
        const merged = withReviewComment(
          {
            ...d,
            status: 'awaiting_kmt' as const,
            updatedAt: now,
            bufmComment: undefined,
            bufmRejectedAt: undefined,
            bufmApprovedAt: now,
          },
          'BUFM',
          'Approved by BUFM — forwarded to KMT governance review.',
        )
        return normalizePocDocument(merged)
      })
      persistDocuments(next)
      return next
    })
  }, [])

  const rejectByBufm = useCallback((id: string, comment: string) => {
    const trimmed = comment.trim()
    if (!trimmed) return
    const now = new Date().toISOString()
    setDocuments((prev) => {
      const next = prev.map((d) => {
        if (d.id !== id) return d
        const merged = withReviewComment(
          {
            ...d,
            status: 'rejected' as const,
            updatedAt: now,
            bufmComment: trimmed,
            bufmRejectedAt: now,
            version: String((Number.parseFloat(d.version) || 0) + 0.1),
          },
          'BUFM',
          `Rejected by BUFM: ${trimmed}`,
        )
        return normalizePocDocument(merged)
      })
      persistDocuments(next)
      return next
    })
  }, [])

  const addDocumentReviewComment = useCallback(
    (id: string, role: ReviewComment['role'], body: string, authorName?: string) => {
      const trimmed = body.trim()
      if (!trimmed) return
      setDocuments((prev) => {
        const next = prev.map((d) => {
          if (d.id !== id) return d
          return normalizePocDocument(withReviewComment(d, role, trimmed, authorName))
        })
        persistDocuments(next)
        return next
      })
    },
    [],
  )

  const updateDocumentReviewComment = useCallback((docId: string, commentId: string, body: string) => {
    const trimmed = body.trim()
    if (!trimmed) return
    const now = new Date().toISOString()
    setDocuments((prev) => {
      const next = prev.map((d) => {
        if (d.id !== docId) return d
        const thread = d.reviewThread ?? []
        const idx = thread.findIndex((c) => c.id === commentId)
        if (idx < 0) return d
        const nextThread = [...thread]
        nextThread[idx] = {
          ...nextThread[idx],
          body: trimmed,
          editedAt: now,
        }
        return normalizePocDocument({ ...d, reviewThread: nextThread, updatedAt: now })
      })
      persistDocuments(next)
      return next
    })
  }, [])

  const approveByKmt = useCallback((id: string, snapshot?: PocDocument) => {
    const now = new Date().toISOString()
    const exp = new Date()
    exp.setFullYear(exp.getFullYear() + 1)
    const expiryDate = exp.toISOString().slice(0, 10)
    setDocuments((prev) => {
      const next = prev.map((d) => {
        if (d.id !== id) return d
        const base = snapshot
          ? normalizePocDocument({
              ...snapshot,
              id: d.id,
              documentTemplateId: snapshot.documentTemplateId || d.documentTemplateId,
            })
          : d
        const merged = withReviewComment(
          {
            ...base,
            status: 'published' as const,
            updatedAt: now,
            publishedAt: now,
            expiryDate: base.expiryDate ?? expiryDate,
            kmtComment: undefined,
            kmtRejectedAt: undefined,
            pendingArchive: undefined,
          },
          'KMT',
          'Approved and published by KMT.',
        )
        return normalizePocDocument(merged)
      })
      persistDocuments(next)
      return next
    })
  }, [])

  const rejectByKmt = useCallback((id: string, comment: string) => {
    const trimmed = comment.trim()
    if (!trimmed) return
    const now = new Date().toISOString()
    setDocuments((prev) => {
      const next = prev.map((d) => {
        if (d.id !== id) return d
        const merged = withReviewComment(
          {
            ...d,
            status: 'rejected' as const,
            updatedAt: now,
            kmtComment: trimmed,
            kmtRejectedAt: now,
            version: String((Number.parseFloat(d.version) || 0) + 0.1),
          },
          'KMT',
          `Rejected by KMT: ${trimmed}`,
        )
        return normalizePocDocument(merged)
      })
      persistDocuments(next)
      return next
    })
  }, [])

  const markRejected = useCallback((id: string) => {
    setDocuments((prev) => {
      const next = prev.map((d) =>
        d.id === id
          ? normalizePocDocument({
              ...d,
              status: 'rejected' as const,
              updatedAt: new Date().toISOString(),
              version: String((Number.parseFloat(d.version) || 0) + 0.1),
            })
          : d,
      )
      persistDocuments(next)
      return next
    })
  }, [])

  const requestArchive = useCallback((id: string, reason: string) => {
    const trimmed = reason.trim()
    if (!trimmed) return
    const now = new Date().toISOString()
    setDocuments((prev) => {
      const next = prev.map((d) =>
        d.id === id && d.status === 'published'
          ? normalizePocDocument({
              ...d,
              updatedAt: now,
              pendingArchive: { reason: trimmed, at: now },
            })
          : d,
      )
      persistDocuments(next)
      return next
    })
  }, [])

  const approveArchive = useCallback((id: string) => {
    const now = new Date().toISOString()
    setDocuments((prev) => {
      const next = prev.map((d) => {
        if (d.id !== id || !d.pendingArchive) return d
        const reason = d.pendingArchive.reason
        return normalizePocDocument(
          withReviewComment(
            {
              ...d,
              status: 'archived' as const,
              updatedAt: now,
              archivedAt: now,
              archiveReason: reason,
              pendingArchive: undefined,
            },
            'KMT',
            `Archive approved. Reason: ${reason}`,
          ),
        )
      })
      persistDocuments(next)
      return next
    })
  }, [])

  const restoreFromArchive = useCallback((id: string) => {
    const now = new Date().toISOString()
    setDocuments((prev) => {
      const next = prev.map((d) =>
        d.id === id && d.status === 'archived'
          ? normalizePocDocument({
              ...d,
              status: 'published' as const,
              updatedAt: now,
              archivedAt: undefined,
              archiveReason: undefined,
              version: String((Number.parseFloat(d.version) || 0) + 0.1),
            })
          : d,
      )
      persistDocuments(next)
      return next
    })
  }, [])

  const rejectArchiveRequest = useCallback((id: string) => {
    const now = new Date().toISOString()
    setDocuments((prev) => {
      const next = prev.map((d) =>
        d.id === id
          ? normalizePocDocument({
              ...d,
              updatedAt: now,
              pendingArchive: undefined,
            })
          : d,
      )
      persistDocuments(next)
      return next
    })
  }, [])

  const cloneDocument = useCallback((id: string): PocDocument | undefined => {
    let copy: PocDocument | undefined
    setDocuments((prev) => {
      const src = prev.find((d) => d.id === id)
      if (!src) return prev
      const now = new Date().toISOString()
      copy = normalizePocDocument({
        ...src,
        id: genId(),
        name: `${src.name} (copy)`,
        status: 'draft',
        tabs: cloneTabsDeep(src.tabs),
        updatedAt: now,
        version: '0.1',
        rsauiDependencyPending: src.rsauiDependencyPending,
        submittedAt: undefined,
        bufmComment: undefined,
        bufmRejectedAt: undefined,
        bufmApprovedAt: undefined,
        kmtComment: undefined,
        kmtRejectedAt: undefined,
        publishedAt: undefined,
        expiryDate: undefined,
        reviewThread: [],
        pendingArchive: undefined,
        archivedAt: undefined,
        archiveReason: undefined,
      })
      const next = [copy, ...prev]
      persistDocuments(next)
      return next
    })
    return copy
  }, [])

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => {
      const next = prev.filter((d) => d.id !== id)
      persistDocuments(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      documents,
      getById,
      hasRsauiDependency,
      createDraft,
      saveDocument,
      saveDraft,
      submitDocument,
      approveByBufm,
      rejectByBufm,
      addDocumentReviewComment,
      updateDocumentReviewComment,
      approveByKmt,
      rejectByKmt,
      markRejected,
      requestArchive,
      approveArchive,
      rejectArchiveRequest,
      restoreFromArchive,
      cloneDocument,
      deleteDocument,
    }),
    [
      documents,
      getById,
      hasRsauiDependency,
      createDraft,
      saveDocument,
      saveDraft,
      submitDocument,
      approveByBufm,
      rejectByBufm,
      addDocumentReviewComment,
      updateDocumentReviewComment,
      approveByKmt,
      rejectByKmt,
      markRejected,
      requestArchive,
      approveArchive,
      rejectArchiveRequest,
      restoreFromArchive,
      cloneDocument,
      deleteDocument,
    ],
  )

  return (
    <PocDocumentsContext.Provider value={value}>{children}</PocDocumentsContext.Provider>
  )
}

export function usePocDocuments(): PocDocumentsContextValue {
  const ctx = useContext(PocDocumentsContext)
  if (!ctx) throw new Error('usePocDocuments must be used within PocDocumentsProvider')
  return ctx
}
