import { useMemo, useState } from 'react'
import type { BuilderFieldKind } from '../../types/pocDocument'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import modalStyles from '../ui/Modal.module.css'
import styles from './PocStructureWizardModal.module.css'

const WIZARD_KINDS: BuilderFieldKind[] = [
  'Text Input',
  'Email Input',
  'Number Input',
  'Dropdown',
  'Radio Button',
  'Checkboxes',
  'Date Input',
  'Notes',
  'Yes/No Detail',
]

interface PocStructureWizardModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (payload: {
    groupTitle: string
    columns: 1 | 2
    kinds: BuilderFieldKind[]
  }) => void
}

export function PocStructureWizardModal({ open, onClose, onConfirm }: PocStructureWizardModalProps) {
  const [step, setStep] = useState(0)
  const [groupTitle, setGroupTitle] = useState('New group')
  const [columns, setColumns] = useState<1 | 2>(2)
  const [picked, setPicked] = useState<Set<BuilderFieldKind>>(() => new Set(['Text Input']))

  const toggle = (k: BuilderFieldKind) => {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  const canNext = groupTitle.trim().length > 0
  const canFinish = picked.size > 0

  const steps = useMemo(() => ['Group', 'Fields'], [])

  const handleClose = () => {
    setStep(0)
    setGroupTitle('New group')
    setColumns(2)
    setPicked(new Set(['Text Input']))
    onClose()
  }

  const finish = () => {
    onConfirm({
      groupTitle: groupTitle.trim(),
      columns,
      kinds: [...picked],
    })
    handleClose()
  }

  return (
    <Modal
      open={open}
      title="Add group & fields"
      onClose={handleClose}
      wide
      footer={
        <div className={modalStyles.footer}>
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          {step === 0 ? (
            <Button
              variant="primary"
              type="button"
              disabled={!canNext}
              onClick={() => setStep(1)}
            >
              Next
            </Button>
          ) : (
            <>
              <Button variant="secondary" type="button" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button variant="primary" type="button" disabled={!canFinish} onClick={finish}>
                Add to tab
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className={styles.stepper}>
        {steps.map((s, i) => (
          <div
            key={s}
            className={`${styles.stepDot} ${i === step ? styles.stepDotOn : ''} ${i < step ? styles.stepDotDone : ''}`}
          >
            <span className={styles.stepNum}>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <div className={styles.body}>
          <h3 className={styles.sectionTitle}>Group details</h3>
          <label className={styles.lbl} htmlFor="wiz-title">
            Group title
          </label>
          <input
            id="wiz-title"
            className={styles.input}
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
          />
          <label className={styles.lbl} htmlFor="wiz-cols">
            Layout
          </label>
          <select
            id="wiz-cols"
            className={styles.input}
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value) as 1 | 2)}
          >
            <option value={2}>Two columns</option>
            <option value={1}>One column</option>
          </select>
        </div>
      ) : (
        <div className={styles.body}>
          <h3 className={styles.sectionTitle}>Field types to insert</h3>
          <p className={styles.lead}>Select one or more; they are added in order to the new group.</p>
          <ul className={styles.kindList}>
            {WIZARD_KINDS.map((k) => (
              <li key={k}>
                <label className={styles.kindRow}>
                  <input
                    type="checkbox"
                    checked={picked.has(k)}
                    onChange={() => toggle(k)}
                  />
                  <span>{k}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  )
}
