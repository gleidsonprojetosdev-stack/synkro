import { create } from 'zustand'
import { Project } from '@/types'

interface ProjectStore {
  projects: Project[]
  addProject: (name: string) => void
  deleteProject: (id: string) => void
  updateProject: (id: string, data: Partial<Project>) => void
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Quiz Vendas Afiliados',
    description: 'Qualificação para infoproduto',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    published: true,
    views: 1241,
    leads: 892,
    conversion: 71,
  },
  {
    id: '2',
    name: 'Perfil do Empreendedor',
    description: 'Quiz de diagnóstico de negócio',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    published: false,
    views: 987,
    leads: 311,
    conversion: 64,
  },
]

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: mockProjects,
  addProject: (name: string) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          id: Date.now().toString(),
          name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          published: false,
          views: 0,
          leads: 0,
          conversion: 0,
        },
      ],
    })),
  deleteProject: (id: string) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
  updateProject: (id: string, data: Partial<Project>) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),
}))