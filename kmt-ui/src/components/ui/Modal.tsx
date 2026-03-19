import type { ReactNode } from 'react'
import { Button } from './Button'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** Wider panel for document previews */
  wide?: boolean
  /** Maximum width for long-form read-only content */
  extraWide?: boolean
}

export function Modal({ open, title, onClose, children, footer, wide, extraWide }: ModalProps) {
  if (!open) return null
  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className={`${styles.panel} ${wide ? styles.panelWide : ''} ${extraWide ? styles.panelExtraWide : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
        </div>
        <div className={styles.body}>{children}</div>
        {footer ?? (
          <div className={styles.footer}>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
