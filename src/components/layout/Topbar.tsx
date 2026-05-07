'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TABS = [
  { id: 'flow',          label: 'Flow' },
  { id: 'tema',          label: 'Tema' },
  { id: 'compartilhe',   label: 'Compartilhe' },
  { id: 'estatisticas',  label: 'Estatísticas' },
  { id: 'configuracoes', label: 'Configurações' },
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    + '-' + Math.random().toString(36).substring(2, 7)
}

export default function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [projectName, setProjectName] = useState('Novo Projeto')
  const [editingName, setEditingName] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [published, setPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [slug, setSlug] = useState<string | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const segments = pathname.split('/')
  const projectId = segments[2] ?? ''
  const activeTab = segments[3] ?? 'flow'

  useEffect(() => {
    if (!projectId) return
    async function loadProject() {
      const { data } = await supabase
        .from('projects')
        .select('name, published, slug')
        .eq('id', projectId)
        .single()
      if (data) {
        setProjectName(data.name || 'Novo Projeto')
        setPublished(data.published || false)
        setSlug(data.slug || null)
      }
    }
    loadProject()
  }, [projectId])

  async function handleSaveName() {
    setEditingName(false)
    if (!projectId) return
    await supabase.from('projects').update({ name: projectName }).eq('id', projectId)
  }

  async function handleSave() {
    setSaving(true)
    if (projectId) {
      await supabase.from('projects').update({ name: projectName }).eq('id', projectId)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handlePublish() {
    if (!projectId) return
    setPublishing(true)
    if (published) {
      await supabase.from('projects').update({ published: false }).eq('id', projectId)
      setPublished(false)
      setSlug(null)
    } else {
      const newSlug = slug || generateSlug(projectName)
      await supabase.from('projects').update({ published: true, slug: newSlug }).eq('id', projectId)
      setPublished(true)
      setSlug(newSlug)
      setShowPublishModal(true)
    }
    setPublishing(false)
  }

  function handleTest() {
    if (!projectId) return
    window.open(`/f/preview?projectId=${projectId}`, '_blank')
  }

  function copyLink() {
    const url = `${window.location.origin}/f/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <header
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{ height: 48, background: '#0f1018', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 50 }}
      >
        {/* Esquerda */}
        <div className="flex items-center gap-3" style={{ minWidth: 200 }}>
          <button
            onClick={() => router.push('/home')}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{ width: 28, height: 28, color: 'rgba(255,255,255,0.4)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>

          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L8 1z" />
            <path d="M8 1v5h5" />
          </svg>

          {editingName ? (
            <input
              autoFocus
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              className="text-sm font-semibold text-white bg-transparent outline-none border-b"
              style={{ borderColor: '#7c5cfc', width: 140 }}
            />
          ) : (
            <span
              className="text-sm font-semibold text-white cursor-pointer hover:text-white/80 transition-colors"
              style={{ fontFamily: 'Syne, sans-serif' }}
              onClick={() => setEditingName(true)}
            >
              {projectName}
            </span>
          )}

          {published && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: 'rgba(34,211,135,0.1)', border: '1px solid rgba(34,211,135,0.3)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22d387' }}/>
              <span style={{ fontSize: 10, color: '#22d387', fontWeight: 600 }}>Publicado</span>
            </div>
          )}
        </div>

        {/* Centro — abas */}
        <div className="flex items-center gap-1">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => router.push(`/projeto/${projectId}/${tab.id}`)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: isActive ? '#7c5cfc' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  border: isActive ? '1px solid #7c5cfc' : '1px solid transparent',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Direita */}
        <div className="flex items-center gap-2" style={{ minWidth: 200, justifyContent: 'flex-end' }}>
          <button
            onClick={handleTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l8 4-8 4V2z" />
            </svg>
            Testar
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: published ? 'rgba(248,113,113,0.15)' : 'rgba(34,211,135,0.1)',
              color: published ? '#f87171' : '#22d387',
              border: `1px solid ${published ? 'rgba(248,113,113,0.3)' : 'rgba(34,211,135,0.3)'}`,
              opacity: publishing ? 0.6 : 1,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 1v7M3 4l3-3 3 3M1 10h10" />
            </svg>
            {publishing ? '...' : published ? 'Despublicar' : 'Publicar'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: saved ? 'rgba(34,211,135,0.2)' : '#7c5cfc',
              color: saved ? '#22d387' : '#fff',
              border: `1px solid ${saved ? 'rgba(34,211,135,0.4)' : '#7c5cfc'}`,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {saved
                ? <path d="M1 6l3.5 3.5L11 2" />
                : <><path d="M2 1h7l2 2v8a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z" /><path d="M8 1v4H4V1M4 7h4" /></>
              }
            </svg>
            {saved ? 'Salvo!' : saving ? '...' : 'Salvar'}
          </button>
        </div>
      </header>

      {/* Modal publicação */}
      {showPublishModal && slug && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(8px)' }}
          onClick={() => setShowPublishModal(false)}>
          <div style={{ background: '#13141f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, maxWidth: 460, width: '90%', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,rgba(124,92,252,0.2),rgba(34,211,135,0.1))', border: '1px solid rgba(34,211,135,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#22d387" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M14 2l10 4v8c0 6-4 10-10 12C8 24 4 20 4 14V6l10-4z"/>
                  <path d="M9 14l3.5 3.5L19 10"/>
                </svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif', marginBottom: 6, letterSpacing: -0.5 }}>
                Funil publicado!
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                Seu funil está no ar e pronto para receber visitantes.
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[
                { icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#22d387" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="6"/><path d="M1 7h12M7 1a9 9 0 010 12M7 1a9 9 0 000 12"/></svg>, label: 'Online' },
                { icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"><path d="M7 1l4.5 2v5c0 3-2 5-4.5 5.5C4.5 13 2.5 11 2.5 8V3L7 1z"/><path d="M5 7l2 2 3-3"/></svg>, label: 'Seguro' },
                { icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"><path d="M7 1v12M1 7h12"/><circle cx="7" cy="7" r="6"/></svg>, label: 'Ativo' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 12px' }}>
                  {s.icon}
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Link */}
            <div style={{ background: '#0f1018', border: '1px solid rgba(124,92,252,0.25)', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 8, fontWeight: 600 }}>Link do funil</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, fontSize: 12, color: '#a78bfa', wordBreak: 'break-all' as const, fontFamily: 'monospace', lineHeight: 1.4 }}>
                  {typeof window !== 'undefined' ? window.location.origin : ''}/f/{slug}
                </div>
                <button onClick={copyLink} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: copied ? 'rgba(34,211,135,0.15)' : 'rgba(124,92,252,0.15)', border: `1px solid ${copied ? 'rgba(34,211,135,0.3)' : 'rgba(124,92,252,0.3)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {copied
                    ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#22d387" strokeWidth="2" strokeLinecap="round"><path d="M1 6.5l3.5 3.5L12 2"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M1 9V1.5A.5.5 0 011.5 1H9"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { window.open(`/f/${slug}`, '_blank') }}
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8M8 1h4v4M5 8l6-6"/></svg>
                Visualizar
              </button>
              <button
                onClick={() => setShowPublishModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#7c5cfc,#a78bfa)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,92,252,0.4)' }}
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}