import type { BufmPocUser } from '../types/bufmTeam'

/** Demo BUFM approvers for template assignment UI (KMT). */
export interface DemoBufmMember {
  id: string
  name: string
  email: string
  title: string
}

export const DEMO_BUFM_APPROVERS: DemoBufmMember[] = [
  {
    id: 'bufm-alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@bufm.demo',
    title: 'Senior knowledge approver',
  },
  {
    id: 'bufm-sam',
    name: 'Sam Okonkwo',
    email: 'sam.okonkwo@bufm.demo',
    title: 'Compliance reviewer',
  },
  {
    id: 'bufm-morgan',
    name: 'Morgan Ellis',
    email: 'morgan.ellis@bufm.demo',
    title: 'Regional BUFM lead',
  },
  {
    id: 'bufm-riley',
    name: 'Riley Park',
    email: 'riley.park@bufm.demo',
    title: 'Financial alignment',
  },
]

/** Fixed roster BUFM can browse; document assignment matches `ownerName` === `name`. */
export const BUFM_SAMPLE_POC_USERS: BufmPocUser[] = [
  {
    id: 'poc-1',
    name: 'John Smith',
    email: 'john.smith@ceui.demo',
    region: 'North',
    title: 'Senior Content Owner',
    status: 'active',
  },
  {
    id: 'poc-2',
    name: 'Jamie Chen',
    email: 'jamie.chen@ceui.demo',
    region: 'West',
    title: 'Knowledge Author',
    status: 'active',
  },
  {
    id: 'poc-3',
    name: 'Maria Garcia',
    email: 'maria.garcia@ceui.demo',
    region: 'South',
    title: 'Field Documentation Lead',
    status: 'active',
  },
  {
    id: 'poc-4',
    name: 'Dev Patel',
    email: 'dev.patel@ceui.demo',
    region: 'Central',
    title: 'Operations Writer',
    status: 'away',
  },
  {
    id: 'poc-5',
    name: 'Taylor Kim',
    email: 'taylor.kim@ceui.demo',
    region: 'East',
    title: 'Program Owner',
    status: 'active',
  },
  {
    id: 'poc-6',
    name: 'Jordan Lee',
    email: 'jordan.lee@ceui.demo',
    region: 'North',
    title: 'Content Coordinator',
    status: 'active',
  },
  {
    id: 'poc-7',
    name: 'Casey Brown',
    email: 'casey.brown@ceui.demo',
    region: 'Corporate',
    title: 'Enterprise POC',
    status: 'active',
  },
  {
    id: 'poc-8',
    name: 'Alex Nguyen',
    email: 'alex.nguyen@ceui.demo',
    region: 'West',
    title: 'Regional Analyst',
    status: 'active',
  },
  {
    id: 'poc-9',
    name: 'Riley Martinez',
    email: 'riley.martinez@ceui.demo',
    region: 'South',
    title: 'Sustainability POC',
    status: 'offline',
  },
  {
    id: 'poc-10',
    name: 'Sam Okonkwo',
    email: 'sam.okonkwo@ceui.demo',
    region: 'Central',
    title: 'Compliance Author',
    status: 'active',
  },
]

export function findBufmPocUserByName(name: string | undefined): BufmPocUser | undefined {
  if (!name?.trim()) return undefined
  return BUFM_SAMPLE_POC_USERS.find((u) => u.name === name.trim())
}
