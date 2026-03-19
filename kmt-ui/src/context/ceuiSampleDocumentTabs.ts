import { normalizeField } from './fieldNormalization'
import type { BuilderField, BuilderGroup, BuilderTab } from '../types/pocDocument'

function slug(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'field'
  )
}

function text(
  id: string,
  label: string,
  placeholder: string,
  patch: Partial<BuilderField> = {},
): BuilderField {
  return normalizeField({
    id,
    kind: 'Text Input',
    label,
    name: slug(label),
    placeholder,
    description: '',
    showInfoIcon: Boolean(patch.showInfoIcon),
    ...patch,
  })
}

function dateIn(id: string, label: string, placeholder: string): BuilderField {
  return normalizeField({
    id,
    kind: 'Date Input',
    label,
    name: slug(label),
    placeholder,
    description: '',
  })
}

function dd(
  id: string,
  label: string,
  options: string[],
  placeholder: string,
): BuilderField {
  return normalizeField({
    id,
    kind: 'Dropdown',
    label,
    name: slug(label),
    placeholder,
    description: '',
    options,
  })
}

function notes(id: string, label: string, body: string): BuilderField {
  return normalizeField({
    id,
    kind: 'Notes',
    label,
    name: slug(label),
    description: body,
  })
}

function ynDetail(
  id: string,
  label: string,
  ynSummary: string,
  detailPlaceholder: string,
): BuilderField {
  return normalizeField({
    id,
    kind: 'Yes/No Detail',
    label,
    name: slug(label),
    placeholder: detailPlaceholder,
    description: ynSummary,
  })
}

function radioTwo(id: string, label: string, selected: string): BuilderField {
  return normalizeField({
    id,
    kind: 'Radio Button',
    label,
    name: slug(label),
    placeholder: '',
    description: `Selected: ${selected}`,
    options: ['Republic Services', 'Muni/HOA'],
  })
}

function group(id: string, title: string, columns: 1 | 2, fields: BuilderField[]): BuilderGroup {
  return { id, title, columns, fields }
}

/**
 * CEUI-style residential knowledge document shape (tabs + groups + sample placeholders)
 * for POC drafts, queues, rejections, and published demos.
 */
export function buildCeuiResidentialTabs(genId: () => string): BuilderTab[] {
  const t1: BuilderTab = {
    id: genId(),
    title: 'Knowledge Area',
    groups: [
      group(genId(), 'Basic Information', 2, [
        text(
          genId(),
          'Document Title *',
          'DIV 993 MUNI — City of Shelbyville, KY',
          { showInfoIcon: true },
        ),
        dateIn(genId(), 'Contract Activation Date *', '2020-01-01'),
        dateIn(genId(), 'Contract Expiration Date', '—'),
        dateIn(genId(), 'Document Review Date *', '2024-03-15'),
        text(
          genId(),
          'Review Notes',
          'Annual contract review scheduled. Follow-up required on organics contamination fee language before next renewal cycle.',
        ),
      ]),
      group(genId(), 'Contract Information', 2, [
        text(genId(), 'Contact Title', 'City Manager Office'),
        text(genId(), 'Contact Phone Number', '(502) 633-1323'),
        text(genId(), 'Contact Email', 'contact@shelbyville.org'),
        text(genId(), 'Website', 'https://www.shelbyville.org'),
      ]),
      group(genId(), 'Location & Servicing Division — Location 1', 2, [
        text(genId(), 'City', 'Portland'),
        text(genId(), 'County', 'Multnomah'),
        dd(genId(), 'State *', ['OR', 'WA', 'CA', 'TX'], 'OR'),
        text(genId(), 'Primary', 'Yes — primary service location'),
      ]),
      group(genId(), 'Location & Servicing Division — Location 2', 2, [
        text(genId(), 'City', 'Shelbyville'),
        text(genId(), 'County', 'Shelby'),
        dd(genId(), 'State *', ['KY', 'IN', 'OH', 'TN'], 'KY'),
        text(genId(), 'Primary', 'No'),
      ]),
      group(genId(), 'Servicing division', 2, [
        text(genId(), 'Servicing Division City *', 'San Antonio'),
        dd(genId(), 'Servicing Division State *', ['TX', 'OK', 'LA', 'NM'], 'TX'),
        dd(
          genId(),
          'Account Class',
          ['X- Regular Account', 'Y- Municipal', 'Z- HOA'],
          'X- Regular Account',
        ),
      ]),
      group(genId(), 'Service Details & Contract Numbers', 2, [
        text(genId(), 'Contract # *', '5559995'),
        text(genId(), 'Group # *', '01'),
        text(genId(), 'Description *', 'Solid Waste'),
        text(genId(), 'Contract # (row 2)', '5559995'),
        text(genId(), 'Group # (row 2)', '02'),
        text(genId(), 'Description (row 2)', 'Recycle'),
      ]),
      group(genId(), 'Service rules & collection window', 2, [
        radioTwo(genId(), 'Service Interrupt Eligible', 'Yes'),
        radioTwo(genId(), 'Lienable?', 'Yes'),
        text(genId(), 'Collection Start *', '05:00 AM'),
        text(genId(), 'Collection End *', '05:00 PM'),
        dd(genId(), 'Time Zone *', ['PST', 'MST', 'CST', 'EST'], 'PST'),
      ]),
      group(genId(), 'Payment & Billing Terms', 1, [
        notes(
          genId(),
          'Payment Terms *',
          'Resident is billed directly by Republic Services, Municipality, HOA, etc. This block is intentionally long so reviewers can scroll the read-only preview: include delinquency timing, third-party payer carve-outs, and any municipal franchise fee pass-through language that must stay synchronized with the active rate book.',
        ),
        dd(genId(), 'Months in Advance', ['1 Month', '2 Months', '3 Months'], '1 Month'),
        dd(
          genId(),
          'Price Increase Month',
          ['January', 'April', 'July', 'October'],
          'January',
        ),
        text(genId(), 'Prepayment — Initial', '0.00'),
        text(genId(), 'Prepayment — Additional', '0.00'),
        text(
          genId(),
          'Summary Routed Account Number',
          '033/9000091 — To schedule all service requests.',
        ),
      ]),
      group(genId(), 'Invoice groups (sample rows)', 2, [
        text(genId(), 'Group # (invoice 1) *', '1'),
        text(genId(), 'Description (invoice 1) *', 'RES CYL BTD 1/4/7/10'),
        text(genId(), 'Group # (invoice 2) *', '2'),
        text(genId(), 'Description (invoice 2) *', 'REC CYL EOW'),
        text(genId(), 'Group # (invoice 3) *', '3'),
        text(genId(), 'Description (invoice 3) *', 'YARD WASTE SUB'),
      ]),
      group(genId(), 'InfoPro Codes & References', 2, [
        text(genId(), 'TERR Code *', '01'),
        text(genId(), 'TERR Description *', 'Northeast Portland'),
        text(genId(), 'Acquisition Code *', 'ST'),
        text(genId(), 'Acquisition Description *', 'Santek Acquisition'),
        text(
          genId(),
          'Former Company Cart Colors',
          'M&M Sanitation — Green; BFI — Brown; legacy roll cart mix still on ~12% of routes.',
        ),
      ]),
      group(genId(), 'Service Owner Responsibilities', 1, [
        radioTwo(genId(), 'Service Setup By', 'Muni/HOA'),
        radioTwo(genId(), 'Cancellation', 'Muni/HOA'),
        radioTwo(genId(), 'Missed Pickups', 'Republic Services'),
        radioTwo(genId(), 'Transfer of Service', 'Muni/HOA'),
        radioTwo(genId(), 'Reinstatement', 'Muni/HOA'),
        radioTwo(genId(), 'Service Change', 'Muni/HOA'),
      ]),
      group(genId(), 'Setup, Cancellation & Process Notes', 1, [
        notes(
          genId(),
          'Setup Notes *',
          'Follow the standard setup process. Capture franchise agreement exhibit IDs and any municipal ordinance references that constrain service days.',
        ),
        notes(
          genId(),
          'Cancellation Notes *',
          'Follow the standard cancellation process. Confirm final pickup date and container retrieval before closing the account.',
        ),
        notes(
          genId(),
          'Save Rate Guidance',
          'Try to negotiate a rate between the customer’s current rate and the Save Rate. Only use the actual Save Rate value when it is needed to match a competitor quote. Document approvals in the Pulse thread when exceptions are granted.',
        ),
        notes(genId(), 'Business Center Information *', 'N/A'),
      ]),
      group(genId(), 'Additional Services & Options', 2, [
        ynDetail(
          genId(),
          'Walk-in Payment',
          'Yes — No cash. Credit cards, checks and money orders are accepted.',
          'No cash. Credit cards, checks and money orders are accepted.',
        ),
        ynDetail(
          genId(),
          'Container Pick Up/Return',
          'No — Customer keeps container until account close.',
          '',
        ),
        ynDetail(
          genId(),
          'Leave Container Onsite',
          'Yes — Allowed where alley access permits; note exceptions in Pulse.',
          '',
        ),
        ynDetail(
          genId(),
          'CSA-Sign at Division',
          'No',
          '',
        ),
        text(
          genId(),
          'Promotions',
          'Refer a friend and receive $25 off your next invoice. Campaign codes expire quarterly; verify in marketing portal before quoting.',
        ),
        text(
          genId(),
          'Service Area Notes',
          'Use discretion — only add notes not captured elsewhere. Long-running disputes or legal holds should reference case IDs.',
        ),
      ]),
    ],
  }

  const t2: BuilderTab = {
    id: genId(),
    title: 'Service Categories',
    groups: [
      group(genId(), 'Residential solid waste', 2, [
        dd(
          genId(),
          'Cart size default',
          ['35 gal', '65 gal', '95 gal'],
          '65 gal',
        ),
        text(
          genId(),
          'Extra yardage policy',
          'Up to 3 extra bags tagged; beyond that requires bulk pickup request.',
        ),
        notes(
          genId(),
          'Holiday deferral',
          'When a holiday falls on service day, collection shifts per municipal posted calendar. Mirror language from the city portal when available.',
        ),
      ]),
      group(genId(), 'Recycling', 2, [
        dd(genId(), 'Commingled accepted', ['Single stream', 'Dual stream'], 'Single stream'),
        text(
          genId(),
          'Contamination fee note',
          'Second strike: warning tag; third strike within 12 mo: $25 fee per policy 4.2.',
        ),
      ]),
    ],
  }

  const t3: BuilderTab = {
    id: genId(),
    title: 'Offerings',
    groups: [
      group(genId(), 'Curbside offerings', 2, [
        text(genId(), 'Bulky item program', 'Quarterly on-call; max 3 items per event.'),
        text(genId(), 'Yard waste', 'Bi-weekly Mar–Nov; paper bags only in Zone B.'),
      ]),
      group(genId(), 'Add-on services', 1, [
        notes(
          genId(),
          'Optional narrative',
          'Document optional upsells (locks, bear clips, senior discount eligibility) with links to SKU tables where applicable.',
        ),
      ]),
    ],
  }

  const t4: BuilderTab = {
    id: genId(),
    title: 'Extra Pick Up',
    groups: [
      group(genId(), 'Extra pickup rates', 2, [
        text(genId(), 'Standard extra cart pull', '18.50'),
        text(genId(), 'Holiday extra service', 'See rate book table H-2'),
        notes(
          genId(),
          'BUFM review note',
          'Please update extra pickup rates and verify recycling service frequency against the latest municipal amendment.',
        ),
      ]),
    ],
  }

  const t5: BuilderTab = {
    id: genId(),
    title: 'Fees',
    groups: [
      group(genId(), 'Container & account fees', 2, [
        text(genId(), 'Delivery fee', '25.00'),
        text(genId(), 'Exchange fee', '15.00'),
        text(genId(), 'Late payment', 'Per city ordinance schedule'),
      ]),
    ],
  }

  return [t1, t2, t3, t4, t5]
}

export function appendReferenceNarrative(
  tabs: BuilderTab[],
  prefix: string,
  body: string,
): BuilderTab[] {
  const copy = JSON.parse(JSON.stringify(tabs)) as BuilderTab[]
  if (!copy[0]) return copy
  copy[0].groups.push({
    id: `${prefix}-ref`,
    title: 'Reference & narrative',
    columns: 1,
    fields: [
      normalizeField({
        id: `${prefix}-note`,
        kind: 'Notes',
        label: 'Scope, narrative & compliance notes',
        name: 'scope_narrative',
        description: body,
      }),
    ],
  })
  return copy
}
