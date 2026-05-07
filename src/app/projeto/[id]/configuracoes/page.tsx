'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Integration {
  type: 'pixel' | 'gtm' | 'utmify'
  value: string
}

const INT_META = {
  pixel: {
    label: 'Meta Pixel',
    description: 'Rastreie eventos e conversões no Facebook/Instagram Ads',
    placeholder: 'Ex: 123456789012345',
    color: '#1877f2',
    bg: 'rgba(24,119,242,0.12)',
  },
  gtm: {
    label: 'Google Tag Manager',
    description: 'Gerencie várias tags em um só lugar sem editar código',
    placeholder: 'Ex: GTM-XXXXXXX',
    color: '#34a853',
    bg: 'rgba(52,168,83,0.12)',
  },
  utmify: {
    label: 'UTMify Pixel',
    description: 'Identifique e rastreie tráfego por UTMs de campanha',
    placeholder: 'Ex: seu-token-utmify',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
  },
}

export default function ConfiguracoesPage() {
  const { id } = useParams<{ id: string }>()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [siteTitle, setSiteTitle] = useState('')
  const [siteDescription, setSiteDescription] = useState('')
  const [headScript, setHeadScript] = useState('')
  const [allowIndexing, setAllowIndexing] = useState(false)
  const [domains, setDomains] = useState<string[]>([])
  const [selectedDomain, setSelectedDomain] = useState('nenhum')
  const [newDomain, setNewDomain] = useState('')
  const [showDomainInput, setShowDomainInput] = useState(false)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [addingType, setAddingType] = useState<Integration['type'] | null>(null)
  const [addingValue, setAddingValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('projects').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setName(data.name || '')
      setSlug(data.slug || '')
      setSiteTitle(data.site_title || data.name || '')
      setSiteDescription(data.site_description || '')
      setHeadScript(data.head_script || '')
      setAllowIndexing(data.allow_indexing ?? false)
      if (data.domain) { setDomains([data.domain]); setSelectedDomain(data.domain) }
      const ints: Integration[] = []
      if (data.pixel_id) ints.push({ type: 'pixel', value: data.pixel_id })
      if (data.gtm_id) ints.push({ type: 'gtm', value: data.gtm_id })
      if (data.utmify_id) ints.push({ type: 'utmify', value: data.utmify_id })
      setIntegrations(ints)
    })
  }, [id])

  async function handleSave() {
    setSaving(true)
    try {
      const intMap: Record<string, string | null> = { pixel_id: null, gtm_id: null, utmify_id: null }
      integrations.forEach(i => {
        if (i.type === 'pixel') intMap.pixel_id = i.value
        if (i.type === 'gtm') intMap.gtm_id = i.value
        if (i.type === 'utmify') intMap.utmify_id = i.value
      })
      await supabase.from('projects').update({
        name, site_title: siteTitle, site_description: siteDescription,
        head_script: headScript, allow_indexing: allowIndexing,
        domain: selectedDomain === 'nenhum' ? null : selectedDomain,
        ...intMap,
      }).eq('id', id)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  function handleAddDomain() {
    const d = newDomain.trim()
    if (!d) return
    setDomains([d]); setSelectedDomain(d); setNewDomain(''); setShowDomainInput(false)
  }

  function handleSaveIntegration() {
    if (!addingType || !addingValue.trim()) return
    setIntegrations(prev => {
      const exists = prev.find(i => i.type === addingType)
      if (exists) return prev.map(i => i.type === addingType ? { ...i, value: addingValue.trim() } : i)
      return [...prev, { type: addingType, value: addingValue.trim() }]
    })
    setAddingType(null); setAddingValue(''); setShowPicker(false)
  }

  const availableTypes = (['pixel', 'gtm', 'utmify'] as const).filter(t => !integrations.find(i => i.type === t))

  const card: React.CSSProperties = { background: '#13141f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', marginBottom: 0 }
  const cardHeader: React.CSSProperties = { padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }
  const cardBody: React.CSSProperties = { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }
  const iconBox = (bg: string, border: string): React.CSSProperties => ({ width: 36, height: 36, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 })
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'block' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
  const dashedBtn: React.CSSProperties = { width: '100%', padding: '11px', borderRadius: 12, background: 'rgba(124,92,252,0.07)', border: '1px dashed rgba(124,92,252,0.35)', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: '#0f1018', padding: '32px 24px', overflowY: 'auto' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── INFORMAÇÕES BÁSICAS ─────────────────────────────────── */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={iconBox('rgba(124,92,252,0.15)', 'rgba(124,92,252,0.2)')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Informações Básicas</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Dados fundamentais do seu projeto</div>
            </div>
          </div>
          <div style={cardBody}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={label}>Nome do Projeto</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do projeto" style={inputStyle}/>
              </div>
              <div>
                <label style={label}>URL do Projeto</label>
                <input value={slug} readOnly style={{ ...inputStyle, opacity: 0.4, cursor: 'not-allowed' }}/>
              </div>
            </div>
            <div>
              <label style={label}>Domínio do Projeto</label>
              <select value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="nenhum">Nenhum</option>
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── DOMÍNIOS ────────────────────────────────────────────── */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={iconBox('rgba(124,92,252,0.15)', 'rgba(124,92,252,0.2)')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Domínios</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Conecte seu próprio domínio ao funil</div>
            </div>
          </div>
          <div style={cardBody}>
            {showDomainInput ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input autoFocus value={newDomain} onChange={e => setNewDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddDomain()} placeholder="meusite.com" style={{ ...inputStyle, flex: 1 }}/>
                <button onClick={handleAddDomain} style={{ padding: '10px 16px', borderRadius: 10, background: '#7c5cfc', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}>Adicionar</button>
                <button onClick={() => { setShowDomainInput(false); setNewDomain('') }} style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}>Cancelar</button>
              </div>
            ) : (
              <button onClick={() => setShowDomainInput(true)} style={dashedBtn}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
                Novo Domínio
              </button>
            )}
            {domains.length === 0 && !showDomainInput && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 6 }}>
                  <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Nenhum Domínio</div>
              </div>
            )}
            {domains.map(d => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 12, background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', flexShrink: 0 }}/>
                  <span style={{ fontSize: 12, color: '#fff' }}>{d}</span>
                </div>
                <button onClick={() => { setDomains([]); setSelectedDomain('nenhum') }} style={{ fontSize: 11, color: '#f87171', background: 'rgba(248,113,113,0.1)', border: 'none', borderRadius: 7, padding: '4px 10px', cursor: 'pointer' }}>Remover</button>
              </div>
            ))}
          </div>
        </div>

        {/* ── TRÁFEGO E MONITORAMENTO ─────────────────────────────── */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={iconBox('rgba(124,92,252,0.15)', 'rgba(124,92,252,0.2)')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Tráfego e Monitoramento</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>SEO e scripts de rastreamento</div>
            </div>
          </div>
          <div style={cardBody}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={label}>Título do Site</label>
                <input value={siteTitle} onChange={e => setSiteTitle(e.target.value)} placeholder="Título na aba do navegador" style={inputStyle}/>
              </div>
              <div>
                <label style={label}>Ativar Robôs de Busca</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.08)', height: 42, boxSizing: 'border-box' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{allowIndexing ? 'Ativado' : 'Desativado'}</span>
                  <button
                    onClick={() => setAllowIndexing(v => !v)}
                    style={{ width: 40, height: 22, borderRadius: 99, background: allowIndexing ? '#7c5cfc' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}
                  >
                    <span style={{ position: 'absolute', top: 2, left: allowIndexing ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}/>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label style={label}>Descrição do Site</label>
              <textarea value={siteDescription} onChange={e => setSiteDescription(e.target.value)} placeholder="Descrição que pode aparecer nos buscadores..." rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}/>
            </div>
            <div>
              <label style={label}>Script de Cabeçalho</label>
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#0d0e17', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }}/>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }}/>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', display: 'inline-block' }}/>
                  <span style={{ marginLeft: 6, fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{'<head>'}</span>
                </div>
                <textarea
                  value={headScript}
                  onChange={e => setHeadScript(e.target.value)}
                  placeholder="<!-- Cole aqui o script que você deseja adicionar antes de </head> -->"
                  rows={5}
                  spellCheck={false}
                  style={{ ...inputStyle, resize: 'none', fontFamily: 'monospace', fontSize: 12, color: '#a78bfa', letterSpacing: '0.02em', borderRadius: 0, border: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── INTEGRAÇÕES ─────────────────────────────────────────── */}
        <div style={card}>
          <div style={cardHeader}>
            <div style={iconBox('rgba(124,92,252,0.15)', 'rgba(124,92,252,0.2)')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Integrações</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Conecte ferramentas externas ao seu funil</div>
            </div>
          </div>
          <div style={cardBody}>
            {/* Integrações salvas */}
            {integrations.map(int => {
              const m = INT_META[int.type]
              return (
                <div key={int.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 14px', borderRadius: 12, background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{int.type === 'pixel' ? 'f' : int.type === 'gtm' ? 'G' : 'U'}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{m.label}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{int.value}</div>
                    </div>
                  </div>
                  <button onClick={() => setIntegrations(p => p.filter(i => i.type !== int.type))} style={{ fontSize: 11, color: '#f87171', background: 'rgba(248,113,113,0.1)', border: 'none', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', flexShrink: 0 }}>Remover</button>
                </div>
              )
            })}

            {/* Form nova integração */}
            {addingType && (
              <div style={{ padding: 16, borderRadius: 12, background: '#1a1b2a', border: `1px solid ${INT_META[addingType].color}28`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{INT_META[addingType].label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>{INT_META[addingType].description}</div>
                </div>
                <input autoFocus value={addingValue} onChange={e => setAddingValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveIntegration()} placeholder={INT_META[addingType].placeholder} style={{ ...inputStyle, fontFamily: 'monospace', borderColor: `${INT_META[addingType].color}40` }}/>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSaveIntegration} style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#7c5cfc', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Salvar</button>
                  <button onClick={() => { setAddingType(null); setAddingValue('') }} style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', border: 'none' }}>Cancelar</button>
                </div>
              </div>
            )}

            {/* Picker */}
            {showPicker && !addingType && (
              <div style={{ padding: 12, borderRadius: 12, background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '0 4px 4px' }}>Escolha uma integração:</div>
                {availableTypes.map(type => {
                  const m = INT_META[type]
                  return (
                    <button key={type} onClick={() => { setAddingType(type); setShowPicker(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, background: m.bg, border: `1px solid ${m.color}18`, cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${m.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{type === 'pixel' ? 'f' : type === 'gtm' ? 'G' : 'U'}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{m.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>{m.description}</div>
                      </div>
                    </button>
                  )
                })}
                <button onClick={() => setShowPicker(false)} style={{ padding: '8px', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.22)', fontSize: 11, cursor: 'pointer', border: 'none' }}>Cancelar</button>
              </div>
            )}

            {/* Botão Nova Integração */}
            {!showPicker && !addingType && availableTypes.length > 0 && (
              <button onClick={() => setShowPicker(true)} style={dashedBtn}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
                Nova Integração
              </button>
            )}

            {integrations.length === 0 && !showPicker && !addingType && (
              <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Nenhuma integração</div>
            )}
            {availableTypes.length === 0 && !addingType && integrations.length > 0 && (
              <div style={{ textAlign: 'center', padding: '6px 0', fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>✓ Todas as integrações foram adicionadas</div>
            )}
          </div>
        </div>

        {/* ── BOTÃO SALVAR ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 32 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 32px', borderRadius: 12, background: saved ? '#34d399' : '#7c5cfc', color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', minWidth: 180, justifyContent: 'center', transition: 'background 0.3s' }}
          >
            {saving ? (
              <><svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Salvando...</>
            ) : saved ? (
              <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 7l4 4 8-8"/></svg>Salvo!</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 1v8M3 6l4 4 4-4M1 12h12"/></svg>Salvar Configurações</>
            )}
          </button>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}