'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface TemaData {
  corPrincipal: string
  corTexto: string
  corFundo: string
  modoEscuro: boolean
  espacamento: number
  arredondamento: number
  mostrarMarca: boolean
  logo: string | null
  favicon: string | null
}

interface FlowPageNode {
  id: string
  label: string
  type: 'start' | 'page' | 'function'
}

// ─── Constantes ─────────────────────────────────────────────────────────────

const PRESETS = [
  { nome: 'Synkro',  principal: '#7c5cfc', texto: '#ffffff', fundo: '#0f1018', escuro: true  },
  { nome: 'Ocean',   principal: '#2dd4bf', texto: '#ffffff', fundo: '#0a1628', escuro: true  },
  { nome: 'Sunset',  principal: '#f97316', texto: '#ffffff', fundo: '#1a0800', escuro: true  },
  { nome: 'Rose',    principal: '#f43f5e', texto: '#ffffff', fundo: '#1a0010', escuro: true  },
  { nome: 'Emerald', principal: '#22d387', texto: '#1a1a1a', fundo: '#f0fdf4', escuro: false },
  { nome: 'Minimal', principal: '#6366f1', texto: '#111827', fundo: '#f9fafb', escuro: false },
]

const ESP_LABELS = ['XS', 'SM', 'MD', 'LG', 'XL']
const ESP_PX     = [8, 12, 16, 20, 28]
const RAD_PX     = [0, 6, 12, 20, 999]
const RAD_LABELS = ['0', '6', '12', '20', '∞']

const TEMA_PADRAO: TemaData = {
  corPrincipal: '#7c5cfc',
  corTexto: '#ffffff',
  corFundo: '#0f1018',
  modoEscuro: true,
  espacamento: 2,
  arredondamento: 2,
  mostrarMarca: true,
  logo: null,
  favicon: null,
}

// ─── Preview renderizando os blocos reais ────────────────────────────────────

function PhonePreview({ tema, blocks, pageLabel }: {
  tema: TemaData
  blocks: any[]
  pageLabel: string
}) {
  const pri = tema.corPrincipal
  const txt = tema.corTexto
  const bg  = tema.corFundo
  const pad = ESP_PX[tema.espacamento]
  const rad = RAD_PX[tema.arredondamento]

  function renderBlock(block: any, idx: number) {
    const key = `${block.id || idx}`

    switch (block.compId) {
      case 'cabecalho':
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px 8px', borderBottom: `1px solid ${txt}10`, marginBottom: 2 }}>
            {block.logoFile || block.logoUrl || tema.logo
              ? <img src={block.logoFile || block.logoUrl || tema.logo!} alt="logo" style={{ height: 22, objectFit: 'contain' }} />
              : <div style={{ height: 16, width: 64, borderRadius: 4, background: `${pri}40` }} />
            }
          </div>
        )

      case 'progresso':
        return (
          <div key={key} style={{ padding: `4px ${pad * 0.6}px 6px` }}>
            <div style={{ height: 4, borderRadius: 99, background: `${txt}12`, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${block.progress || 30}%`, background: block.progressColor || pri, borderRadius: 99 }} />
            </div>
          </div>
        )

      case 'titulo':
        return (
          <div key={key} style={{ padding: `4px ${pad * 0.6}px 3px` }}>
            <div style={{
              fontSize: Math.min((block.headlineSize || 18) * 0.55, 14),
              fontWeight: block.headlineFontWeight || 700,
              color: block.headlineColor || txt,
              lineHeight: 1.25,
              textAlign: (block.headlineAlign || 'left') as any,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as any,
            }}>
              {block.headline || 'Título'}
            </div>
            {block.subheadline && (
              <div style={{ fontSize: 9, color: `${txt}65`, marginTop: 2, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                {block.subheadline}
              </div>
            )}
          </div>
        )

      case 'texto':
        return (
          <div key={key} style={{ padding: `2px ${pad * 0.6}px 3px`, fontSize: 9, color: `${txt}65`, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any }}>
            {block.texto}
          </div>
        )

      case 'imagem':
        return (block.imagemFile || block.imagemUrl) ? (
          <div key={key} style={{ padding: `3px ${pad * 0.5}px`, marginBottom: 2 }}>
            <div style={{ borderRadius: Math.min(rad, 10), overflow: 'hidden', height: 80 }}>
              <img src={block.imagemFile || block.imagemUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        ) : (
          <div key={key} style={{ margin: `3px ${pad * 0.5}px`, height: 70, borderRadius: Math.min(rad, 10), background: `${txt}06`, border: `1px dashed ${txt}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={`${txt}25`} strokeWidth="1.2" strokeLinecap="round">
              <rect x="1" y="1" width="14" height="14" rx="2"/><circle cx="5" cy="5" r="1.5"/><path d="M1 10l4-4 3 3 2-2 5 5"/>
            </svg>
          </div>
        )

      case 'botao':
        return (
          <div key={key} style={{ padding: `4px ${pad * 0.6}px`, marginTop: 2 }}>
            <div style={{ width: '100%', padding: '9px 0', borderRadius: rad, background: block.botaoCor || pri, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 12px ${block.botaoCor || pri}45` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: block.botaoTextoCor || '#fff' }}>
                {block.botaoIcone ? `${block.botaoIcone} ` : ''}{block.botaoTexto || 'Continuar →'}
              </span>
            </div>
          </div>
        )

      case 'quiz': {
        const opcoes = block.quizOpcoesDados || (block.quizOpcoes || []).map((t: string) => ({ titulo: t }))
        const cor = block.quizCorSelecionada || pri
        return (
          <div key={key} style={{ padding: `3px ${pad * 0.6}px 4px`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {block.quizPergunta && (
              <div style={{ fontSize: 10, fontWeight: 600, color: txt, marginBottom: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                {block.quizPergunta}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: block.quizColunas === '2' ? '1fr 1fr' : '1fr', gap: 4 }}>
              {opcoes.slice(0, 4).map((op: any, i: number) => (
                <div key={i} style={{ padding: '6px 9px', borderRadius: Math.min(rad, 8), background: i === 0 ? `${cor}18` : `${txt}05`, border: `1.5px solid ${i === 0 ? `${cor}60` : `${txt}0a`}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${i === 0 ? cor : `${txt}25`}`, background: i === 0 ? cor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i === 0 && <svg width="6" height="6" viewBox="0 0 8 8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M1.5 4l2 2L6.5 2"/></svg>}
                  </div>
                  <span style={{ fontSize: 9, color: txt, opacity: i === 0 ? 0.9 : 0.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {op.emoji ? `${op.emoji} ` : ''}{op.titulo || op}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case 'checkout':
        return (
          <div key={key} style={{ padding: `4px ${pad * 0.6}px`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['Nome', 'E-mail', 'Telefone'].map((p, i) => (
              <div key={i} style={{ height: 28, borderRadius: Math.min(rad, 8), background: `${txt}05`, border: `1px solid ${txt}0a`, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                <span style={{ fontSize: 9, color: txt, opacity: 0.28 }}>{p}</span>
              </div>
            ))}
            <div style={{ height: 36, borderRadius: rad, background: block.checkoutCor || pri, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 12px ${block.checkoutCor || pri}45` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{block.checkoutTexto || 'Quero acesso agora →'}</span>
            </div>
          </div>
        )

      case 'preco':
        return (
          <div key={key} style={{ textAlign: 'center', padding: `5px ${pad * 0.6}px` }}>
            {block.precoDe && <div style={{ fontSize: 9, color: `${txt}40`, textDecoration: 'line-through' }}>{block.precoDe}</div>}
            <div style={{ fontSize: 22, fontWeight: 800, color: block.precoCor || pri, lineHeight: 1 }}>{block.precoPor || 'R$97'}</div>
            {block.precoParcelas && <div style={{ fontSize: 8, color: `${txt}45`, marginTop: 2 }}>{block.precoParcelas}</div>}
          </div>
        )

      case 'garantia': {
        const gc = block.garCor || '#22d387'
        return (
          <div key={key} style={{ margin: `3px ${pad * 0.6}px`, padding: '7px 9px', borderRadius: Math.min(rad, 8), background: `${gc}10`, border: `1px solid ${gc}30`, display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={gc} strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <path d="M10 1l7 2.5v7c0 4-3.5 7-7 8.5C6.5 17.5 3 14.5 3 10.5v-7L10 1z"/>
              <path d="M7 10l2.5 2.5 4.5-4.5"/>
            </svg>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: txt }}>Garantia de {block.garDias || 7} dias</div>
              <div style={{ fontSize: 8, color: `${txt}50` }}>{block.garTexto || 'Reembolso garantido'}</div>
            </div>
          </div>
        )
      }

      case 'depoimento':
        return (
          <div key={key} style={{ margin: `3px ${pad * 0.6}px`, padding: '8px 10px', borderRadius: Math.min(rad, 8), background: `${txt}05`, border: `1px solid ${txt}08` }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5 }}>
              {block.depAvatar
                ? <img src={block.depAvatar} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${pri}40`, flexShrink: 0 }} />
              }
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: txt }}>{block.depNome || 'Cliente'}</div>
                <div style={{ color: '#f97316', fontSize: 8 }}>{'★'.repeat(block.depEstrelas || 5)}</div>
              </div>
            </div>
            <div style={{ fontSize: 8, color: `${txt}60`, lineHeight: 1.4, fontStyle: 'italic', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
              "{block.depTexto || 'Depoimento aqui.'}"
            </div>
          </div>
        )

      case 'cronometro':
        return (
          <div key={key} style={{ display: 'flex', justifyContent: 'center', gap: 5, padding: `4px ${pad * 0.6}px` }}>
            {['00', '08', '47'].map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ background: tema.modoEscuro ? `${txt}12` : '#1a1a2e', borderRadius: 6, padding: '4px 7px', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: block.cronoCor || pri, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 7, color: `${txt}35`, marginTop: 2 }}>{['HRS', 'MIN', 'SEG'][i]}</div>
                </div>
                {i < 2 && <span style={{ fontSize: 12, color: block.cronoCor || pri, fontWeight: 800, marginBottom: 10 }}>:</span>}
              </div>
            ))}
          </div>
        )

      case 'progresso':
        return (
          <div key={key} style={{ padding: `4px ${pad * 0.6}px 6px` }}>
            <div style={{ height: 4, borderRadius: 99, background: `${txt}12`, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${block.progress || 30}%`, background: block.progressColor || pri, borderRadius: 99 }} />
            </div>
          </div>
        )

      case 'lista': {
        const itens = block.itens || []
        if (!itens.length) return null
        return (
          <div key={key} style={{ padding: `3px ${pad * 0.6}px`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {itens.slice(0, 4).map((item: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: `${block.checkColor || pri}18`, border: `1.5px solid ${block.checkColor || pri}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke={block.checkColor || pri} strokeWidth="2" strokeLinecap="round"><path d="M1.5 4l2 2L6.5 2"/></svg>
                </div>
                <span style={{ fontSize: 9, color: `${txt}70` }}>{item}</span>
              </div>
            ))}
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div style={{
      width: 290,
      borderRadius: 42,
      overflow: 'hidden',
      background: bg,
      border: '10px solid #1c1d2e',
      boxShadow: '0 48px 120px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Botões laterais */}
      <div style={{ position: 'absolute', left: -12, top: 80, width: 4, height: 28, borderRadius: '2px 0 0 2px', background: '#1c1d2e' }} />
      <div style={{ position: 'absolute', left: -12, top: 120, width: 4, height: 28, borderRadius: '2px 0 0 2px', background: '#1c1d2e' }} />
      <div style={{ position: 'absolute', right: -12, top: 100, width: 4, height: 44, borderRadius: '0 2px 2px 0', background: '#1c1d2e' }} />

      {/* Dynamic Island */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 5, background: bg }}>
        <div style={{ width: 92, height: 24, borderRadius: 14, background: '#000' }} />
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 18px 8px', background: bg }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: txt, opacity: 0.5 }}>9:41</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', opacity: 0.5 }}>
          <svg width="13" height="9" viewBox="0 0 13 9" fill={txt}>
            <rect x="0" y="5" width="2" height="4" rx="0.5"/>
            <rect x="3.5" y="3" width="2" height="6" rx="0.5"/>
            <rect x="7" y="1" width="2" height="8" rx="0.5"/>
            <rect x="10.5" y="0" width="2" height="9" rx="0.5" opacity="0.3"/>
          </svg>
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
            <rect x="0.5" y="0.5" width="14" height="9" rx="2.5" stroke={txt} strokeOpacity="0.5"/>
            <rect x="2" y="2" width="9" height="6" rx="1.5" fill={txt} fillOpacity="0.5"/>
            <path d="M15.5 3.5v3c.9-.4 1.5-1 1.5-1.5s-.6-1.1-1.5-1.5z" fill={txt} fillOpacity="0.5"/>
          </svg>
        </div>
      </div>

      {/* Conteúdo real */}
      <div style={{ background: bg, minHeight: 440, maxHeight: 520, overflowY: 'hidden', paddingBottom: 8 }}>
        {blocks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={`${txt}20`} strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-4-6z"/>
              <path d="M14 2v6h6"/>
            </svg>
            <span style={{ fontSize: 10, color: `${txt}22`, textAlign: 'center', lineHeight: 1.5 }}>
              {pageLabel}<br/>
              <span style={{ fontSize: 9, opacity: 0.6 }}>Adicione blocos no Editor</span>
            </span>
          </div>
        ) : (
          blocks.slice(0, 12).map((block, idx) => renderBlock(block, idx))
        )}
      </div>

      {/* Marca Synkro */}
      {tema.mostrarMarca && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 0 8px', background: bg, borderTop: `1px solid ${txt}08` }}>
          <span style={{ fontSize: 8, color: `${txt}22` }}>Feito com</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: pri, opacity: 0.45 }}>Synkro</span>
        </div>
      )}

      {/* Barra home */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 8px', background: bg }}>
        <div style={{ width: 80, height: 4, borderRadius: 99, background: `${txt}22` }} />
      </div>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function TemaPanel({ projectId }: { projectId: string }) {
  const [tema, setTema]               = useState<TemaData>(TEMA_PADRAO)
  const [presetAtivo, setPresetAtivo] = useState(0)
  const [pages, setPages]             = useState<FlowPageNode[]>([])
  const [selPage, setSelPage]         = useState<FlowPageNode | null>(null)
  const [blocksMap, setBlocksMap]     = useState<Record<string, any[]>>({})
  const [dropdown, setDropdown]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  // ── Carregar ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return
    async function load() {
      // 1. Projeto: tema_data + flow_data
      const { data: proj } = await supabase
        .from('projects')
        .select('tema_data, flow_data')
        .eq('id', projectId)
        .single()

      if (proj?.tema_data) {
        const t = { ...TEMA_PADRAO, ...proj.tema_data }
        setTema(t)
        const idx = PRESETS.findIndex(p => p.principal === t.corPrincipal && p.fundo === t.corFundo)
        setPresetAtivo(idx)
      }

      // 2. Nós do Flow (só start e page)
      const flowNodes: FlowPageNode[] = (proj?.flow_data?.nodes || [])
        .filter((n: any) => n.type === 'start' || n.type === 'page')
        .map((n: any) => ({
          id: n.id,
          label: n.label || (n.type === 'start' ? 'Início' : 'Nova Página'),
          type: n.type,
        }))

      if (flowNodes.length > 0) {
        setPages(flowNodes)
        setSelPage(flowNodes[0])
      }

      // 3. Conteúdo das páginas salvo pelo EditorModal
      // EditorModal salva com: { project_id, node_id, blocks }
      const { data: pagesData } = await supabase
        .from('pages')
        .select('node_id, blocks')
        .eq('project_id', projectId)

      const map: Record<string, any[]> = {}
      pagesData?.forEach((p: any) => {
        if (p.node_id && Array.isArray(p.blocks)) {
          map[p.node_id] = p.blocks
        }
      })
      setBlocksMap(map)
    }
    load()
  }, [projectId])

  // ── Auto-save com debounce ────────────────────────────────────────────────
  const autoSave = useCallback(async (next: TemaData) => {
    if (!projectId) return
    setSaving(true)
    await supabase.from('projects').update({ tema_data: next }).eq('id', projectId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }, [projectId])

  function update(partial: Partial<TemaData>) {
    const next = { ...tema, ...partial }
    setTema(next)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => autoSave(next), 800)
  }

  function aplicarPreset(i: number) {
    const p = PRESETS[i]
    setPresetAtivo(i)
    update({ corPrincipal: p.principal, corTexto: p.texto, corFundo: p.fundo, modoEscuro: p.escuro })
  }

  const currentBlocks = selPage ? (blocksMap[selPage.id] || []) : []

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#0f1018' }}>

      {/* ── PAINEL ESQUERDO ─────────────────────────────────────────────── */}
      <div style={{ width: 288, overflowY: 'auto', padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 12, borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>

        {/* IDENTIDADE */}
        <PanelCard title="Identidade" icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        }>
          <div style={{ display: 'flex', gap: 8 }}>
            <UploadBox label="Logo Padrão"   value={tema.logo}    onChange={v => update({ logo: v })} />
            <UploadBox label="Ícone do Site" value={tema.favicon} onChange={v => update({ favicon: v })} />
          </div>
          <ToggleRow label="Mostrar marca Synkro" value={tema.mostrarMarca} onChange={v => update({ mostrarMarca: v })} color={tema.corPrincipal} />
        </PanelCard>

        {/* ESTILO */}
        <PanelCard title="Estilo" icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        }>
          {/* Presets */}
          <SectionLabel>Presets</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => aplicarPreset(i)} style={{
                padding: '7px 4px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${presetAtivo === i ? p.principal : 'rgba(255,255,255,0.07)'}`,
                background: presetAtivo === i ? `${p.principal}14` : '#1a1b27',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.principal }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.fundo, border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: presetAtivo === i ? p.principal : 'rgba(255,255,255,0.3)' }}>
                  {p.nome}
                </span>
              </button>
            ))}
          </div>

          {/* Cores */}
          <SectionLabel>Cores do Projeto</SectionLabel>
          <ToggleRow label="Modo Escuro" value={tema.modoEscuro} onChange={v => update({ modoEscuro: v })} color={tema.corPrincipal} />
          <ColorRow label="Principal" value={tema.corPrincipal} onChange={v => { setPresetAtivo(-1); update({ corPrincipal: v }) }} />
          <ColorRow label="Texto"     value={tema.corTexto}     onChange={v => { setPresetAtivo(-1); update({ corTexto: v }) }} />
          <ColorRow label="Fundo"     value={tema.corFundo}     onChange={v => { setPresetAtivo(-1); update({ corFundo: v }) }} />

          {/* Espaçamento */}
          <SectionLabel>Espaçamento</SectionLabel>
          <div style={{ display: 'flex', gap: 4 }}>
            {ESP_LABELS.map((e, i) => (
              <button key={i} onClick={() => update({ espacamento: i })} style={{
                flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 9, fontWeight: 700, cursor: 'pointer',
                background: tema.espacamento === i ? `${tema.corPrincipal}20` : '#1a1b27',
                border: `1.5px solid ${tema.espacamento === i ? tema.corPrincipal : 'rgba(255,255,255,0.07)'}`,
                color: tema.espacamento === i ? tema.corPrincipal : 'rgba(255,255,255,0.3)',
                transition: 'all 0.15s',
              }}>{e}</button>
            ))}
          </div>

          {/* Arredondamento */}
          <SectionLabel>Arredondamento</SectionLabel>
          <div style={{ display: 'flex', gap: 4 }}>
            {RAD_LABELS.map((a, i) => (
              <button key={i} onClick={() => update({ arredondamento: i })} style={{
                flex: 1, padding: '6px 0', fontSize: 9, fontWeight: 700, cursor: 'pointer',
                borderRadius: RAD_PX[i] === 999 ? 99 : Math.min(RAD_PX[i], 8),
                background: tema.arredondamento === i ? `${tema.corPrincipal}20` : '#1a1b27',
                border: `1.5px solid ${tema.arredondamento === i ? tema.corPrincipal : 'rgba(255,255,255,0.07)'}`,
                color: tema.arredondamento === i ? tema.corPrincipal : 'rgba(255,255,255,0.3)',
                transition: 'all 0.15s',
              }}>{a}</button>
            ))}
          </div>
        </PanelCard>

        {/* Botão Salvar */}
        <button
          onClick={() => autoSave(tema)}
          disabled={saving}
          style={{
            width: '100%',
            padding: '11px 0',
            borderRadius: 12,
            background: saved ? '#22d387' : saving ? 'rgba(124,92,252,0.4)' : '#7c5cfc',
            border: 'none',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.3s',
            boxShadow: saved ? '0 4px 16px rgba(34,211,135,0.3)' : saving ? 'none' : '0 4px 16px rgba(124,92,252,0.35)',
          }}
        >
          {saving ? (
            <>
              <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Salvando...
            </>
          ) : saved ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 7l3.5 3.5L12 3"/>
              </svg>
              Tema Salvo!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <path d="M17 21v-8H7v8M7 3v5h8"/>
              </svg>
              Salvar Tema
            </>
          )}
        </button>
      </div>

      {/* ── ÁREA DO PREVIEW ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0c0d14', overflow: 'hidden' }}>

        {/* Seletor de página */}
        <div style={{ width: '100%', padding: '13px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setDropdown(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
              borderRadius: 12, background: '#13141f', border: '1px solid rgba(255,255,255,0.1)',
              color: selPage ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
              fontSize: 13, cursor: 'pointer', minWidth: 230, justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
                </svg>
                <span>{selPage?.label ?? 'Selecione a página'}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                style={{ transform: dropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M2 4l4 4 4-4"/>
              </svg>
            </button>

            {dropdown && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: '#1a1b2a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, overflow: 'hidden', zIndex: 50,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                maxHeight: 260, overflowY: 'auto',
              }}>
                {pages.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: 12, color: 'rgba(255,255,255,0.28)', textAlign: 'center' }}>
                    Crie páginas no Flow primeiro
                  </div>
                ) : pages.map((p, i) => (
                  <button key={p.id} onClick={() => { setSelPage(p); setDropdown(false) }} style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 13,
                    color: selPage?.id === p.id ? '#a78bfa' : 'rgba(255,255,255,0.65)',
                    background: selPage?.id === p.id ? 'rgba(124,92,252,0.1)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    borderBottom: i < pages.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      background: p.type === 'start' ? 'rgba(45,212,191,0.15)' : 'rgba(124,92,252,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {p.type === 'start' ? (
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M2 12V4l5-3 5 3v8"/><path d="M5 12V8h4v4"/>
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M8 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L8 1z"/><path d="M8 1v5h5"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: selPage?.id === p.id ? 600 : 400 }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>
                        {blocksMap[p.id]?.length
                          ? `${blocksMap[p.id].length} bloco${blocksMap[p.id].length !== 1 ? 's' : ''}`
                          : 'sem conteúdo'
                        }
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview do celular */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 32px', overflowY: 'auto' }}>
          <PhonePreview
            tema={tema}
            blocks={currentBlocks}
            pageLabel={selPage?.label || ''}
          />
        </div>

        {/* Rodapé */}
        <div style={{ padding: '9px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6" cy="6" r="5"/><path d="M6 5v3M6 3.5v.5"/>
          </svg>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            Todas as mudanças são aplicadas em tempo real no preview
          </span>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} } @keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function PanelCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#13141f', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '13px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ color: '#a78bfa' }}>{icon}</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{title}</span>
      </div>
      <div style={{ padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {children}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 }}>
      {children}
    </div>
  )
}

function ToggleRow({ label, value, onChange, color }: { label: string; value: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderRadius: 11, background: '#1a1b27', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 99, padding: 2, background: value ? color : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', transform: value ? 'translateX(18px)' : 'translateX(0)', transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderRadius: 11, background: '#1a1b27', border: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>{value}</span>
        <label style={{ cursor: 'pointer', position: 'relative' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: value, border: '2px solid rgba(255,255,255,0.12)', cursor: 'pointer' }} />
          <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
        </label>
      </div>
    </div>
  )
}

function UploadBox({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{label}</div>
      <div onClick={() => ref.current?.click()} style={{ height: 84, borderRadius: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#1a1b27', border: '1.5px dashed rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'border-color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,92,252,0.5)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      >
        {value ? (
          <img src={value} alt={label} style={{ maxHeight: 52, maxWidth: '88%', objectFit: 'contain', borderRadius: 5 }} />
        ) : (
          <>
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 3v10M6 7l4-4 4 4M3 15v1a1 1 0 001 1h12a1 1 0 001-1v-1"/>
            </svg>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>Carregar</span>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = ev => onChange(ev.target?.result as string)
          reader.readAsDataURL(file)
        }}
      />
    </div>
  )
}