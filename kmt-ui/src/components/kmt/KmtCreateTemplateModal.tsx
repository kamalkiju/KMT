import { useState } from 'react'
import { Button } from '../ui/Button'
import { FormField } from '../ui/FormField'
import { Modal } from '../ui/Modal'
import formStyles from '../ui/FormField.module.css'
import modalStyles from '../ui/Modal.module.css'
import styles from '../../pages/shared/rolePages.module.css'

export type CreateTemplatePayload = {
  templateName: string
  description: string
  lob: string
  marketType: string
}

const LOB_OPTIONS = ['Solid Waste', 'Recycling', 'Hazardous', 'Corporate']
const MARKET_OPTIONS = ['Residential', 'Commercial', 'Industrial', 'Municipal']

export function KmtCreateTemplateModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (payload: CreateTemplatePayload) => void
}) {
  const [templateName, setTemplateName] = useState('')
  const [description, setDescription] = useState('')
  const [lob, setLob] = useState('')
  const [marketType, setMarketType] = useState('')

  const reset = () => {
    setTemplateName('')
    setDescription('')
    setLob('')
    setMarketType('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleCreate = () => {
    const name = templateName.trim()
    if (!name) return
    onCreate({
      templateName: name,
      description: description.trim(),
      lob,
      marketType,
    })
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Create template"
      onClose={handleClose}
      footer={
        <div className={modalStyles.footer}>
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={!templateName.trim()}
            onClick={handleCreate}
          >
            Create template
          </Button>
        </div>
      }
    >
      <p className={styles.meta}>
        After you create, you&apos;ll open the template builder to define sections and fields.
      </p>
      <FormField label="Template name" required>
        <input
          className={formStyles.input}
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="e.g. Regional service playbook"
        />
      </FormField>
      <FormField label="Description">
        <textarea
          className={formStyles.textarea}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Purpose, scope, compliance notes…"
        />
      </FormField>
      <FormField label="LOB">
        <select className={formStyles.select} value={lob} onChange={(e) => setLob(e.target.value)}>
          <option value="">Select…</option>
          {LOB_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Market type">
        <select
          className={formStyles.select}
          value={marketType}
          onChange={(e) => setMarketType(e.target.value)}
        >
          <option value="">Select…</option>
          {MARKET_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </FormField>
    </Modal>
  )
}
