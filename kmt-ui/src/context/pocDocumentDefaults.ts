import { appendReferenceNarrative, buildCeuiResidentialTabs } from './ceuiSampleDocumentTabs'
import { buildField, normalizePocDocument } from './fieldNormalization'
import type { BuilderFieldKind, BuilderTab, PocDocument } from '../types/pocDocument'

export const DOCUMENT_TEMPLATES = [
  { id: 'residential', name: 'Residential Services' },
  { id: 'commercial', name: 'Commercial Waste' },
  { id: 'recycling', name: 'Recycling Program' },
  { id: 'blank', name: 'Blank document' },
] as const

export function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function tab(
  title: string,
  groupTitle: string,
  starterKinds: BuilderFieldKind[] = [],
): BuilderTab {
  return {
    id: genId(),
    title,
    groups: [
      {
        id: genId(),
        title: groupTitle,
        columns: 2,
        fields: starterKinds.map((kind, i) => buildField(genId(), kind, i + 1)),
      },
    ],
  }
}

export function tabsForTemplate(templateId: string): BuilderTab[] {
  switch (templateId) {
    case 'residential':
      return [
        tab('Knowledge Area', 'Basic Information', ['Text Input', 'Date Input']),
        tab('Service Categories', 'Solid Waste', ['Dropdown', 'Text Input']),
      ]
    case 'commercial':
      return [tab('Contract', 'Commercial Details', ['Text Input', 'Number Input', 'Button'])]
    case 'recycling':
      return [tab('Program', 'Bins & Schedule', ['Checkboxes', 'Dropdown'])]
    default:
      return [tab('General Information', 'Group 1', [])]
  }
}

const SAMPLE_OWNER = 'John Smith'
const TS = '2025-03-18T14:30:00.000Z'

const NARRATIVE_DRAFT_A = `This working draft captures residential cart service levels, holiday deferral rules, and contamination fee language for the North corridor. It is intended to replace the FY24 bulletin once BUFM and KMT sign off. All tonnage references must stay aligned with the active RSAUI export; any manual overrides require a linked exception ID in the appendix. Operators should validate customer-facing URLs quarterly.`

const NARRATIVE_DRAFT_B = `Commercial container sizing, compactor call-out windows, and temporary roll-off staging are described here for division operations. Pricing tables in section 3 are placeholders until finance publishes the Q3 rate card. Do not distribute externally until the “Published” lifecycle state is reached.`

const NARRATIVE_DRAFT_C = `Recycling contamination thresholds, education mailer copy, and multilingual FAQ hooks. This draft supports the spring outreach campaign. Coordinate with marketing for final imagery; placeholder assets are noted inline.`

const NARRATIVE_DRAFT_D = `Internal-only checklist: who approves blank-template migrations, how to archive superseded PDFs, and naming conventions for cloned documents. Extend this list as the program matures.`

const NARRATIVE_DRAFT_E = `Crosswalk between knowledge-document field IDs and RSAUI category codes (4A–4F). Maintainers must update within five business days of any RSAUI release. This section is dense by design to stress-test read-only viewers and BUFM review panels.`

const LONG_BUFM_REJECT = `BUFM review — returned to POC.

The commercial rate matrix in section 4.2 does not reconcile with RSAUI category 4B base rates effective FY26-Q2. Specifically: (1) the “extra yardage” line references a SKU that was retired in January; (2) organics uplift percentages sum to 102% across tiers; (3) footnote 12 cites a contract exhibit that is not attached.

Please pull the latest price book export, rebuild the matrix, and re-submit. If intentional deviations exist, attach a signed variance memo from division finance. Until corrected, this document cannot advance to KMT governance.

Secondary note: the service calendar still shows legacy holiday names; align with the corporate communications glossary (2025 revision). Contact the BUFM desk if you need a reconciliation template.`

const LONG_KMT_REJECT = `KMT governance — publication blocked.

Governance found that lifecycle metadata is incomplete: expiry handling, archive triggers, and owner succession are undefined. Additionally, the environmental claims in appendix C require citation to the approved sustainability source list (see KMT-ENV-09). 

Revise and resubmit with: (a) explicit expiry review owner; (b) redlined appendix C with footnoted sources; (c) confirmation that BUFM has re-approved any rate text touched since last submission.`

/** CEUI-style multi-tab samples + reference narrative (drafts, queues, rejections, published). */
function ceuiWithNarrative(idPrefix: string, body: string): BuilderTab[] {
  return appendReferenceNarrative(buildCeuiResidentialTabs(genId), idPrefix, body)
}

/** Rich samples for POC dashboards (owner matches default POC login: John Smith). Fresh key loads these once. */
function seedDocuments(): PocDocument[] {
  return [
    {
      id: 'sample-draft-north',
      name: 'North corridor — Residential cart service & holiday rules (working draft — FY26 refresh)',
      documentTemplateId: 'residential',
      status: 'draft',
      tabs: ceuiWithNarrative('sdn', NARRATIVE_DRAFT_A),
      updatedAt: TS,
      version: '0.2',
      rsauiDependencyPending: true,
      ownerName: SAMPLE_OWNER,
      reviewThread: [],
    },
    {
      id: 'sample-draft-commercial',
      name: 'Commercial containers, compactors & roll-off staging — operations draft v3 (internal)',
      documentTemplateId: 'commercial',
      status: 'draft',
      tabs: ceuiWithNarrative('sdc', NARRATIVE_DRAFT_B),
      updatedAt: TS,
      version: '0.3',
      rsauiDependencyPending: false,
      ownerName: SAMPLE_OWNER,
      reviewThread: [],
    },
    {
      id: 'sample-draft-recycling',
      name: 'Recycling outreach — contamination thresholds & multilingual FAQ (spring campaign)',
      documentTemplateId: 'recycling',
      status: 'draft',
      tabs: ceuiWithNarrative('sdr', NARRATIVE_DRAFT_C),
      updatedAt: TS,
      version: '0.1',
      rsauiDependencyPending: true,
      ownerName: SAMPLE_OWNER,
      reviewThread: [],
    },
    {
      id: 'sample-draft-blank',
      name: 'Blank template governance checklist — cloning, archival naming, owner handoffs',
      documentTemplateId: 'blank',
      status: 'draft',
      tabs: ceuiWithNarrative('sdb', NARRATIVE_DRAFT_D),
      updatedAt: TS,
      version: '0.4',
      rsauiDependencyPending: false,
      ownerName: SAMPLE_OWNER,
      reviewThread: [],
    },
    {
      id: 'sample-draft-rsaui',
      name: 'RSAUI ↔ knowledge field crosswalk (categories 4A–4F) — maintainer draft with extended tables',
      documentTemplateId: 'commercial',
      status: 'draft',
      tabs: ceuiWithNarrative('sdrs', NARRATIVE_DRAFT_E),
      updatedAt: TS,
      version: '0.5',
      rsauiDependencyPending: true,
      ownerName: SAMPLE_OWNER,
      reviewThread: [],
    },
    {
      id: 'sample-queue-enterprise',
      name: 'Enterprise master service agreement — consolidated waste, recycling & organics (submitted for BUFM — long title for queue display testing)',
      documentTemplateId: 'commercial',
      status: 'in_review',
      tabs: ceuiWithNarrative(
        'sqe',
        `Submitted package includes MSA body, exhibit B rate assumptions, and hauler insurance riders. Awaiting BUFM financial alignment. This description is intentionally verbose to validate list and modal layouts in POC and BUFM dashboards.`,
      ),
      updatedAt: TS,
      version: '1.0',
      rsauiDependencyPending: true,
      ownerName: SAMPLE_OWNER,
      submittedAt: TS,
      reviewThread: [
        {
          id: 'sqe-poc-1',
          role: 'POC',
          body: 'Submitted for BUFM review — includes latest legal redlines from March 10. Please prioritize section 7 (liability caps).',
          at: TS,
        },
      ],
    },
    {
      id: 'sample-queue-hauler',
      name: 'Hauler performance scorecard & corrective action playbook — FY26 pilot (in BUFM queue)',
      documentTemplateId: 'residential',
      status: 'in_review',
      tabs: ceuiWithNarrative(
        'sqh',
        `Defines KPIs, SLA measurement windows, and escalation when two consecutive months miss targets. Finance requested BUFM sign-off before KMT publishes.`,
      ),
      updatedAt: TS,
      version: '0.9',
      rsauiDependencyPending: false,
      ownerName: SAMPLE_OWNER,
      submittedAt: TS,
      reviewThread: [
        {
          id: 'sqh-poc-1',
          role: 'POC',
          body: 'Pilot limited to three divisions. Attached data dictionary references the warehouse export schema v2.',
          at: TS,
        },
      ],
    },
    {
      id: 'sample-awaiting-kmt',
      name: 'Sustainability disclosures — customer-facing summary (BUFM approved — awaiting KMT governance publication)',
      documentTemplateId: 'recycling',
      status: 'awaiting_kmt',
      tabs: ceuiWithNarrative(
        'sak',
        `Public narrative for diversion rates, third-party verification, and forward-looking statements. BUFM cleared pricing-adjacent footnotes on March 12.`,
      ),
      updatedAt: TS,
      version: '1.2',
      rsauiDependencyPending: false,
      ownerName: SAMPLE_OWNER,
      submittedAt: TS,
      bufmApprovedAt: TS,
      reviewThread: [
        {
          id: 'sak-bufm',
          role: 'BUFM',
          body: 'Approved by BUFM — financial exhibits reconciled to RSAUI. Forwarded to KMT for environmental claims review and publication slotting.',
          at: TS,
        },
        {
          id: 'sak-poc',
          role: 'POC',
          body: 'Thank you — standing by for KMT. Happy to clarify methodology footnotes on call.',
          at: TS,
        },
      ],
    },
    {
      id: 'sample-awaiting-kmt-hauler',
      name: 'Hauler insurance & COI evidence pack — BUFM cleared ops; awaiting KMT legal publication slot',
      documentTemplateId: 'commercial',
      status: 'awaiting_kmt',
      tabs: ceuiWithNarrative(
        'sakh',
        `Consolidated certificates of insurance, auto liability limits, and named-insured endorsements for national hauler panel. BUFM confirmed exhibit numbering matches contract module; KMT to verify retention language matches policy KM-LEG-04.`,
      ),
      updatedAt: TS,
      version: '1.0',
      rsauiDependencyPending: false,
      ownerName: 'Jamie Chen',
      submittedAt: TS,
      bufmApprovedAt: TS,
      reviewThread: [
        {
          id: 'sakh-bufm',
          role: 'BUFM',
          body: 'BUFM: Ops and financial exhibits aligned. Forwarded to KMT for legal wording and catalog slot.',
          at: TS,
        },
      ],
    },
    {
      id: 'sample-published-k5015',
      name: 'Document K-5015 — Residential Services Knowledge Pack (published reference)',
      documentTemplateId: 'residential',
      status: 'published',
      tabs: ceuiWithNarrative(
        'spub',
        `Published training reference aligned to the CEUI-style field layout. Appears under All documents; clone to draft for edits. Includes lengthy notes blocks to stress-test read-only viewers.`,
      ),
      updatedAt: TS,
      version: '2.0',
      rsauiDependencyPending: false,
      ownerName: SAMPLE_OWNER,
      submittedAt: TS,
      bufmApprovedAt: TS,
      publishedAt: TS,
      expiryDate: '2027-12-31',
      reviewThread: [
        {
          id: 'spub-kmt',
          role: 'KMT',
          body: 'Published to catalog slot R-12 — use as layout reference for new residential packs.',
          at: TS,
        },
      ],
    },
    {
      id: 'sample-published-commercial-catalog',
      name: 'Commercial waste rate card — published catalog reference (FY26-Q1 board-approved)',
      documentTemplateId: 'commercial',
      status: 'published',
      tabs: ceuiWithNarrative(
        'spubc',
        `Board-approved commercial container and compactor rates for enterprise accounts. Published for field quoting; aligns with RSAUI category 4B where noted. Use as second sample row in KMT published catalog.`,
      ),
      updatedAt: '2025-03-19T16:45:00.000Z',
      version: '1.4',
      rsauiDependencyPending: false,
      ownerName: 'Maria Garcia',
      submittedAt: TS,
      bufmApprovedAt: TS,
      publishedAt: '2025-03-19T12:00:00.000Z',
      expiryDate: '2026-06-30',
      reviewThread: [
        {
          id: 'spubc-kmt',
          role: 'KMT',
          body: 'Published to catalog slot C-04 after BUFM finance alignment.',
          at: TS,
        },
      ],
    },
    {
      id: 'sample-reject-bufm',
      name: 'Document K-5013 — DIV 386 MUNI - City of Port Orange, FL (rejected — BUFM)',
      documentTemplateId: 'residential',
      status: 'rejected',
      tabs: ceuiWithNarrative('srb', NARRATIVE_DRAFT_A),
      updatedAt: TS,
      version: '1.3',
      rsauiDependencyPending: true,
      ownerName: SAMPLE_OWNER,
      bufmComment: `Document Rejected by BUFM

Reason: Please update extra pickup rates and verify recycling service frequency.

${LONG_BUFM_REJECT}`,
      bufmRejectedAt: TS,
      submittedAt: TS,
      reviewThread: [
        {
          id: 'srb-bufm',
          role: 'BUFM',
          body: `Rejected by BUFM: ${LONG_BUFM_REJECT.slice(0, 200)}…`,
          at: TS,
        },
      ],
    },
    {
      id: 'sample-reject-kmt',
      name: 'Published knowledge clone — environmental appendix without citations (KMT rejection — governance)',
      documentTemplateId: 'recycling',
      status: 'rejected',
      tabs: ceuiWithNarrative('srk', NARRATIVE_DRAFT_C),
      updatedAt: TS,
      version: '2.1',
      rsauiDependencyPending: false,
      ownerName: SAMPLE_OWNER,
      kmtComment: LONG_KMT_REJECT,
      kmtRejectedAt: TS,
      bufmApprovedAt: TS,
      submittedAt: TS,
      reviewThread: [
        {
          id: 'srk-kmt',
          role: 'KMT',
          body: `Rejected by KMT: ${LONG_KMT_REJECT.slice(0, 200)}…`,
          at: TS,
        },
      ],
    },
    {
      id: 'sample-reject-chain',
      name: 'Division operations bulletin — multi-stage return (BUFM then KMT notes on file)',
      documentTemplateId: 'residential',
      status: 'rejected',
      tabs: ceuiWithNarrative('src', NARRATIVE_DRAFT_A),
      updatedAt: TS,
      version: '1.7',
      rsauiDependencyPending: true,
      ownerName: SAMPLE_OWNER,
      bufmComment:
        'BUFM: Initial pass — rate footers inconsistent with exhibit C. Returned March 5. POC revised; second BUFM pass approved structure only.',
      bufmRejectedAt: TS,
      kmtComment: LONG_KMT_REJECT,
      kmtRejectedAt: TS,
      submittedAt: TS,
      reviewThread: [
        { id: 'src-1', role: 'BUFM', body: 'First review: fix exhibit C before we spend time on appendix.', at: TS },
        { id: 'src-2', role: 'POC', body: 'Revised exhibit C uploaded; please re-review.', at: TS },
        { id: 'src-3', role: 'KMT', body: LONG_KMT_REJECT, at: TS },
      ],
    },
  ].map((d) => normalizePocDocument(d as PocDocument))
}

export const POC_DOCUMENTS_STORAGE_KEY = 'kmt.poc.documents.v14'

/** Same-window sync after localStorage writes (storage event only fires across tabs). */
export const POC_DOCUMENTS_SYNC = 'kmt.poc.documents.sync'

export function loadDocuments(): PocDocument[] {
  try {
    const raw = localStorage.getItem(POC_DOCUMENTS_STORAGE_KEY)
    if (raw == null) return seedDocuments().map(normalizePocDocument)
    const parsed = JSON.parse(raw) as PocDocument[]
    if (!Array.isArray(parsed)) return seedDocuments().map(normalizePocDocument)
    return parsed.map((d) => normalizePocDocument(d))
  } catch {
    return seedDocuments().map(normalizePocDocument)
  }
}

export function persistDocuments(docs: PocDocument[]) {
  localStorage.setItem(POC_DOCUMENTS_STORAGE_KEY, JSON.stringify(docs))
  window.dispatchEvent(new Event(POC_DOCUMENTS_SYNC))
}
