export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  published: boolean
  views: number
  leads: number
  conversion: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
}