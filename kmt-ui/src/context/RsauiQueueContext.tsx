import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { RsauiApprovalItem } from '../types/rsaui'
import { genId } from './pocDocumentDefaults'
import {
  loadRsauiQueue,
  persistRsauiQueue,
  RSAUI_QUEUE_STORAGE_KEY,
} from './rsauiQueueDefaults'

interface RsauiQueueContextValue {
  items: RsauiApprovalItem[]
  getRsauiById: (id: string) => RsauiApprovalItem | undefined
  approveRsaui: (id: string) => void
  rejectRsaui: (id: string, comment: string) => void
  addRsauiComment: (id: string, body: string) => void
}

const RsauiQueueContext = createContext<RsauiQueueContextValue | null>(null)

export function RsauiQueueProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RsauiApprovalItem[]>(() => loadRsauiQueue())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== RSAUI_QUEUE_STORAGE_KEY || e.storageArea !== localStorage) return
      if (e.newValue == null) return
      try {
        const parsed = JSON.parse(e.newValue) as RsauiApprovalItem[]
        if (!Array.isArray(parsed)) return
        setItems(parsed)
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const getRsauiById = useCallback(
    (id: string) => items.find((x) => x.id === id),
    [items],
  )

  const approveRsaui = useCallback((id: string) => {
    const now = new Date().toISOString()
    setItems((prev) => {
      const next = prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status: 'approved' as const,
              updatedAt: now,
              configOutdated: false,
              comments: [
                ...x.comments,
                { id: genId(), role: 'BUFM' as const, body: 'Approved by BUFM.', at: now },
              ],
            }
          : x,
      )
      persistRsauiQueue(next)
      return next
    })
  }, [])

  const rejectRsaui = useCallback((id: string, comment: string) => {
    const trimmed = comment.trim()
    if (!trimmed) return
    const now = new Date().toISOString()
    setItems((prev) => {
      const next = prev.map((x) =>
        x.id === id
          ? {
              ...x,
              status: 'rejected' as const,
              updatedAt: now,
              comments: [
                ...x.comments,
                {
                  id: genId(),
                  role: 'BUFM' as const,
                  body: `Rejected by BUFM: ${trimmed}`,
                  at: now,
                },
              ],
            }
          : x,
      )
      persistRsauiQueue(next)
      return next
    })
  }, [])

  const addRsauiComment = useCallback((id: string, body: string) => {
    const trimmed = body.trim()
    if (!trimmed) return
    const now = new Date().toISOString()
    setItems((prev) => {
      const next = prev.map((x) =>
        x.id === id
          ? {
              ...x,
              updatedAt: now,
              comments: [
                ...x.comments,
                { id: genId(), role: 'BUFM' as const, body: trimmed, at: now },
              ],
            }
          : x,
      )
      persistRsauiQueue(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      items,
      getRsauiById,
      approveRsaui,
      rejectRsaui,
      addRsauiComment,
    }),
    [items, getRsauiById, approveRsaui, rejectRsaui, addRsauiComment],
  )

  return <RsauiQueueContext.Provider value={value}>{children}</RsauiQueueContext.Provider>
}

export function useRsauiQueue(): RsauiQueueContextValue {
  const ctx = useContext(RsauiQueueContext)
  if (!ctx) throw new Error('useRsauiQueue must be used within RsauiQueueProvider')
  return ctx
}
