import type {
  BuilderField,
  BuilderFieldKind,
  BuilderTab,
  FieldIconPosition,
  FieldNotePosition,
  PocDocStatus,
  PocDocument,
  TabBarButtonAlign,
} from '../types/pocDocument'
import type { ReviewComment } from '../types/review'

const TEXT_KINDS: BuilderFieldKind[] = [
  'Text Input',
  'Email Input',
  'Telephone Input',
  'URL Input',
]

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'field'
  )
}

const DEFAULT_OPTIONS = ['Option 1', 'Option 2']

export function buildField(id: string, kind: BuilderFieldKind, index: number): BuilderField {
  const label =
    kind === 'Notes'
      ? `Notes ${index}`
      : kind === 'Yes/No Detail'
        ? `Policy option ${index}`
        : `${kind} ${index}`
  const partial: Partial<BuilderField> & { id: string; kind: BuilderFieldKind } = {
    id,
    kind,
    label,
    name: slug(label),
    placeholder: kind === 'Yes/No Detail' ? 'Description' : '',
    description: kind === 'Notes' ? 'Enter policy or instructional text for builders and reviewers.' : '',
    maxLength: TEXT_KINDS.includes(kind) ? 255 : undefined,
    showInfoIcon: false,
    helperNote: '',
    noteText: '',
    notePosition: 'before_control',
    iconPosition: 'none',
    options: kind === 'Dropdown' || kind === 'Radio Button' ? [...DEFAULT_OPTIONS] : [],
    checkboxOptions:
      kind === 'Checkboxes' ? ['Choice A', 'Choice B'] : kind === 'Yes/No Detail' ? [] : [],
    buttonVariant: 'primary',
    buttonAction: 'custom',
    buttonCustomLabel: 'Action',
    buttonPlacement: 'group',
    tabBarButtonAlign: 'start',
  }
  return normalizeField(partial)
}

function coalesceNotePosition(v: unknown): FieldNotePosition {
  if (v === 'after_label' || v === 'before_control' || v === 'after_control') return v
  return 'before_control'
}

function coalesceIconPosition(v: unknown): FieldIconPosition {
  if (
    v === 'before_label' ||
    v === 'after_label' ||
    v === 'before_description' ||
    v === 'after_description' ||
    v === 'none'
  ) {
    return v
  }
  return 'none'
}

function coalesceTabBarAlign(v: unknown): TabBarButtonAlign {
  return v === 'end' ? 'end' : 'start'
}

function sanitizeDependencyMap(raw: unknown): Record<string, string[]> | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const out: Record<string, string[]> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const key = k.trim()
    if (!key) continue
    if (Array.isArray(v)) {
      const opts = v.map((x) => String(x).trim()).filter(Boolean)
      if (opts.length) out[key] = opts
    }
  }
  return Object.keys(out).length > 0 ? out : undefined
}

export function normalizeField(raw: Partial<BuilderField> & { id: string; kind: BuilderFieldKind }): BuilderField {
  const label = raw.label ?? `${raw.kind}`
  const kind = raw.kind
  return {
    id: raw.id,
    kind,
    label,
    name: raw.name && raw.name.length > 0 ? raw.name : slug(label),
    placeholder: raw.placeholder ?? '',
    description: raw.description ?? '',
    showInfoIcon: Boolean(raw.showInfoIcon),
    helperNote: raw.helperNote ?? '',
    noteText: raw.noteText ?? '',
    notePosition: coalesceNotePosition(raw.notePosition),
    iconDataUrl: raw.iconDataUrl && raw.iconDataUrl.length > 0 ? raw.iconDataUrl : undefined,
    iconPosition: coalesceIconPosition(raw.iconPosition),
    options:
      kind === 'Dropdown' || kind === 'Radio Button'
        ? raw.options && raw.options.length > 0
          ? [...raw.options]
          : [...DEFAULT_OPTIONS]
        : [],
    checkboxOptions:
      kind === 'Checkboxes'
        ? raw.checkboxOptions && raw.checkboxOptions.length > 0
          ? [...raw.checkboxOptions]
          : ['Choice A', 'Choice B']
        : [],
    maxLength:
      raw.maxLength !== undefined
        ? raw.maxLength
        : TEXT_KINDS.includes(kind)
          ? 255
          : undefined,
    buttonVariant: raw.buttonVariant ?? 'primary',
    buttonAction: raw.buttonAction ?? 'custom',
    buttonCustomLabel: raw.buttonCustomLabel ?? 'Action',
    buttonPlacement: raw.buttonPlacement ?? 'group',
    tabBarButtonAlign: coalesceTabBarAlign(raw.tabBarButtonAlign),
    dependsOnFieldId:
      kind === 'Dropdown' || kind === 'Radio Button'
        ? typeof raw.dependsOnFieldId === 'string' && raw.dependsOnFieldId.trim()
          ? raw.dependsOnFieldId.trim()
          : undefined
        : undefined,
    dependencyOptionMap:
      kind === 'Dropdown' || kind === 'Radio Button'
        ? sanitizeDependencyMap(raw.dependencyOptionMap)
        : undefined,
  }
}

export function normalizeTabs(tabs: BuilderTab[]): BuilderTab[] {
  return tabs.map((tab) => ({
    ...tab,
    groups: tab.groups.map((g) => ({
      ...g,
      fields: g.fields.map((f) => normalizeField(f)),
    })),
  }))
}

const VALID_STATUS = new Set<PocDocStatus>([
  'draft',
  'in_review',
  'rejected',
  'awaiting_kmt',
  'published',
  'archived',
])

function coerceStatus(s: unknown): PocDocStatus {
  if (typeof s === 'string' && VALID_STATUS.has(s as PocDocStatus)) {
    return s as PocDocStatus
  }
  return 'draft'
}

const THREAD_ROLES = new Set<ReviewComment['role']>(['POC', 'BUFM', 'KMT'])

function normalizeThread(raw: unknown): ReviewComment[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (c): c is ReviewComment =>
        c &&
        typeof c === 'object' &&
        typeof (c as ReviewComment).id === 'string' &&
        typeof (c as ReviewComment).body === 'string' &&
        typeof (c as ReviewComment).at === 'string' &&
        typeof (c as ReviewComment).role === 'string' &&
        THREAD_ROLES.has((c as ReviewComment).role as ReviewComment['role']),
    )
    .map((c) => {
      const authorName =
        typeof (c as ReviewComment).authorName === 'string'
          ? (c as ReviewComment).authorName
          : undefined
      const editedAt =
        typeof (c as ReviewComment).editedAt === 'string'
          ? (c as ReviewComment).editedAt
          : undefined
      return {
        ...c,
        authorName,
        editedAt,
      }
    })
}

export function normalizePocDocument(doc: PocDocument): PocDocument {
  return {
    ...doc,
    status: coerceStatus(doc.status),
    tabs: normalizeTabs(doc.tabs),
    reviewThread: normalizeThread(doc.reviewThread),
  }
}
