export type ReviewCommentRole = 'BUFM' | 'KMT' | 'POC'

export interface ReviewComment {
  id: string
  role: ReviewCommentRole
  body: string
  at: string
  /** Reviewer display name when posted (demo). */
  authorName?: string
  /** Set when body was edited after post. */
  editedAt?: string
}
