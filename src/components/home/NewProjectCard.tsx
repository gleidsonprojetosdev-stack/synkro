'use client'

import { useState } from 'react'

interface NewProjectCardProps {
  onAdd: (name: string) => void
}

export default function NewProjectCard({ onAdd }: NewProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')

  function handleAdd() {
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
    setIsOpen(false)
  }

  if (isOpen) {
    return (
      <div className="bg-[#13141f] border border-[#7c5cfc]/40 rounded-2xl p-6">
        <h3 className="font-syne font-bold text-white text-base mb-4">
          Novo projeto
        </h3>
        <input
          autoFocus
          type="text"
          placeholder="Nome do projeto..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="w-full bg-[#1a1b2a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#7c5cfc]/50 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="flex-1 bg-gradient-to-r from-[#7c5cfc] to-[#a78bfa] text-white text-sm font-semibold rounded-xl py-2.5 hover:-translate-y-0.5 transition-transform"
          >
            Criar
          </button>
          <button
            onClick={() => { setIsOpen(false); setName('') }}
            className="flex-1 bg-white/5 border border-white/10 text-white/60 text-sm rounded-xl py-2.5 hover:bg-white/8 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => setIsOpen(true)}
      className="group bg-[#13141f] border border-dashed border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#7c5cfc]/50 hover:bg-[#7c5cfc]/5 flex flex-col items-center justify-center min-h-[180px] gap-3"
    >
      <div className="w-12 h-12 rounded-xl bg-[#1a1b2a] border border-dashed border-white/10 group-hover:border-[#7c5cfc]/40 flex items-center justify-center transition-colors">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 4v12M4 10h12"/>
        </svg>
      </div>
      <span className="text-sm text-[#a78bfa] font-medium">Novo Projeto</span>
    </div>
  )
}