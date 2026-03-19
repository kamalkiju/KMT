export type BufmPocUserStatus = 'active' | 'away' | 'offline'

export interface BufmPocUser {
  id: string
  name: string
  email: string
  region: string
  title: string
  status: BufmPocUserStatus
}
