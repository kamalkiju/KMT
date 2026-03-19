import { useEffect, useState, type ChangeEvent } from 'react'
import type {
  BuilderField,
  BuilderFieldKind,
  ButtonAction,
  ButtonPlacement,
  ButtonVariant,
  FieldIconPosition,
  FieldNotePosition,
} from '../../types/pocDocument'
import { normalizeField } from '../../context/fieldNormalization'
import {
  formatDependencyOptionMap,
  parseDependencyOptionMap,
} from '../../utils/dependencyOptions'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import modalStyles from '../ui/Modal.module.css'
import styles from './FieldSettingsModal.module.css'

const TEXT_KINDS: BuilderFieldKind[] = [
  'Text Input',
  'Email Input',
  'Telephone Input',
  'URL Input',
]

const MAX_ICON_BYTES = 48 * 1024

interface FieldSettingsModalProps {
  open: boolean
  field: BuilderField | null
  readonly: boolean
  onClose: () => void
  onSave: (next: BuilderField) => void
  /** Other fields on the same tab (for dependency parent picklist) */
  siblingFields?: { id: string; label: string; kind: BuilderFieldKind }[]
}

export function FieldSettingsModal({
  open,
  field,
  readonly,
  onClose,
  onSave,
  siblingFields = [],
}: FieldSettingsModalProps) {
  const [draft, setDraft] = useState<BuilderField | null>(null)
  const [iconError, setIconError] = useState<string | null>(null)

  useEffect(() => {
    if (open && field) {
      setDraft(JSON.parse(JSON.stringify(field)) as BuilderField)
      setIconError(null)
    }
    if (!open) {
      setDraft(null)
      setIconError(null)
    }
  }, [field, open])

  if (!open || !field || !draft) {
    return null
  }

  const showMaxLength = TEXT_KINDS.includes(draft.kind)
  const showOptions = draft.kind === 'Dropdown' || draft.kind === 'Radio Button'
  const showCheckboxOptions = draft.kind === 'Checkboxes'
  const showButton = draft.kind === 'Button'
  const isNotes = draft.kind === 'Notes'
  const showPlaceholder = !showButton && !isNotes
  const parentCandidates = siblingFields.filter(
    (s) =>
      s.id !== draft.id &&
      (s.kind === 'Dropdown' || s.kind === 'Radio Button'),
  )
  const depText = formatDependencyOptionMap(draft.dependencyOptionMap ?? {})

  function applySave() {
    if (!draft) return
    onSave(normalizeField(draft))
    onClose()
  }

  function onIconFile(e: ChangeEvent<HTMLInputElement>) {
    setIconError(null)
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setIconError('Choose an image file (PNG, SVG, JPG).')
      return
    }
    if (file.size > MAX_ICON_BYTES) {
      setIconError(`Image must be under ${MAX_ICON_BYTES / 1024}KB for this demo.`)
      return
    }
    const fr = new FileReader()
    fr.onload = () =>
      setDraft((d) => (d ? { ...d, iconDataUrl: String(fr.result) } : d))
    fr.readAsDataURL(file)
  }

  return (
    <Modal
      open={open}
      title={`Field settings — ${field.kind}`}
      onClose={onClose}
      footer={
        <div className={modalStyles.footer}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          {!readonly ? (
            <Button variant="primary" type="button" onClick={applySave}>
              Apply
            </Button>
          ) : null}
        </div>
      }
    >
      <div className={styles.form}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="fs-label">
            {isNotes ? 'Note title' : 'Label'}
          </label>
          <input
            id="fs-label"
            className={styles.input}
            value={draft.label}
            disabled={readonly}
            onChange={(e) => setDraft((d) => (d ? { ...d, label: e.target.value } : d))}
          />
        </div>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="fs-name">
            Field name (key)
          </label>
          <input
            id="fs-name"
            className={styles.input}
            value={draft.name}
            disabled={readonly}
            onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
          />
          <span className={styles.hint}>Used as the internal identifier for this field.</span>
        </div>
        {showPlaceholder ? (
          <div className={styles.row}>
            <label className={styles.label} htmlFor="fs-ph">
              Placeholder
            </label>
            <input
              id="fs-ph"
              className={styles.input}
              value={draft.placeholder}
              disabled={readonly}
              onChange={(e) => setDraft((d) => (d ? { ...d, placeholder: e.target.value } : d))}
            />
          </div>
        ) : null}

        {showMaxLength ? (
          <div className={styles.row}>
            <label className={styles.label} htmlFor="fs-max">
              Max length
            </label>
            <input
              id="fs-max"
              type="number"
              min={1}
              max={2000}
              className={styles.input}
              value={draft.maxLength ?? ''}
              disabled={readonly}
              onChange={(e) =>
                setDraft((d) =>
                  d
                    ? {
                        ...d,
                        maxLength: e.target.value ? Number(e.target.value) : undefined,
                      }
                    : d,
                )
              }
            />
          </div>
        ) : null}

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={draft.showInfoIcon}
            disabled={readonly}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, showInfoIcon: e.target.checked } : d))
            }
          />
          Show information icon next to label
        </label>

        {!showButton ? (
          <>
            <div className={styles.section}>Description</div>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="fs-desc">
                {isNotes ? 'Note body' : 'Field description'}
              </label>
              <textarea
                id="fs-desc"
                className={styles.textarea}
                value={draft.description}
                disabled={readonly}
                placeholder={
                  isNotes
                    ? 'Policy text, instructions, or context for reviewers…'
                    : 'Optional longer guidance shown above the input'
                }
                onChange={(e) => setDraft((d) => (d ? { ...d, description: e.target.value } : d))}
              />
            </div>
          </>
        ) : null}

        {!showButton ? (
          <>
            <div className={styles.section}>Notes callout</div>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="fs-ntext">
                Highlighted note text
              </label>
              <textarea
                id="fs-ntext"
                className={styles.textarea}
                value={draft.noteText}
                disabled={readonly}
                placeholder="Optional yellow callout (policy reminder, warning, tip)"
                onChange={(e) => setDraft((d) => (d ? { ...d, noteText: e.target.value } : d))}
              />
            </div>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="fs-npos">
                Note position
              </label>
              <select
                id="fs-npos"
                className={styles.select}
                disabled={readonly}
                value={draft.notePosition}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, notePosition: e.target.value as FieldNotePosition } : d,
                  )
                }
              >
                <option value="after_label">After label</option>
                <option value="before_control">Before input</option>
                <option value="after_control">After input</option>
              </select>
            </div>
          </>
        ) : null}

        <>
            <div className={styles.section}>Custom icon</div>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="fs-icon">
                Upload icon
              </label>
              <input
                id="fs-icon"
                type="file"
                accept="image/*"
                disabled={readonly}
                className={styles.fileInput}
                onChange={onIconFile}
              />
              <span className={styles.hint}>
                Small images only (max {MAX_ICON_BYTES / 1024}KB). Stored in-browser for this demo.
              </span>
              {iconError ? <span className={styles.error}>{iconError}</span> : null}
            </div>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="fs-ipos">
                Icon position
              </label>
              <select
                id="fs-ipos"
                className={styles.select}
                disabled={readonly}
                value={draft.iconPosition}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, iconPosition: e.target.value as FieldIconPosition } : d,
                  )
                }
              >
                <option value="none">None</option>
                <option value="before_label">Before label</option>
                <option value="after_label">After label</option>
                <option value="before_description">Before description</option>
                <option value="after_description">After description</option>
              </select>
            </div>
            {draft.iconDataUrl ? (
              <div className={styles.iconPreviewRow}>
                <img src={draft.iconDataUrl} alt="" className={styles.iconPreview} />
                {!readonly ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setDraft((d) => (d ? { ...d, iconDataUrl: undefined } : d))}
                  >
                    Remove icon
                  </Button>
                ) : null}
              </div>
            ) : null}
        </>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="fs-note">
            Helper note
          </label>
          <textarea
            id="fs-note"
            className={styles.textarea}
            value={draft.helperNote}
            disabled={readonly}
            placeholder="Optional text shown under the control"
            onChange={(e) => setDraft((d) => (d ? { ...d, helperNote: e.target.value } : d))}
          />
        </div>

        {showOptions ? (
          <>
            <div className={styles.section}>Options (one per line)</div>
            <div className={styles.row}>
              <textarea
                className={styles.textarea}
                disabled={readonly}
                value={draft.options.join('\n')}
                onChange={(e) =>
                  setDraft((d) =>
                    d
                      ? {
                          ...d,
                          options: e.target.value
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        }
                      : d,
                  )
                }
              />
            </div>
            <div className={styles.section}>Dependency (optional)</div>
            <p className={styles.hint}>
              Drive this field’s options from another dropdown or radio on <strong>this tab</strong>.
              Map each parent value to a comma-separated list of child options (e.g. State → Cities).
            </p>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="fs-dep-parent">
                Controlling field
              </label>
              <select
                id="fs-dep-parent"
                className={styles.select}
                disabled={readonly}
                value={draft.dependsOnFieldId ?? ''}
                onChange={(e) =>
                  setDraft((d) => {
                    if (!d) return d
                    const v = e.target.value.trim()
                    return {
                      ...d,
                      dependsOnFieldId: v || undefined,
                      dependencyOptionMap: v ? d.dependencyOptionMap : undefined,
                    }
                  })
                }
              >
                <option value="">None — use static options above</option>
                {parentCandidates.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} ({p.kind})
                  </option>
                ))}
              </select>
            </div>
            {draft.dependsOnFieldId ? (
              <div className={styles.row}>
                <label className={styles.label} htmlFor="fs-dep-map">
                  Options per parent value
                </label>
                <textarea
                  id="fs-dep-map"
                  className={styles.textarea}
                  disabled={readonly}
                  placeholder={'California: Los Angeles, San Diego\nNew York: NYC, Buffalo'}
                  value={depText}
                  onChange={(e) =>
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            dependencyOptionMap: parseDependencyOptionMap(e.target.value),
                          }
                        : d,
                    )
                  }
                  rows={5}
                />
              </div>
            ) : null}
          </>
        ) : null}

        {showCheckboxOptions ? (
          <>
            <div className={styles.section}>Checkbox labels (one per line)</div>
            <div className={styles.row}>
              <textarea
                className={styles.textarea}
                disabled={readonly}
                value={draft.checkboxOptions.join('\n')}
                onChange={(e) =>
                  setDraft((d) =>
                    d
                      ? {
                          ...d,
                          checkboxOptions: e.target.value
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        }
                      : d,
                  )
                }
              />
            </div>
          </>
        ) : null}

        {showButton ? (
          <>
            <div className={styles.section}>Button</div>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="fs-bvar">
                Button type
              </label>
              <select
                id="fs-bvar"
                className={styles.select}
                disabled={readonly}
                value={draft.buttonVariant}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, buttonVariant: e.target.value as ButtonVariant } : d,
                  )
                }
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="ghost">Ghost / outline</option>
                <option value="danger">Danger</option>
              </select>
            </div>
            <div className={styles.row}>
              <label className={styles.label} htmlFor="fs-bact">
                Action
              </label>
              <select
                id="fs-bact"
                className={styles.select}
                disabled={readonly}
                value={draft.buttonAction}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, buttonAction: e.target.value as ButtonAction } : d,
                  )
                }
              >
                <option value="custom">Custom label</option>
                <option value="submit">Submit</option>
                <option value="reset">Reset</option>
                <option value="save_draft">Save draft</option>
                <option value="add_structure">Quick wizard — one group + fields</option>
                <option value="popup">Popup — add tab, groups & fields</option>
              </select>
            </div>
            {draft.buttonAction === 'popup' ? (
              <p className={styles.hint}>
                In the document canvas, this button opens a popup where you can create a{' '}
                <strong>new tab</strong> or add <strong>groups</strong> on the current tab, each with
                its own <strong>field types</strong>. Changes apply immediately to this document.
              </p>
            ) : null}
            {draft.buttonAction === 'custom' ? (
              <div className={styles.row}>
                <label className={styles.label} htmlFor="fs-btxt">
                  Button text
                </label>
                <input
                  id="fs-btxt"
                  className={styles.input}
                  disabled={readonly}
                  value={draft.buttonCustomLabel}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, buttonCustomLabel: e.target.value } : d))
                  }
                />
              </div>
            ) : null}
            <div className={styles.row}>
              <label className={styles.label} htmlFor="fs-bplace">
                Placement
              </label>
              <select
                id="fs-bplace"
                className={styles.select}
                disabled={readonly}
                value={draft.buttonPlacement}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, buttonPlacement: e.target.value as ButtonPlacement } : d,
                  )
                }
              >
                <option value="group">In group (grid)</option>
                <option value="full_width">Full width in group</option>
                <option value="tab_bar">Tab action bar (top of tab)</option>
              </select>
              <span className={styles.hint}>
                Tab action bar shows this button in the strip under the tab titles for this tab only.
              </span>
            </div>
            {draft.buttonPlacement === 'tab_bar' ? (
              <div className={styles.row}>
                <label className={styles.label} htmlFor="fs-balign">
                  Align in tab bar
                </label>
                <select
                  id="fs-balign"
                  className={styles.select}
                  disabled={readonly}
                  value={draft.tabBarButtonAlign}
                  onChange={(e) =>
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            tabBarButtonAlign: e.target.value as 'start' | 'end',
                          }
                        : d,
                    )
                  }
                >
                  <option value="start">Left</option>
                  <option value="end">Right</option>
                </select>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </Modal>
  )
}
