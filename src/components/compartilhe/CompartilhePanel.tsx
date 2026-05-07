'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CompartilhePanelProps {
  projectId: string
}

export default function CompartilhePanel({ projectId }: CompartilhePanelProps) {
  const [slug, setSlug] = useState('')
  const [published, setPublished] = useState(false)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)

  const publicUrl =
    typeof window !== 'undefined' && slug
      ? `${window.location.origin}/f/${slug}`
      : ''

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('projects')
        .select('slug, name, published')
        .eq('id', projectId)
        .single()
      if (data) {
        setSlug(data.slug || '')
        setPublished(data.published ?? false)
      }
    }
    load()
  }, [projectId])

  function handleCopy() {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExport() {
    setExporting(true)
    try {
      const { data } = await supabase
        .from('projects')
        .select('*, pages(*)')
        .eq('id', projectId)
        .single()

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `synkro-${slug || 'projeto'}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExported(true)
      setTimeout(() => setExported(false), 3000)
    } catch (e) {
      console.error('Erro ao exportar:', e)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f1018' }}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* ── LINKS PÚBLICOS ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#13141f', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(124,92,252,0.18)', color: '#a78bfa' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Links Públicos</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                URLs para compartilhar com seu público
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

            {/* Funil não publicado */}
            {!published && (
              <div
                className="flex flex-col items-center justify-center py-10 rounded-xl"
                style={{ background: 'rgba(124,92,252,0.05)', border: '1px dashed rgba(124,92,252,0.2)' }}
              >
                <svg
                  className="w-9 h-9 mb-3"
                  style={{ color: 'rgba(255,255,255,0.18)' }}
                  fill="none" stroke="currentColor" strokeWidth={1.4} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Funil não publicado
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.18)' }}>
                  Publique o funil na Topbar para obter o link público
                </p>
              </div>
            )}

            {/* Funil publicado */}
            {published && publicUrl && (
              <>
                {/* Card URL */}
                <div
                  className="flex items-center justify-between gap-3 p-4 rounded-xl"
                  style={{ background: '#1a1b27', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-white">Synkro</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(124,92,252,0.2)', color: '#a78bfa' }}
                      >
                        Principal
                      </span>
                    </div>
                    <p className="text-sm font-mono truncate" style={{ color: '#7c5cfc' }}>
                      {publicUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Abrir */}
                    <button
                      onClick={() => window.open(publicUrl, '_blank')}
                      title="Abrir link"
                      className="p-2 rounded-lg transition-all hover:scale-105"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <svg className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.55)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>

                    {/* Copiar */}
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(124,92,252,0.15)',
                        border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(124,92,252,0.3)'}`,
                        color: copied ? '#34d399' : '#a78bfa',
                      }}
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Copiado!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Alerta domínio próprio */}
                <div
                  className="flex gap-3 p-4 rounded-xl"
                  style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  <svg
                    className="w-5 h-5 shrink-0 mt-0.5"
                    style={{ color: '#f59e0b' }}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
                      Recomendamos usar um domínio próprio
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(245,158,11,0.65)' }}>
                      Os domínios padrão podem sair do ar por denúncias. Um domínio próprio garante
                      mais segurança e estabilidade para divulgar seu funil.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── EXPORTAR PROJETO ─────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#13141f', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Exportar Projeto</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Gere um arquivo para transferir ou fazer backup
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            <div className="flex gap-5 items-start">
              <div className="flex-1">
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Exporte o projeto completo com layout, lógica e conteúdo. O arquivo pode ser
                  importado em outra conta Synkro.
                </p>
                <ul className="space-y-2.5">
                  {[
                    'Ideal para transferir projetos para clientes',
                    'Perfeito para trabalho em equipe',
                    'Funciona como backup completo do funil',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: '#f59e0b' }}
                      />
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ícone JSON */}
              <div
                className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <svg
                  className="w-7 h-7 mb-1"
                  style={{ color: '#f59e0b' }}
                  fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>JSON</span>
              </div>
            </div>

            {/* Botão exportar */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99]"
              style={{
                background: exported
                  ? 'rgba(52,211,153,0.15)'
                  : exporting
                  ? 'rgba(245,158,11,0.5)'
                  : '#f59e0b',
                color: exported ? '#34d399' : '#0f1018',
                border: exported ? '1px solid rgba(52,211,153,0.3)' : 'none',
                cursor: exporting ? 'not-allowed' : 'pointer',
              }}
            >
              {exporting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Gerando arquivo...
                </>
              ) : exported ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Arquivo baixado!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exportar Projeto (.json)
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}