import styles from './RichTextMock.module.css'

interface RichTextMockProps {
  label?: string
  labelAccent?: boolean
  placeholder?: string
}

export function RichTextMock({
  label,
  labelAccent,
  placeholder = 'Rich text content…',
}: RichTextMockProps) {
  return (
    <div>
      {label ? (
        <div className={labelAccent ? styles.orangeLabel : styles.plainLabel}>
          {label}
          {labelAccent ? (
            <button type="button" className={styles.toolBtn} aria-label="Info">
              i
            </button>
          ) : null}
        </div>
      ) : null}
      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          {['•', '1.', 'B', 'I', 'U', '🔗'].map((t) => (
            <button key={t} type="button" className={styles.toolBtn}>
              {t}
            </button>
          ))}
        </div>
        <div className={styles.area}>{placeholder}</div>
      </div>
    </div>
  )
}
