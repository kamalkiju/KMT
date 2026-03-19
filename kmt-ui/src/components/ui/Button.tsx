import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const v =
    variant === 'primary'
      ? styles.primary
      : variant === 'secondary'
        ? styles.secondary
        : variant === 'ghost'
          ? styles.ghost
          : variant === 'success'
            ? styles.success
            : styles.danger
  const s = size === 'sm' ? styles.sm : ''
  return (
    <button
      type={type}
      className={`${styles.btn} ${v} ${s} ${disabled ? styles.disabled : ''} ${className}`.trim()}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
