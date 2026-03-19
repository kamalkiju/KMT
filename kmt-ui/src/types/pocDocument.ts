import type { ReviewComment } from './review'

export type BuilderFieldKind =
  | 'Text Input'
  | 'Email Input'
  | 'Number Input'
  | 'Currency Input'
  | 'Percentage Input'
  | 'Telephone Input'
  | 'URL Input'
  | 'Date Input'
  | 'Time Input'
  | 'File Upload'
  | 'Radio Button'
  | 'Checkboxes'
  | 'Dropdown'
  | 'Button'
  | 'Image Input'
  | 'Toggle Switch'
  /** Static instructional / policy note block (no data entry) */
  | 'Notes'
  /** Title + Yes/No radios + description line (policy-style cards) */
  | 'Yes/No Detail'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

/** PRD-style button actions */
export type ButtonAction =
  | 'submit'
  | 'reset'
  | 'save_draft'
  | 'custom'
  | 'add_structure'
  /** Opens builder popup to add tab(s), groups, and fields */
  | 'popup'

/** Where the button appears in the tab */
export type ButtonPlacement = 'group' | 'full_width' | 'tab_bar'

/** When placement is tab_bar: align actions to the left or right of the tab action strip */
export type TabBarButtonAlign = 'start' | 'end'

/** Rich note callout position relative to label / control */
export type FieldNotePosition = 'after_label' | 'before_control' | 'after_control'

/** Optional custom icon (data URL) placement */
export type FieldIconPosition =
  | 'none'
  | 'before_label'
  | 'after_label'
  | 'before_description'
  | 'after_description'

export interface BuilderField {
  id: string
  kind: BuilderFieldKind
  /** Visible label */
  label: string
  /** Internal name / key */
  name: string
  placeholder: string
  /** Longer guidance shown in the form (between label and input when set) */
  description: string
  /** Text-like fields */
  maxLength?: number
  showInfoIcon: boolean
  /** Optional note under the control */
  helperNote: string
  /** Highlighted notes / policy callout (see notePosition) */
  noteText: string
  notePosition: FieldNotePosition
  /** Optional small image beside label or description (demo: data URL from upload) */
  iconDataUrl?: string
  iconPosition: FieldIconPosition
  /** Dropdown, Radio */
  options: string[]
  /** Checkboxes (multi) */
  checkboxOptions: string[]
  /** Button only */
  buttonVariant: ButtonVariant
  buttonAction: ButtonAction
  buttonCustomLabel: string
  buttonPlacement: ButtonPlacement
  /** Only when buttonPlacement === 'tab_bar' */
  tabBarButtonAlign: TabBarButtonAlign
  /** Dropdown / Radio: show options based on another field’s value (same tab) */
  dependsOnFieldId?: string
  /** Parent value → option labels for this field (when dependsOnFieldId is set) */
  dependencyOptionMap?: Record<string, string[]>
}

export interface BuilderGroup {
  id: string
  title: string
  columns: 1 | 2
  fields: BuilderField[]
}

export interface BuilderTab {
  id: string
  title: string
  groups: BuilderGroup[]
}

export type PocDocStatus =
  | 'draft'
  | 'in_review'
  | 'rejected'
  | 'awaiting_kmt'
  | 'published'
  | 'archived'

export interface PocDocument {
  id: string
  name: string
  documentTemplateId: string
  status: PocDocStatus
  tabs: BuilderTab[]
  updatedAt: string
  version: string
  rsauiDependencyPending: boolean
  /** POC display name when document was created (shared queue for BUFM) */
  ownerName?: string
  /** Set when submitted for BUFM review */
  submittedAt?: string
  /** Latest BUFM rejection feedback for POC */
  bufmComment?: string
  /** Cleared on new submit after rejection */
  bufmRejectedAt?: string
  /** When BUFM approved toward KMT */
  bufmApprovedAt?: string
  /** Latest KMT rejection feedback for POC */
  kmtComment?: string
  kmtRejectedAt?: string
  /** When KMT published */
  publishedAt?: string
  /** ISO date yyyy-mm-dd for lifecycle UI */
  expiryDate?: string
  /** Inline review thread (BUFM / KMT / POC) */
  reviewThread?: ReviewComment[]
  /** KMT initiated archive — pending second approval step (demo: self-approve on archive screen) */
  pendingArchive?: { reason: string; at: string }
  archivedAt?: string
  /** Captured when archive is approved (library column) */
  archiveReason?: string
}

export interface DocumentTemplateOption {
  id: string
  name: string
}
