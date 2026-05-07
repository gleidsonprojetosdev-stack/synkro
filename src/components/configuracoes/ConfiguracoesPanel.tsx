'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ConfiguracoesPanelProps {
  projectId: string
}

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
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
      </svg>
    ),
  },
  gtm: {
    label: 'Google Tag Manager',
    description: 'Gerencie várias tags em um só lugar sem editar código',
    placeholder: 'Ex: GTM-XXXXXXX',
    color: '#34a853',
    bg: 'rgba(52,168,83,0.12)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12.003 0C9.038 0 6.3 1.266 4.354 3.295l4.46 4.46c.907-.922 2.17-1.493 3.57-1.493 2.793 0 5.06 2.268 5.06 5.06 0 1.4-.571 2.664-1.494 3.571l4.46 4.46C22.438 17.408 24 14.72 24 11.682 24 5.23 18.618 0 12.003 0zM3.295 4.354C1.266 6.3 0 9.038 0 12.003 0 18.455 5.382 24 11.997 24c2.966 0 5.705-1.069 7.79-2.835l-4.46-4.46c-.906.923-2.17 1.494-3.57 1.494-2.793 0-5.06-2.268-5.06-5.06 0-1.4.57-2.664 1.493-3.57L3.295 4.354z" />
      </svg>
    ),
  },
  utmify: {
    label: 'UTMify Pixel',
    description: 'Identifique e rastreie tráfego por UTMs de campanha',
    placeholder: 'Ex: seu-token-utmify',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
      </svg>
    ),
  },
}

export default function ConfiguracoesPanel({ projectId }: ConfiguracoesPanelProps) {
  // ── Estado ──────────────────────────────────────────────────────────────
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
  const [addingType, setAddingType] = useState<'pixel' | 'gtm' | 'utmify' | null>(null)
  const [addingValue, setAddingValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // ── Carregar ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      if (!data) return

      setName(data.name || '')
      setSlug(data.slug || '')
      setSiteTitle(data.site_title || data.name || '')
      setSiteDescription(data.site_description || '')
      setHeadScript(data.head_script || '')
      setAllowIndexing(data.allow_indexing ?? false)

      if (data.domain) {
        setDomains([data.domain])
        setSelectedDomain(data.domain)
      }

      const ints: Integration[] = []
      if (data.pixel_id) ints.push({ type: 'pixel', value: data.pixel_id })
      if (data.gtm_id) ints.push({ type: 'gtm', value: data.gtm_id })
      if (data.utmify_id) ints.push({ type: 'utmify', value: data.utmify_id })
      setIntegrations(ints)
    }
    load()
  }, [projectId])

  // ── Salvar ───────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    try {
      const intMap: Record<string, string | null> = {
        pixel_id: null,
        gtm_id: null,
        utmify_id: null,
      }
      integrations.forEach(i => {
        if (i.type === 'pixel') intMap.pixel_id = i.value
        if (i.type === 'gtm') intMap.gtm_id = i.value
        if (i.type === 'utmify') intMap.utmify_id = i.value
      })

      await supabase
        .from('projects')
        .update({
          name,
          site_title: siteTitle,
          site_description: siteDescription,
          head_script: headScript,
          allow_indexing: allowIndexing,
          domain: selectedDomain === 'nenhum' ? null : selectedDomain,
          ...intMap,
        })
        .eq('id', projectId)

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      console.error('Erro ao salvar:', e)
    } finally {
      setSaving(false)
    }
  }

  // ── Domínios ─────────────────────────────────────────────────────────────
  function handleAddDomain() {
    const d = newDomain.trim()
    if (!d) return
    setDomains([d])
    setSelectedDomain(d)
    setNewDomain('')
    setShowDomainInput(false)
  }

  function handleRemoveDomain() {
    setDomains([])
    setSelectedDomain('nenhum')
  }

  // ── Integrações ──────────────────────────────────────────────────────────
  function handleSaveIntegration() {
    if (!addingType || !addingValue.trim()) return
    setIntegrations(prev => {
      const exists = prev.find(i => i.type === addingType)
      if (exists) return prev.map(i => i.type === addingType ? { ...i, value: addingValue.trim() } : i)
      return [...prev, { type: addingType, value: addingValue.trim() }]
    })
    setAddingType(null)
    setAddingValue('')
    setShowPicker(false)
  }

  function handleRemoveIntegration(type: Integration['type']) {
    setIntegrations(prev => prev.filter(i => i.type !== type))
  }

  const availableTypes = (['pixel', 'gtm', 'utmify'] as const).filter(
    t => !integrations.find(i => i.type === t)
  )

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#0f1018' }}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* ── INFORMAÇÕES BÁSICAS ─────────────────────────────────── */}
        <Card
          icon={<IcoInfo />}
          title="Informações Básicas"
          subtitle="Dados fundamentais do seu projeto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome do Projeto">
              <Input value={name} onChange={setName} placeholder="Nome do seu projeto" />
            </Field>
            <Field label="URL do Projeto">
              <div className="relative">
                <Input value={slug} onChange={() => {}} placeholder="slug" disabled />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'rgba(255,255,255,0.22)' }}
                >
                  somente leitura
                </span>
              </div>
            </Field>
          </div>

          <Field label="Domínio do Projeto">
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: '#13141f',
                border: '1px solid rgba(255,255,255,0.08)',
                color: selectedDomain === 'nenhum' ? 'rgba(255,255,255,0.35)' : 'white',
              }}
            >
              <option value="nenhum">Nenhum</option>
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </Card>

        {/* ── DOMÍNIOS ────────────────────────────────────────────── */}
        <Card
          icon={<IcoGlobe />}
          title="Domínios"
          subtitle="Conecte seu próprio domínio ao funil"
        >
          {/* Botão / Input */}
          {showDomainInput ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddDomain()}
                placeholder="meusite.com"
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none text-white"
                style={{ background: '#13141f', border: '1px solid rgba(124,92,252,0.45)' }}
              />
              <Btn onClick={handleAddDomain} primary>Adicionar</Btn>
              <Btn onClick={() => { setShowDomainInput(false); setNewDomain('') }}>Cancelar</Btn>
            </div>
          ) : (
            <button
              onClick={() => setShowDomainInput(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{ background: 'rgba(124,92,252,0.08)', border: '1px dashed rgba(124,92,252,0.35)', color: '#a78bfa' }}
            >
              <PlusIcon /> Novo Domínio
            </button>
          )}

          {/* Domínios cadastrados */}
          {domains.length === 0 && !showDomainInput && (
            <EmptyState icon={<IcoGlobe dim />} label="Nenhum Domínio" />
          )}

          {domains.map(d => (
            <div
              key={d}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: '#1a1b27', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#34d399' }} />
                <span className="text-sm text-white">{d}</span>
              </div>
              <button
                onClick={handleRemoveDomain}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
              >
                Remover
              </button>
            </div>
          ))}
        </Card>

        {/* ── TRÁFEGO E MONITORAMENTO ─────────────────────────────── */}
        <Card
          icon={<IcoChart />}
          title="Tráfego e Monitoramento"
          subtitle="SEO e scripts de rastreamento"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Título do Site">
              <Input value={siteTitle} onChange={setSiteTitle} placeholder="Título na aba do navegador" />
            </Field>

            <Field label="Ativar Robôs de Busca">
              <div
                className="flex items-center justify-between px-4 rounded-xl h-[46px]"
                style={{ background: '#13141f', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {allowIndexing ? 'Ativado' : 'Desativado'}
                </span>
                <button
                  onClick={() => setAllowIndexing(v => !v)}
                  className="relative w-11 h-6 rounded-full transition-all duration-300"
                  style={{ background: allowIndexing ? '#7c5cfc' : 'rgba(255,255,255,0.12)' }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
                    style={{ transform: allowIndexing ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            </Field>
          </div>

          <Field label="Descrição do Site">
            <textarea
              value={siteDescription}
              onChange={e => setSiteDescription(e.target.value)}
              placeholder="Descrição que pode aparecer nos buscadores..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none text-white"
              style={{ background: '#13141f', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(124,92,252,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </Field>

          <Field label="Script de Cabeçalho">
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Barra fake do editor */}
              <div
                className="flex items-center gap-2 px-4 py-2"
                style={{ background: '#0d0e17', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
                <span className="ml-2 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {'<head>'}
                </span>
              </div>
              <textarea
                value={headScript}
                onChange={e => setHeadScript(e.target.value)}
                placeholder="<!-- Cole aqui o script que você deseja adicionar antes de </head> -->"
                rows={5}
                spellCheck={false}
                className="w-full px-4 py-3 text-sm outline-none resize-none font-mono"
                style={{ background: '#13141f', color: '#a78bfa', letterSpacing: '0.02em' }}
              />
            </div>
          </Field>
        </Card>

        {/* ── INTEGRAÇÕES ─────────────────────────────────────────── */}
        <Card
          icon={<IcoBolt />}
          title="Integrações"
          subtitle="Conecte ferramentas externas ao seu funil"
        >
          {/* Integrações salvas */}
          {integrations.map(int => {
            const m = INT_META[int.type]
            return (
              <div
                key={int.type}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl"
                style={{ background: '#1a1b27', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: m.bg, color: m.color }}
                  >
                    {m.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.label}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
                      {int.value}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveIntegration(int.type)}
                  className="text-xs px-2 py-1 rounded-lg shrink-0"
                  style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
                >
                  Remover
                </button>
              </div>
            )
          })}

          {/* Formulário para nova integração */}
          {addingType && (
            <div
              className="p-4 rounded-xl space-y-3"
              style={{ background: '#1a1b27', border: `1px solid ${INT_META[addingType].color}28` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: INT_META[addingType].bg, color: INT_META[addingType].color }}
                >
                  {INT_META[addingType].icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{INT_META[addingType].label}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {INT_META[addingType].description}
                  </p>
                </div>
              </div>
              <input
                autoFocus
                type="text"
                value={addingValue}
                onChange={e => setAddingValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveIntegration()}
                placeholder={INT_META[addingType].placeholder}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none font-mono text-white"
                style={{
                  background: '#13141f',
                  border: `1px solid ${INT_META[addingType].color}40`,
                }}
              />
              <div className="flex gap-2">
                <Btn onClick={handleSaveIntegration} primary full>Salvar</Btn>
                <Btn onClick={() => { setAddingType(null); setAddingValue('') }}>Cancelar</Btn>
              </div>
            </div>
          )}

          {/* Picker de tipo */}
          {showPicker && !addingType && availableTypes.length > 0 && (
            <div
              className="p-3 rounded-xl space-y-2"
              style={{ background: '#1a1b27', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-xs font-medium px-1 mb-2" style={{ color: 'rgba(255,255,255,0.32)' }}>
                Escolha uma integração:
              </p>
              {availableTypes.map(type => {
                const m = INT_META[type]
                return (
                  <button
                    key={type}
                    onClick={() => { setAddingType(type); setShowPicker(false) }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all hover:opacity-90"
                    style={{ background: m.bg, border: `1px solid ${m.color}18` }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${m.color}22`, color: m.color }}
                    >
                      {m.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{m.label}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                        {m.description}
                      </p>
                    </div>
                  </button>
                )
              })}
              <button
                onClick={() => setShowPicker(false)}
                className="w-full py-2 rounded-xl text-sm text-center"
                style={{ color: 'rgba(255,255,255,0.22)' }}
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Botão Nova Integração */}
          {!showPicker && !addingType && availableTypes.length > 0 && (
            <button
              onClick={() => setShowPicker(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{ background: 'rgba(124,92,252,0.08)', border: '1px dashed rgba(124,92,252,0.35)', color: '#a78bfa' }}
            >
              <PlusIcon /> Nova Integração
            </button>
          )}

          {integrations.length === 0 && !showPicker && !addingType && (
            <EmptyState icon={<IcoBolt dim />} label="Nenhuma integração" />
          )}

          {availableTypes.length === 0 && !addingType && integrations.length > 0 && (
            <p className="text-center text-xs py-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
              ✓ Todas as integrações foram adicionadas
            </p>
          )}
        </Card>

        {/* ── BOTÃO SALVAR ─────────────────────────────────────────── */}
        <div className="flex justify-end pb-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
              background: saved ? '#34d399' : '#7c5cfc',
              color: 'white',
              minWidth: 180,
              justifyContent: 'center',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? (
              <>
                <Spinner /> Salvando...
              </>
            ) : saved ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Salvo!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Salvar Configurações
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Componentes auxiliares ────────────────────────────────────────────────

function Card({
  icon, title, subtitle, children,
}: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#13141f', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {icon}
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.42)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({
  value, onChange, placeholder, disabled = false,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
      style={{
        background: disabled ? 'rgba(255,255,255,0.03)' : '#13141f',
        border: '1px solid rgba(255,255,255,0.08)',
        color: disabled ? 'rgba(255,255,255,0.22)' : 'white',
        cursor: disabled ? 'not-allowed' : 'text',
      }}
      onFocus={e => !disabled && (e.target.style.borderColor = 'rgba(124,92,252,0.5)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
    />
  )
}

function Btn({
  onClick, children, primary, full,
}: {
  onClick: () => void; children: React.ReactNode; primary?: boolean; full?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 ${full ? 'flex-1' : ''}`}
      style={{
        background: primary ? '#7c5cfc' : 'rgba(255,255,255,0.06)',
        color: primary ? 'white' : 'rgba(255,255,255,0.45)',
      }}
    >
      {children}
    </button>
  )
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center py-5 space-y-2">
      <div className="flex justify-center">{icon}</div>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>{label}</p>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Ícones das seções ─────────────────────────────────────────────────────

function SectionIcon({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: bg, color }}
    >
      {children}
    </div>
  )
}

function IcoInfo() {
  return (
    <SectionIcon bg="rgba(124,92,252,0.18)" color="#a78bfa">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </SectionIcon>
  )
}

function IcoGlobe({ dim }: { dim?: boolean }) {
  return (
    <SectionIcon bg={dim ? 'transparent' : 'rgba(124,92,252,0.18)'} color={dim ? 'rgba(255,255,255,0.14)' : '#a78bfa'}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    </SectionIcon>
  )
}

function IcoChart() {
  return (
    <SectionIcon bg="rgba(124,92,252,0.18)" color="#a78bfa">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </SectionIcon>
  )
}

function IcoBolt({ dim }: { dim?: boolean }) {
  return (
    <SectionIcon bg={dim ? 'transparent' : 'rgba(124,92,252,0.18)'} color={dim ? 'rgba(255,255,255,0.14)' : '#a78bfa'}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </SectionIcon>
  )
}