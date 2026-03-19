import type { ReactNode } from 'react'
import styles from './FormField.module.css'

interface FormFieldProps {
  label: string
  required?: boolean
  info?: boolean
  hint?: string
  labelTone?: 'default' | 'accent'
  children: ReactNode
}

export function FormField({
  label,
  required,
  info,
  hint,
  labelTone = 'default',
  children,
}: FormFieldProps) {
  const labelClass = labelTone === 'accent' ? styles.labelAccent : styles.label
  return (
    <div className={styles.wrap}>
      <div className={styles.labelRow}>
        <label className={labelClass}>
          {label}
          {required ? <span className={styles.required}> *</span> : null}
        </label>
        {info ? (
          <button type="button" className={styles.infoBtn} aria-label={`Info: ${label}`}>
            i
          </button>
        ) : null}
      </div>
      {children}
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  )
}
