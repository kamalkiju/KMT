import { useEffect, useState } from 'react'
import type { BuilderFieldKind } from '../../types/pocDocument'
import { genId } from '../../context/pocDocumentDefaults'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import modalStyles from '../ui/Modal.module.css'
import styles from './PocButtonPopupModal.module.css'

const POPUP_FIELD_KINDS: BuilderFieldKind[] = [
  'Text Input',
  'Email Input',
  'Number Input',
  'Currency Input',
  'Dropdown',
  'Radio Button',
  'Checkboxes',
  'Date Input',
  'Time Input',
  'Notes',
  'Yes/No Detail',
  'Toggle Switch',
  'Button',
]

export interface PopupStructurePayload {
  targetTab: 'current' | 'new'
  newTabTitle: string
  groups: Array<{
    title: string
    columns: 1 | 2
    kinds: BuilderFieldKind[]
  }>
}

interface GroupRow {
  key: string
  title: string
  columns: 1 | 2
  kinds: Set<BuilderFieldKind>
}

function emptyRow(): GroupRow {
  return {
    key: genId(),
    title: 'New group',
    columns: 2,
    kinds: new Set<BuilderFieldKind>(['Text Input']),
  }
}

interface PocButtonPopupModalProps {
  open: boolean
  onClose: () => void
  onApply: (payload: PopupStructurePayload) => void
}

export function PocButtonPopupModal({ open, onClose, onApply }: PocButtonPopupModalProps) {
  const [targetTab, setTargetTab] = useState<'current' | 'new'>('current')
  const [newTabTitle, setNewTabTitle] = useState('New tab')
  const [rows, setRows] = useState<GroupRow[]>(() => [emptyRow()])

  useEffect(() => {
    if (!open) return
    setTargetTab('current')
    setNewTabTitle('New tab')
    setRows([emptyRow()])
  }, [open])

  const toggleKind = (rowKey: string, kind: BuilderFieldKind) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.key !== rowKey) return r
        const next = new Set(r.kinds)
        if (next.has(kind)) next.delete(kind)
        else next.add(kind)
        return { ...r, kinds: next }
      }),
    )
  }

  const updateRow = (rowKey: string, patch: Partial<Pick<GroupRow, 'title' | 'columns'>>) => {
    setRows((prev) => prev.map((r) => (r.key === rowKey ? { ...r, ...patch } : r)))
  }

  const addRow = () => setRows((prev) => [...prev, emptyRow()])
  const removeRow = (rowKey: string) =>
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== rowKey)))

  const duplicateRow = (rowKey: string) => {
    setRows((prev) => {
      const i = prev.findIndex((r) => r.key === rowKey)
      if (i < 0) return prev
      const src = prev[i]
      const copy: GroupRow = {
        key: genId(),
        title: `${src.title.trim() || 'Group'} (copy)`,
        columns: src.columns,
        kinds: new Set(src.kinds),
      }
      return [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)]
    })
  }

  const canApply =
    rows.some((r) => r.kinds.size > 0) &&
    (targetTab === 'current' || newTabTitle.trim().length > 0)

  const handleApply = () => {
    if (!canApply) return
    onApply({
      targetTab,
      newTabTitle: newTabTitle.trim(),
      groups: rows
        .filter((r) => r.kinds.size > 0)
        .map((r) => ({
          title: r.title.trim() || 'Group',
          columns: r.columns,
          kinds: [...r.kinds],
        })),
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Add structure"
      onClose={onClose}
      wide
      footer={
        <div className={modalStyles.footer}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="button" disabled={!canApply} onClick={handleApply}>
            Apply to document
          </Button>
        </div>
      }
    >
      <p className={styles.intro}>
        Choose whether to append groups on the <strong>current tab</strong> or create a{' '}
        <strong>new tab</strong>, then define one or more groups and the field types in each.
      </p>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Tab</legend>
        <label className={styles.radioLine}>
          <input
            type="radio"
            name="popup-tab"
            checked={targetTab === 'current'}
            onChange={() => setTargetTab('current')}
          />
          Add groups to the current tab
        </label>
        <label className={styles.radioLine}>
          <input
            type="radio"
            name="popup-tab"
            checked={targetTab === 'new'}
            onChange={() => setTargetTab('new')}
          />
          Create a new tab
        </label>
        {targetTab === 'new' ? (
          <div className={styles.newTabRow}>
            <label className={styles.lbl} htmlFor="popup-tab-title">
              New tab title
            </label>
            <input
              id="popup-tab-title"
              className={styles.input}
              value={newTabTitle}
              onChange={(e) => setNewTabTitle(e.target.value)}
            />
          </div>
        ) : null}
      </fieldset>

      <div className={styles.groupsHead}>
        <h3 className={styles.groupsTitle}>Groups & fields</h3>
        <Button variant="secondary" size="sm" type="button" onClick={addRow}>
          + Add group
        </Button>
      </div>

      <ul className={styles.groupList}>
        {rows.map((row, idx) => (
          <li key={row.key} className={styles.groupCard}>
            <div className={styles.groupCardTop}>
              <span className={styles.groupIdx}>Group {idx + 1}</span>
              <div className={styles.groupCardActions}>
                <button
                  type="button"
                  className={styles.dupeGroup}
                  onClick={() => duplicateRow(row.key)}
                  aria-label="Duplicate group row"
                >
                  Duplicate
                </button>
                {rows.length > 1 ? (
                  <button
                    type="button"
                    className={styles.removeGroup}
                    onClick={() => removeRow(row.key)}
                    aria-label="Remove group"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
            <div className={styles.row2}>
              <div>
                <label className={styles.lbl} htmlFor={`g-title-${row.key}`}>
                  Group title
                </label>
                <input
                  id={`g-title-${row.key}`}
                  className={styles.input}
                  value={row.title}
                  onChange={(e) => updateRow(row.key, { title: e.target.value })}
                />
              </div>
              <div>
                <label className={styles.lbl} htmlFor={`g-cols-${row.key}`}>
                  Columns
                </label>
                <select
                  id={`g-cols-${row.key}`}
                  className={styles.input}
                  value={row.columns}
                  onChange={(e) =>
                    updateRow(row.key, { columns: Number(e.target.value) as 1 | 2 })
                  }
                >
                  <option value={2}>Two columns</option>
                  <option value={1}>One column</option>
                </select>
              </div>
            </div>
            <div className={styles.kindsBlock}>
              <span className={styles.lbl}>Field types in this group</span>
              <div className={styles.kindGrid}>
                {POPUP_FIELD_KINDS.map((kind) => (
                  <label key={kind} className={styles.kindChip}>
                    <input
                      type="checkbox"
                      checked={row.kinds.has(kind)}
                      onChange={() => toggleKind(row.key, kind)}
                    />
                    {kind}
                  </label>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
