export type RsauiApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface RsauiApprovalItem {
  id: string
  title: string
  pocName: string
  status: RsauiApprovalStatus
  /** When true, show “revalidate configuration” banner */
  configOutdated: boolean
  updatedAt: string
  version: string
  productDetails: string
  pricingConfig: string
  coverage: string
  changeHighlights: string[]
  /** Thread shown in right panel */
  comments: Array<{ id: string; role: 'BUFM' | 'POC'; body: string; at: string }>
}
