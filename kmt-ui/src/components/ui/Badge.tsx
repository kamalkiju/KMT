import styles from './Badge.module.css'

export type BadgeTone =
  | 'draft'
  | 'rejected'
  | 'published'
  | 'archived'
  | 'awaiting'
  | 'new'
  | 'offered'
  | 'warn'
  | 'expired'

const MAP: Record<BadgeTone, string> = {
  draft: styles.draft,
  rejected: styles.rejected,
  published: styles.published,
  archived: styles.archived,
  awaiting: styles.awaiting,
  new: styles.new,
  offered: styles.offered,
  warn: styles.warn,
  expired: styles.expired,
}

export function Badge({ tone, children }: { tone: BadgeTone; children: string }) {
  return <span className={`${styles.badge} ${MAP[tone]}`}>{children}</span>
}
