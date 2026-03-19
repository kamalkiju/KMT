export type UserRole = 'POC' | 'BUFM' | 'KMT'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}
