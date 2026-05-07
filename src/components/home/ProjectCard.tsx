'use client'

import { Project } from '@/types'
import { useRouter } from 'next/navigation'

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/projeto/${project.id}/flow`)}
      className="group relative bg-[#13141f] border border-white/5 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#7c5cfc]/40 hover:shadow-[0_8px_32px_rgba(124,92,252,0.12)]"
    >
      {/* Ícone */}
      <div className="w-12 h-12 rounded-xl bg-[#1a1b2a] border border-white/5 flex items-center justify-center mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>

      {/* Nome */}
      <h3 className="font-syne font-700 text-white text-base mb-1 group-hover:text-[#a78bfa] transition-colors">
        {project.name}
      </h3>

      {/* Descrição */}
      {project.description && (
        <p className="text-sm text-white/40 mb-4">{project.description}</p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${project.published ? 'bg-[#22d387]' : 'bg-white/20'}`} />
          <span className="text-xs text-white/40">
            {project.published ? 'Ativo' : 'Rascunho'}
          </span>
        </div>
        <span className="text-xs text-white/25">·</span>
        <span className="text-xs text-white/40">{project.views.toLocaleString('pt-BR')} views</span>
        <span className="text-xs text-white/25">·</span>
        <span className="text-xs text-white/40">{project.conversion}% conv.</span>
      </div>

      {/* Delete btn */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(project.id)
        }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-[#1a1b2a] border border-white/5 flex items-center justify-center hover:border-red-500/30 hover:bg-red-500/10"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 3h8M5 3V2h2v1M3.5 5v4M8.5 5v4"/>
        </svg>
      </button>
    </div>
  )
}