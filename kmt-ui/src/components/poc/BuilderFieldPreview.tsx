import type { ChangeEvent, ReactNode } from 'react'
import { Button } from '../ui/Button'
import type { BuilderField, FieldNotePosition } from '../../types/pocDocument'
import { unionDependencyOptions } from '../../utils/dependencyOptions'
import styles from './BuilderFieldPreview.module.css'

interface BuilderFieldPreviewProps {
  field: BuilderField
  disabled?: boolean
  /** Plain label + value presentation (no inputs) for document read-only views */
  viewAsDocument?: boolean
  /** When true, tab-bar buttons render compact in the tab strip preview */
  compact?: boolean
  /** Live values for interactive preview (POC builder draft mode) */
  values?: Record<string, string>
  onValueChange?: (fieldId: string, value: string) => void
  /** Fired when button action is "add_structure" and user clicks (editable mode) */
  onStructureButtonClick?: () => void
  /** Fired when button action is "popup" and user clicks (editable mode) */
  onPopupButtonClick?: () => void
}

function effectiveChoiceOptions(
  field: BuilderField,
  values: Record<string, string> | undefined,
  readOnly: boolean,
): string[] {
  const hasDep =
    (field.kind === 'Dropdown' || field.kind === 'Radio Button') &&
    field.dependsOnFieldId &&
    field.dependencyOptionMap &&
    Object.keys(field.dependencyOptionMap).length > 0
  if (!hasDep) return field.options
  const parentVal = values?.[field.dependsOnFieldId!] ?? ''
  if (!parentVal) {
    return readOnly ? unionDependencyOptions(field.dependencyOptionMap) : []
  }
  return field.dependencyOptionMap![parentVal] ?? []
}

function NoteCallout({ text }: { text: string }) {
  return <div className={styles.noteCallout}>{text}</div>
}

function renderNote(field: BuilderField, pos: FieldNotePosition) {
  if (!field.noteText.trim() || field.notePosition !== pos) return null
  return <NoteCallout text={field.noteText} />
}

function LabelRowFixed({ field }: { field: BuilderField }) {
  const { label, showInfoIcon, iconDataUrl, iconPosition } = field
  return (
    <div className={styles.labelRow}>
      {iconPosition === 'before_label' && iconDataUrl ? (
        <img src={iconDataUrl} alt="" className={styles.fieldIcon} />
      ) : null}
      <span className={styles.label}>{label}</span>
      {showInfoIcon ? (
        <span className={styles.info} title="Information" aria-label="Information">
          i
        </span>
      ) : null}
      {iconPosition === 'after_label' && iconDataUrl ? (
        <img src={iconDataUrl} alt="" className={styles.fieldIcon} />
      ) : null}
    </div>
  )
}

function DescriptionBlock({ field }: { field: BuilderField }) {
  const { description, iconDataUrl, iconPosition } = field
  const hasDesc = Boolean(description.trim())
  if (!hasDesc && iconPosition !== 'before_description' && iconPosition !== 'after_description') {
    return null
  }
  return (
    <div className={styles.descBlock}>
      {iconPosition === 'before_description' && iconDataUrl ? (
        <img src={iconDataUrl} alt="" className={styles.fieldIcon} />
      ) : null}
      {hasDesc ? <p className={styles.description}>{description}</p> : null}
      {iconPosition === 'after_description' && iconDataUrl ? (
        <img src={iconDataUrl} alt="" className={styles.fieldIcon} />
      ) : null}
    </div>
  )
}

function textFromValues(field: BuilderField, values?: Record<string, string>): string {
  return values?.[field.id]?.trim() || field.placeholder?.trim() || ''
}

/** Plain read-only presentation for knowledge document viewers (POC / BUFM / KMT). */
function renderFieldAsDocumentView(
  field: BuilderField,
  values: Record<string, string> | undefined,
  compact: boolean,
): ReactNode {
  const opts = effectiveChoiceOptions(field, values, true)

  const valueLine = (text: string, multiline = false) => {
    const t = text.trim()
    return (
      <p
        className={`${styles.displayValue} ${multiline ? styles.displayValueMultiline : ''} ${!t ? styles.displayEmpty : ''}`}
      >
        {t || '—'}
      </p>
    )
  }

  const shell = (control: ReactNode) => (
    <div className={styles.wrap}>
      <LabelRowFixed field={field} />
      {renderNote(field, 'after_label')}
      <DescriptionBlock field={field} />
      {renderNote(field, 'before_control')}
      {control}
      {renderNote(field, 'after_control')}
      {field.helperNote ? <p className={styles.helper}>{field.helperNote}</p> : null}
    </div>
  )

  if (field.kind === 'Notes') {
    const body = field.description.trim() ? field.description : '—'
    return shell(<div className={styles.displayProse}>{body}</div>)
  }

  if (field.kind === 'Button') {
    const text =
      field.buttonAction === 'submit'
        ? 'Submit'
        : field.buttonAction === 'reset'
          ? 'Reset'
          : field.buttonAction === 'save_draft'
            ? 'Save draft'
            : field.buttonAction === 'add_structure'
              ? field.buttonCustomLabel?.trim() || 'Add fields…'
              : field.buttonAction === 'popup'
                ? field.buttonCustomLabel?.trim() || 'Add tab / groups…'
                : field.buttonCustomLabel || 'Button'
    return (
      <div className={`${styles.wrap} ${compact ? styles.tabBarPreview : ''}`}>
        {!compact ? <LabelRowFixed field={field} /> : null}
        {renderNote(field, 'after_label')}
        {!compact ? <DescriptionBlock field={field} /> : null}
        {renderNote(field, 'before_control')}
        <p className={styles.displayAction}>{text}</p>
        <p className={styles.displayMuted}>Action control — not used in read-only document view.</p>
        {renderNote(field, 'after_control')}
        {field.helperNote ? <p className={styles.helper}>{field.helperNote}</p> : null}
      </div>
    )
  }

  if (field.kind === 'Yes/No Detail') {
    if (field.description.trim()) {
      return shell(<div className={styles.displayProse}>{field.description}</div>)
    }
    const detail =
      values?.[`${field.id}:detail`]?.trim() || field.placeholder?.trim() || '—'
    return shell(valueLine(detail, true))
  }

  if (field.kind === 'Dropdown') {
    const sel = values?.[field.id]?.trim()
    const shown = sel || field.placeholder?.trim() || opts[0] || '—'
    return shell(valueLine(shown))
  }

  if (field.kind === 'Radio Button') {
    const sel = values?.[field.id]?.trim()
    const m = field.description.trim().match(/^Selected:\s*(.+)$/i)
    const shown = sel || m?.[1]?.trim() || opts[0] || '—'
    return shell(valueLine(shown))
  }

  if (field.kind === 'Checkboxes') {
    return shell(
      <ul className={styles.displayList}>
        {field.checkboxOptions.map((opt) => (
          <li key={opt}>{opt}</li>
        ))}
      </ul>,
    )
  }

  if (field.kind === 'Toggle Switch') {
    const v = values?.[field.id]?.toLowerCase()
    const shown =
      v === '1' || v === 'true' || v === 'on'
        ? 'On'
        : v === '0' || v === 'false' || v === 'off'
          ? 'Off'
          : '—'
    return shell(valueLine(shown))
  }

  if (field.kind === 'File Upload' || field.kind === 'Image Input') {
    return shell(valueLine('No file attached (read-only preview)'))
  }

  if (field.kind === 'Date Input' || field.kind === 'Time Input') {
    return shell(valueLine(textFromValues(field, values) || '—'))
  }

  if (field.kind === 'Currency Input') {
    const raw = textFromValues(field, values) || field.placeholder?.trim() || '—'
    const shown = raw.startsWith('$') ? raw : `$${raw}`
    return shell(valueLine(shown))
  }

  if (field.kind === 'Percentage Input') {
    const raw = textFromValues(field, values) || field.placeholder?.trim() || '—'
    const shown = raw.endsWith('%') ? raw : `${raw}%`
    return shell(valueLine(shown))
  }

  const t = textFromValues(field, values) || '—'
  return shell(valueLine(t, true))
}

export function BuilderFieldPreview({
  field,
  disabled = true,
  viewAsDocument = false,
  compact = false,
  values,
  onValueChange,
  onStructureButtonClick,
  onPopupButtonClick,
}: BuilderFieldPreviewProps) {
  const { label, placeholder, helperNote, maxLength, iconDataUrl, iconPosition } = field
  const interactive = Boolean(!disabled && onValueChange)
  const readOnlyChoices = disabled || !onValueChange

  if (viewAsDocument) {
    return <>{renderFieldAsDocumentView(field, values, compact)}</>
  }

  if (field.kind === 'Notes') {
    return (
      <div className={styles.wrap}>
        <LabelRowFixed field={field} />
        {renderNote(field, 'after_label')}
        {field.iconPosition === 'before_description' && field.iconDataUrl ? (
          <img src={field.iconDataUrl} alt="" className={styles.fieldIcon} />
        ) : null}
        <div className={styles.notesPanel}>
          {field.description.trim() ? field.description : '— Add note text in field settings —'}
        </div>
        {field.iconPosition === 'after_description' && field.iconDataUrl ? (
          <img src={field.iconDataUrl} alt="" className={styles.fieldIcon} />
        ) : null}
        {renderNote(field, 'before_control')}
        {renderNote(field, 'after_control')}
        {helperNote ? <p className={styles.helper}>{helperNote}</p> : null}
      </div>
    )
  }

  if (field.kind === 'Button') {
    const text =
      field.buttonAction === 'submit'
        ? 'Submit'
        : field.buttonAction === 'reset'
          ? 'Reset'
          : field.buttonAction === 'save_draft'
            ? 'Save draft'
            : field.buttonAction === 'add_structure'
              ? field.buttonCustomLabel?.trim() || 'Add fields…'
              : field.buttonAction === 'popup'
                ? field.buttonCustomLabel?.trim() || 'Add tab / groups…'
                : field.buttonCustomLabel || 'Button'
    const v =
      field.buttonVariant === 'secondary'
        ? 'secondary'
        : field.buttonVariant === 'ghost'
          ? 'ghost'
          : field.buttonVariant === 'danger'
            ? 'danger'
            : 'primary'
    const isStructure = field.buttonAction === 'add_structure'
    const isPopup = field.buttonAction === 'popup'
    const needsClick = isStructure || isPopup
    const handler =
      !disabled && isStructure && onStructureButtonClick
        ? () => onStructureButtonClick()
        : !disabled && isPopup && onPopupButtonClick
          ? () => onPopupButtonClick()
          : undefined
    return (
      <div className={`${styles.wrap} ${compact ? styles.tabBarPreview : ''}`}>
        {!compact ? <LabelRowFixed field={field} /> : null}
        {renderNote(field, 'after_label')}
        {!compact ? <DescriptionBlock field={field} /> : null}
        {renderNote(field, 'before_control')}
        <Button
          variant={v}
          type="button"
          disabled={disabled || (needsClick && !handler)}
          size={compact ? 'sm' : 'md'}
          onClick={handler}
        >
          {text}
        </Button>
        {isStructure && !compact ? (
          <p className={styles.helper}>
            Opens a short wizard to add a group and fields on this tab (POC builder only).
          </p>
        ) : null}
        {isPopup && !compact ? (
          <p className={styles.helper}>
            Opens a popup to add a new tab and/or multiple groups with fields (POC builder only).
          </p>
        ) : null}
        {renderNote(field, 'after_control')}
        {helperNote ? <p className={styles.helper}>{helperNote}</p> : null}
        {compact ? <span className={styles.tabBarNote}>Shown on tab action bar when active</span> : null}
      </div>
    )
  }

  if (field.kind === 'Yes/No Detail') {
    const ynKey = `${field.id}:yn`
    const detailKey = `${field.id}:detail`
    const ynVal = values?.[ynKey] ?? ''
    const detailVal = values?.[detailKey] ?? ''
    if (disabled && field.description.trim()) {
      return (
        <div className={`${styles.wrap} ${styles.yesNoCard}`}>
          <LabelRowFixed field={field} />
          {renderNote(field, 'after_label')}
          <div className={styles.notesPanel}>{field.description}</div>
          {renderNote(field, 'after_control')}
          {helperNote ? <p className={styles.helper}>{helperNote}</p> : null}
        </div>
      )
    }
    return (
      <div className={`${styles.wrap} ${styles.yesNoCard}`}>
        <LabelRowFixed field={field} />
        {renderNote(field, 'after_label')}
        <DescriptionBlock field={field} />
        {renderNote(field, 'before_control')}
        <div className={styles.yesNoRow}>
          <label className={styles.radioRow}>
            <input
              type="radio"
              name={`yn_${field.id}`}
              disabled={disabled || !interactive}
              checked={ynVal === 'yes'}
              onChange={() => onValueChange?.(ynKey, 'yes')}
            />
            Yes
          </label>
          <label className={styles.radioRow}>
            <input
              type="radio"
              name={`yn_${field.id}`}
              disabled={disabled || !interactive}
              checked={ynVal === 'no'}
              onChange={() => onValueChange?.(ynKey, 'no')}
            />
            No
          </label>
        </div>
        {interactive ? (
          <input
            type="text"
            className={styles.input}
            placeholder={placeholder || 'Description'}
            value={detailVal}
            onChange={(e) => onValueChange?.(detailKey, e.target.value)}
            aria-label={`${label} description`}
          />
        ) : (
          <input
            type="text"
            className={styles.input}
            disabled
            placeholder={placeholder || 'Description'}
            aria-label={`${label} description`}
          />
        )}
        {renderNote(field, 'after_control')}
        {helperNote ? <p className={styles.helper}>{helperNote}</p> : null}
      </div>
    )
  }

  const chromeBeforeControl = (
    <>
      <LabelRowFixed field={field} />
      {renderNote(field, 'after_label')}
      <DescriptionBlock field={field} />
      {renderNote(field, 'before_control')}
    </>
  )

  const chromeAfterControl = (
    <>
      {renderNote(field, 'after_control')}
      {helperNote ? <p className={styles.helper}>{helperNote}</p> : null}
    </>
  )

  if (field.kind === 'Dropdown') {
    const opts = effectiveChoiceOptions(field, values, readOnlyChoices)
    const sel = values?.[field.id] ?? ''
    const parentId = field.dependsOnFieldId
    const needParent = Boolean(parentId && !readOnlyChoices && !values?.[parentId])
    return (
      <div className={styles.wrap}>
        {chromeBeforeControl}
        {interactive ? (
          <select
            className={styles.select}
            aria-label={label}
            value={sel}
            onChange={(e) => onValueChange?.(field.id, e.target.value)}
          >
            <option value="">
              {needParent ? 'Select parent field first…' : placeholder || 'Select…'}
            </option>
            {opts.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <select className={styles.select} disabled={disabled} aria-label={label}>
            <option value="">{placeholder || 'Select…'}</option>
            {opts.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
        {chromeAfterControl}
      </div>
    )
  }

  if (field.kind === 'Radio Button') {
    const name = `radio_${field.id}`
    const opts = effectiveChoiceOptions(field, values, readOnlyChoices)
    const sel = values?.[field.id] ?? ''
    return (
      <div className={styles.wrap}>
        {chromeBeforeControl}
        <div className={styles.radioSet} role="radiogroup" aria-label={label}>
          {opts.length === 0 && interactive ? (
            <p className={styles.helper}>
              {field.dependsOnFieldId && !values?.[field.dependsOnFieldId]
                ? 'Choose the parent field first.'
                : 'No options for this branch.'}
            </p>
          ) : null}
          {interactive
            ? opts.map((opt) => (
                <label key={opt} className={styles.radioRow}>
                  <input
                    type="radio"
                    name={name}
                    checked={sel === opt}
                    onChange={() => onValueChange?.(field.id, opt)}
                  />
                  {opt}
                </label>
              ))
            : opts.map((opt, i) => {
                const m = field.description.trim().match(/^Selected:\s*(.+)$/i)
                const picked = m?.[1]?.trim()
                const checked = picked ? opt === picked : i === 0
                return (
                  <label key={opt} className={styles.radioRow}>
                    <input
                      type="radio"
                      name={name}
                      disabled={disabled}
                      checked={checked}
                      onChange={() => {}}
                    />
                    {opt}
                  </label>
                )
              })}
        </div>
        {chromeAfterControl}
      </div>
    )
  }

  if (field.kind === 'Checkboxes') {
    return (
      <div className={styles.wrap}>
        {chromeBeforeControl}
        <div className={styles.checkSet}>
          {field.checkboxOptions.map((opt) => (
            <label key={opt} className={styles.checkRow}>
              <input type="checkbox" disabled={disabled} />
              {opt}
            </label>
          ))}
        </div>
        {chromeAfterControl}
      </div>
    )
  }

  if (field.kind === 'Toggle Switch') {
    return (
      <div className={styles.wrap}>
        <div className={styles.toggleRow}>
          {iconPosition === 'before_label' && iconDataUrl ? (
            <img src={iconDataUrl} alt="" className={styles.fieldIcon} />
          ) : null}
          <input type="checkbox" role="switch" disabled={disabled} />
          <span className={styles.label}>{label}</span>
          {field.showInfoIcon ? (
            <span className={styles.info} title="Information">
              i
            </span>
          ) : null}
          {iconPosition === 'after_label' && iconDataUrl ? (
            <img src={iconDataUrl} alt="" className={styles.fieldIcon} />
          ) : null}
        </div>
        {renderNote(field, 'after_label')}
        <DescriptionBlock field={field} />
        {renderNote(field, 'before_control')}
        {renderNote(field, 'after_control')}
        {helperNote ? <p className={styles.helper}>{helperNote}</p> : null}
      </div>
    )
  }

  if (field.kind === 'File Upload' || field.kind === 'Image Input') {
    return (
      <div className={styles.wrap}>
        {chromeBeforeControl}
        <input
          type="file"
          className={styles.input}
          disabled={disabled}
          aria-label={label}
          accept={field.kind === 'Image Input' ? 'image/*' : undefined}
        />
        {chromeAfterControl}
      </div>
    )
  }

  if (field.kind === 'Date Input') {
    return (
      <div className={styles.wrap}>
        {chromeBeforeControl}
        <input
          type="date"
          className={styles.input}
          disabled={disabled}
          aria-label={label}
        />
        {chromeAfterControl}
      </div>
    )
  }

  if (field.kind === 'Time Input') {
    return (
      <div className={styles.wrap}>
        {chromeBeforeControl}
        <input
          type="time"
          step={60}
          className={styles.input}
          disabled={disabled}
          aria-label={label}
        />
        {chromeAfterControl}
      </div>
    )
  }

  if (field.kind === 'Currency Input') {
    return (
      <div className={styles.wrap}>
        {chromeBeforeControl}
        <div className={styles.currencyWrap}>
          <span className={styles.currencyPrefix} aria-hidden>
            $
          </span>
          <input
            type="number"
            className={styles.currencyInput}
            disabled={disabled}
            placeholder={placeholder || '0.00'}
            aria-label={label}
          />
        </div>
        {chromeAfterControl}
      </div>
    )
  }

  if (field.kind === 'Percentage Input') {
    return (
      <div className={styles.wrap}>
        {chromeBeforeControl}
        <div className={styles.percentWrap}>
          <input
            type="number"
            className={styles.percentInput}
            disabled={disabled}
            placeholder={placeholder || '0'}
            min={0}
            max={100}
            aria-label={label}
          />
          <span className={styles.percentSuffix} aria-hidden>
            %
          </span>
        </div>
        {chromeAfterControl}
      </div>
    )
  }

  const type =
    field.kind === 'Email Input'
      ? 'email'
      : field.kind === 'Number Input'
        ? 'number'
        : field.kind === 'Telephone Input'
          ? 'tel'
          : field.kind === 'URL Input'
            ? 'url'
            : 'text'

  const useMaxLen =
    type === 'text' || type === 'email' || type === 'tel' || type === 'url'

  const textVal = values?.[field.id] ?? ''

  return (
    <div className={styles.wrap}>
      {chromeBeforeControl}
      <input
        type={type}
        className={styles.input}
        disabled={disabled}
        placeholder={placeholder || undefined}
        maxLength={useMaxLen ? maxLength : undefined}
        aria-label={label}
        {...(interactive
          ? {
              value: textVal,
              onChange: (e: ChangeEvent<HTMLInputElement>) =>
                onValueChange?.(field.id, e.target.value),
            }
          : {})}
      />
      {chromeAfterControl}
    </div>
  )
}
