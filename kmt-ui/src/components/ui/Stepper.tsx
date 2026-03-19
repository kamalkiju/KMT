import styles from './Stepper.module.css'

export interface StepperStep {
  id: string
  label: string
  current: number
  total: number
  active?: boolean
}

export function Stepper({ steps }: { steps: StepperStep[] }) {
  return (
    <div className={styles.row}>
      {steps.map((s, i) => {
        const pct = s.total ? Math.round((s.current / s.total) * 100) : 0
        return (
          <div
            key={s.id}
            className={`${styles.step} ${s.active ? styles.stepActive : ''}`}
          >
            <div className={styles.top}>
              <div
                className={`${styles.circle} ${s.active ? styles.circleActive : ''}`}
              >
                {i + 1}
              </div>
              <span className={styles.label}>{s.label}</span>
            </div>
            <svg
              className={styles.miniSvg}
              viewBox="0 0 100 4"
              preserveAspectRatio="none"
              aria-hidden
            >
              <rect className={styles.miniTrack} x="0" y="0" width="100" height="4" rx="2" />
              <rect className={styles.miniFill} x="0" y="0" width={pct} height="4" rx="2" />
            </svg>
            <div className={styles.meta}>
              {s.current}/{s.total} complete
            </div>
          </div>
        )
      })}
    </div>
  )
}
