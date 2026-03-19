import { DOCUMENT_TEMPLATES } from '../../context/pocDocumentDefaults'
import type { PocDocument } from '../../types/pocDocument'

export function templateDisplayName(templateId: string): string {
  const t = DOCUMENT_TEMPLATES.find((x) => x.id === templateId)
  return t?.name ?? templateId
}

export function knowledgeBufmStatusLabel(d: PocDocument): string {
  if (d.status === 'in_review') return 'Pending review'
  if (d.status === 'awaiting_kmt') return 'Approved — KMT queue'
  if (d.status === 'rejected') return 'Returned'
  if (d.status === 'published') return 'Published'
  return d.status
}

export function documentStageLabel(d: PocDocument): string {
  if (d.status === 'draft') return 'POC'
  if (d.status === 'in_review') return 'BUFM'
  if (d.status === 'awaiting_kmt') return 'KMT'
  if (d.status === 'published') return 'Active'
  if (d.status === 'archived') return 'Archived'
  if (d.status === 'rejected') return 'Returned'
  return d.status
}
