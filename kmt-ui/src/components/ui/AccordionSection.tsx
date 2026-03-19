import { useState, type ReactNode } from 'react'
import { Badge } from './Badge'
import styles from './AccordionSection.module.css'

interface AccordionSectionProps {
  title: string
  requiredBadge?: boolean
  defaultOpen?: boolean
  children: ReactNode
  variant?: 'default' | 'muted'
}

export function AccordionSection({
  title,
  requiredBadge,
  defaultOpen = true,
  children,
  variant = 'default',
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={styles.section}>
      <button
        type="button"
        className={`${styles.header} ${variant === 'muted' ? styles.headerMuted : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles.left}>
          {title}
          {requiredBadge ? <Badge tone="awaiting">Required</Badge> : null}
        </span>
        <span className={styles.chev}>{open ? '▴' : '▾'}</span>
      </button>
      {open ? <div className={styles.body}>{children}</div> : null}
    </div>
  )
}
