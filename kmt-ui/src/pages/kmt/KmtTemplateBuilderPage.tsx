import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { CreateTemplatePayload } from '../../components/kmt/KmtCreateTemplateModal'
import { PageBackBar } from '../../components/layout/PageBackBar'
import { AccordionSection } from '../../components/ui/AccordionSection'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { FormField } from '../../components/ui/FormField'
import formStyles from '../../components/ui/FormField.module.css'
import styles from '../shared/rolePages.module.css'
import pageStyles from './KmtTemplateBuilderPage.module.css'

const SECTIONS = [
  'Header',
  'Service details',
  'Pricing & fees',
  'Compliance',
  'Footer',
  'Appendix',
  'Terms & disclosures',
]

export function KmtTemplateBuilderPage() {
  const { state } = useLocation() as { state: CreateTemplatePayload | null }
  const [templateName, setTemplateName] = useState(state?.templateName ?? 'Untitled template')
  const [templateStatus, setTemplateStatus] = useState<'draft' | 'published'>('draft')
  const [bufmApprover, setBufmApprover] = useState('')
  const [pocGroup, setPocGroup] = useState('')
  const [kmtOwner, setKmtOwner] = useState('')
  const [activeSection, setActiveSection] = useState(SECTIONS[0])
  const [savedFlash, setSavedFlash] = useState(false)

  const canPublish = Boolean(bufmApprover && pocGroup && kmtOwner)

  const metaLine = useMemo(() => {
    if (!state?.description && !state?.lob && !state?.marketType) return null
    return [state?.lob, state?.marketType].filter(Boolean).join(' · ')
  }, [state])

  const onSave = () => {
    setSavedFlash(true)
    globalThis.setTimeout(() => setSavedFlash(false), 2200)
  }

  const onPublish = () => {
    if (!canPublish) return
    setTemplateStatus('published')
    setSavedFlash(true)
    globalThis.setTimeout(() => setSavedFlash(false), 2200)
  }

  return (
    <div className={styles.stack}>
      <Card>
        <PageBackBar to="/kmt/governance/templates" label="Templates" />

        <header className={pageStyles.builderHeader}>
          <div className={pageStyles.builderHeaderMain}>
            <div className={pageStyles.nameBlock}>
              <label className={pageStyles.nameLabel} htmlFor="tpl-name">
                Template name
              </label>
              <input
                id="tpl-name"
                className={pageStyles.nameInput}
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              {state?.description ? (
                <p className={styles.meta}>{state.description}</p>
              ) : null}
              {metaLine ? <p className={styles.meta}>{metaLine}</p> : null}
            </div>
            <div className={pageStyles.statusBlock}>
              <span className={styles.meta}>Status</span>
              <Badge tone={templateStatus === 'published' ? 'published' : 'draft'}>
                {templateStatus === 'published' ? 'Published template' : 'Draft'}
              </Badge>
            </div>
          </div>
          <div className={pageStyles.builderActions}>
            <Button variant="secondary" type="button" onClick={onSave}>
              Save
            </Button>
            <span title={canPublish ? '' : 'Assign POC group and BUFM approvers before publishing.'}>
              <Button
                variant="primary"
                type="button"
                disabled={!canPublish || templateStatus === 'published'}
                onClick={onPublish}
              >
                Publish
              </Button>
            </span>
          </div>
        </header>

        {savedFlash ? (
          <p className={pageStyles.flashBanner} role="status">
            {templateStatus === 'published' ? 'Template published to catalog (demo).' : 'Saved (demo).'}
          </p>
        ) : null}

        <div className={pageStyles.layout}>
          <aside className={pageStyles.left}>
            <h2 className={pageStyles.panelTitle}>Template sections</h2>
            <div className={pageStyles.sectionScroll}>
              <ul className={pageStyles.sectionList}>
                {SECTIONS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className={`${pageStyles.sectionBtn} ${s === activeSection ? pageStyles.sectionBtnActive : ''}`}
                      onClick={() => setActiveSection(s)}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className={pageStyles.center}>
            <h2 className={pageStyles.panelTitle}>Canvas</h2>
            <div className={pageStyles.canvas}>
              <p className={pageStyles.placeholder}>
                <strong>Active section:</strong> {activeSection} — drag-drop groups and fields
                (production). Demo layout below.
              </p>
              <AccordionSection title="Group A — Customer" defaultOpen>
                <p className={pageStyles.placeholder}>
                  Drag fields from the palette. Text, Number, Dropdown placeholders.
                </p>
              </AccordionSection>
              <AccordionSection title="Group B — Financial" defaultOpen={false}>
                <p className={pageStyles.placeholder}>
                  Rules and visibility live in the right panel (Actors &amp; Rules).
                </p>
              </AccordionSection>
            </div>
          </div>

          <aside className={pageStyles.right}>
            <h2 className={pageStyles.panelTitle}>Actors &amp; rules</h2>
            <div className={pageStyles.rightScroll}>
              <FormField label="Assign POC group" required>
                <select
                  className={formStyles.select}
                  value={pocGroup}
                  onChange={(e) => setPocGroup(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="north">POC — North</option>
                  <option value="corp">POC — Corporate</option>
                </select>
              </FormField>
              <FormField label="Assign BUFM approvers" required>
                <select
                  className={formStyles.select}
                  value={bufmApprover}
                  onChange={(e) => setBufmApprover(e.target.value)}
                >
                  <option value="">Assign approver…</option>
                  <option value="alex">Alex Rivera</option>
                  <option value="sam">Sam Okonkwo</option>
                </select>
              </FormField>
              <FormField label="Assign KMT owner" required>
                <select
                  className={formStyles.select}
                  value={kmtOwner}
                  onChange={(e) => setKmtOwner(e.target.value)}
                >
                  <option value="">Assign owner…</option>
                  <option value="maria">Maria Garcia</option>
                  <option value="jordan">Jordan Lee</option>
                </select>
              </FormField>
              <FormField label="Dependency rule (demo)">
                <input
                  className={formStyles.input}
                  placeholder="e.g. If Region = West → show fee table"
                />
              </FormField>
            </div>
          </aside>
        </div>

        <div className={pageStyles.publishWarning} role="note">
          <strong>Before publish:</strong> assign POC group and BUFM approvers (and KMT owner). Publish
          is blocked until all three are set.
        </div>
      </Card>
    </div>
  )
}
