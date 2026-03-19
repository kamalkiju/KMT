import { genId } from './pocDocumentDefaults'
import type { RsauiApprovalItem } from '../types/rsaui'

export const RSAUI_QUEUE_STORAGE_KEY = 'kmt.rsaui.queue.v1'

function seedQueue(): RsauiApprovalItem[] {
  const t = new Date().toISOString()
  return [
    {
      id: 'rsa-seed-1',
      title: 'Metro Commercial — rate card refresh',
      pocName: 'John Smith',
      status: 'pending',
      configOutdated: true,
      updatedAt: t,
      version: '2.3',
      productDetails: 'Commercial solid waste + recycling bundle; 2025 price tier B.',
      pricingConfig: 'Base lift $42.10 → $43.80 (highlight). Fuel surcharge 6.2%.',
      coverage: 'ZIPs 441xx–443xx; 2 block exceptions pending GIS polygon.',
      changeHighlights: [
        'Lift rate +4.0%',
        'New environmental line item',
        'Coverage gap: downtown annex',
      ],
      comments: [],
    },
    {
      id: 'rsa-seed-2',
      title: 'Residential yard waste — seasonal',
      pocName: 'Jamie Chen',
      status: 'pending',
      configOutdated: false,
      updatedAt: t,
      version: '1.1',
      productDetails: 'Seasonal yard waste cart size options.',
      pricingConfig: 'Flat quarterly fee; no change vs prior quarter.',
      coverage: 'All residential routes in sector North.',
      changeHighlights: ['Schedule window extended +2 weeks'],
      comments: [{ id: genId(), role: 'BUFM', body: 'Please confirm cart SKU mapping.', at: t }],
    },
    {
      id: 'rsa-seed-3',
      title: 'Recycling contamination fee',
      pocName: 'John Smith',
      status: 'approved',
      configOutdated: false,
      updatedAt: t,
      version: '1.0',
      productDetails: 'Approved last cycle.',
      pricingConfig: 'No open changes.',
      coverage: 'Corporate accounts only.',
      changeHighlights: [],
      comments: [],
    },
  ]
}

export function loadRsauiQueue(): RsauiApprovalItem[] {
  try {
    const raw = localStorage.getItem(RSAUI_QUEUE_STORAGE_KEY)
    if (!raw) return seedQueue()
    const parsed = JSON.parse(raw) as RsauiApprovalItem[]
    if (!Array.isArray(parsed) || parsed.length === 0) return seedQueue()
    return parsed.map(normalizeItem)
  } catch {
    return seedQueue()
  }
}

function normalizeItem(x: RsauiApprovalItem): RsauiApprovalItem {
  return {
    ...x,
    changeHighlights: Array.isArray(x.changeHighlights) ? x.changeHighlights : [],
    comments: Array.isArray(x.comments) ? x.comments : [],
    status: x.status === 'approved' || x.status === 'rejected' ? x.status : 'pending',
  }
}

export function persistRsauiQueue(items: RsauiApprovalItem[]) {
  localStorage.setItem(RSAUI_QUEUE_STORAGE_KEY, JSON.stringify(items))
}
