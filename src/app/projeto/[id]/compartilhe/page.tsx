'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CompartilhePage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('projects').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setProject(data)
    })
  }, [id])

  const funilUrl = project?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${project.slug}`
    : null

  function handleCopy() {
    if (!funilUrl) return
    navigator.clipboard.writeText(funilUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExport() {
    setExporting(true)
    try {
      const { data: pages } = await supabase.from('pages').select('*').eq('project_id', id)
      const exportData = { project, pages, exportedAt: new Date().toISOString(), version: '1.0' }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `synkro-${project?.slug || 'projeto'}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExported(true)
      setTimeout(() => setExported(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: '#0f1018', padding: '32px 24px', overflowY: 'auto' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── LINKS PÚBLICOS ─────────────────────────────────────── */}
        <div style={{ background: '#13141f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                <path d="M7 9a3 3 0 004 0l2-2a3 3 0 00-4-4L8 4"/><path d="M9 7a3 3 0 00-4 0L3 9a3 3 0 004 4l1-1"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Links Públicos</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>URLs para compartilhar com seu público</div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!project?.published ? (
              /* Funil não publicado */
              <div style={{ padding: '32px 20px', borderRadius: 12, background: 'rgba(124,92,252,0.06)', border: '1px solid rgba(124,92,252,0.15)', textAlign: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(124,92,252,0.4)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 10 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>Funil não publicado</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Publique o funil na Topbar para obter o link público</div>
              </div>
            ) : (
              <>
                {/* Card URL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Synkro</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#7c5cfc', background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: 99, padding: '1px 7px' }}>Principal</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{funilUrl}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => window.open(funilUrl!, '_blank')}
                      style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8M8 1h4v4M5 8l6-6"/>
                      </svg>
                    </button>
                    <button
                      onClick={handleCopy}
                      style={{ height: 32, padding: '0 12px', borderRadius: 8, background: copied ? 'rgba(34,211,135,0.15)' : 'rgba(124,92,252,0.15)', border: `1px solid ${copied ? 'rgba(34,211,135,0.3)' : 'rgba(124,92,252,0.3)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: copied ? '#22d387' : '#a78bfa' }}
                    >
                      {copied
                        ? <><svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 5.5l3 3 6-6"/></svg>Copiado!</>
                        : <><svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><path d="M1 8V1.5A.5.5 0 011.5 1H8"/></svg>Copiar</>
                      }
                    </button>
                  </div>
                </div>

                {/* Alerta domínio */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '12px 14px' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M8 1l7 13H1L8 1z"/><path d="M8 6v4M8 11.5v.5"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 3 }}>Recomendamos usar um domínio próprio</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>Os domínios padrão podem sair do ar por denúncias. Um domínio próprio garante mais segurança e estabilidade.</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── EXPORTAR PROJETO ──────────────────────────────────── */}
        <div style={{ background: '#13141f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round">
                <path d="M8 1v9M4 7l4 4 4-4M1 13h14"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Exportar Projeto</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Gere um arquivo para transferir ou fazer backup</div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 12 }}>
                Exporte o projeto completo com layout, lógica e conteúdo. O arquivo pode ser importado em outra conta Synkro.
              </div>
              {['Ideal para transferir projetos para clientes', 'Perfeito para trabalho em equipe', 'Funciona como backup completo do funil'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }}/>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ flexShrink: 0, width: 60, height: 68, borderRadius: 14, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round">
                <path d="M13 2H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-6z"/><path d="M13 2v6h6M8 13h6M8 17h4"/>
              </svg>
              <span style={{ fontSize: 8, color: '#f59e0b', fontWeight: 700 }}>JSON</span>
            </div>
          </div>

          {/* Botão */}
          <div style={{ padding: '0 24px 24px' }}>
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{ width: '100%', padding: '13px', borderRadius: 12, background: exported ? 'rgba(34,211,135,0.15)' : exporting ? 'rgba(245,158,11,0.3)' : '#f59e0b', border: exported ? '1px solid rgba(34,211,135,0.3)' : 'none', color: exported ? '#22d387' : '#0f1018', fontSize: 13, fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
            >
              {exporting ? (
                <>
                  <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Gerando arquivo...
                </>
              ) : exported ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 7l4 4 8-8"/></svg>
                  Arquivo baixado!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M7 1v8M3 6l4 4 4-4M1 12h12"/>
                  </svg>
                  Exportar Projeto (.json)
                </>
              )}
            </button>
          </div>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}